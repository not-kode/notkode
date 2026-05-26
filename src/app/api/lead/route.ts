import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getPricingSchema } from '@/lib/lead-schemas';
import { buildLeadEmail } from '@/lib/lead-email';

// ── Payload types ──────────────────────────────────────────────────────────

type PricingPayload = {
  serviceTag: string;
  selection: Record<string, string | string[]>;
  estimatedRange: [number, number];
  lead: { name: string; whatsapp: string; email: string; notes?: string };
};

type QualificationPayload = {
  serviceTag: string;
  kind: 'qualification';
  data: {
    needs: string[];
    name: string;
    email: string;
    whatsapp: string;
    company?: string;
    companySize?: string;
    timing?: string;
    description?: string;
  };
};

type NormalizedLead = {
  service_tag: string;
  page_origin: string | null;
  name: string;
  email: string;
  whatsapp: string;
  notes: string | null;
  selection: Record<string, string | string[]> | null;
  estimated_min: number | null;
  estimated_max: number | null;
};

// ── Normalize both forms into a single shape ───────────────────────────────

function normalize(
  body: PricingPayload | QualificationPayload,
  pageOrigin: string | null
): NormalizedLead | null {
  if ('kind' in body && body.kind === 'qualification') {
    const d = body.data;
    if (!d?.name || !d?.email || !d?.whatsapp) return null;
    const selection: Record<string, string | string[]> = {
      needs: d.needs,
      ...(d.company ? { company: d.company } : {}),
      ...(d.companySize ? { companySize: d.companySize } : {}),
      ...(d.timing ? { timing: d.timing } : {}),
    };
    return {
      service_tag: body.serviceTag,
      page_origin: pageOrigin,
      name: d.name,
      email: d.email,
      whatsapp: d.whatsapp,
      notes: d.description ?? null,
      selection,
      estimated_min: null,
      estimated_max: null,
    };
  }

  const p = body as PricingPayload;
  if (!p.lead?.name || !p.lead?.email || !p.lead?.whatsapp) return null;
  const [min, max] = p.estimatedRange ?? [null, null];
  return {
    service_tag: p.serviceTag,
    page_origin: pageOrigin,
    name: p.lead.name,
    email: p.lead.email,
    whatsapp: p.lead.whatsapp,
    notes: p.lead.notes ?? null,
    selection: p.selection ?? null,
    estimated_min: typeof min === 'number' ? min : null,
    estimated_max: typeof max === 'number' ? max : null,
  };
}

// ── Email rendering (uses the schema's inclusions/timeline/reportTitle) ────

function renderEmails(row: NormalizedLead) {
  const schema = getPricingSchema(row.service_tag);

  const inclusions = schema?.inclusions && row.selection ? schema.inclusions(row.selection) : [];
  const timeline   = schema?.timeline   && row.selection ? schema.timeline(row.selection)   : [];
  const reportTitle = schema?.reportTitle && row.selection
    ? schema.reportTitle(row.selection)
    : prettifyServiceTag(row.service_tag);

  const base = {
    serviceTag: row.service_tag,
    reportTitle,
    estimatedMin: row.estimated_min,
    estimatedMax: row.estimated_max,
    inclusions,
    timeline,
    lead: { name: row.name, email: row.email, whatsapp: row.whatsapp, notes: row.notes },
    pageOrigin: row.page_origin,
  };

  return {
    internal: buildLeadEmail({ ...base, audience: 'internal' }),
    forLead:  buildLeadEmail({ ...base, audience: 'lead' }),
  };
}

function prettifyServiceTag(tag: string): string {
  return tag
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: PricingPayload | QualificationPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const pageOrigin = req.headers.get('referer') ?? null;
  const row = normalize(body, pageOrigin);
  if (!row) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
  }

  // 1. Insert into Supabase
  let supabaseError: string | null = null;
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('leads').insert(row);
    if (error) supabaseError = error.message;
  } catch (e) {
    supabaseError = e instanceof Error ? e.message : 'unknown error';
  }
  if (supabaseError) {
    console.error('[lead] supabase insert failed:', supabaseError);
  }

  // 2. Send notification email + visual proposal to lead (best-effort)
  let internalEmailError: string | null = null;
  let leadEmailError: string | null = null;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.LEAD_FROM_EMAIL;
  const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;

  if (resendKey && fromEmail && notifyEmail) {
    const resend = new Resend(resendKey);
    const { internal, forLead } = renderEmails(row);

    // Internal — notification to Notkode
    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: notifyEmail,
        replyTo: row.email,
        subject: internal.subject,
        html: internal.html,
        text: internal.text,
      });
      if (error) internalEmailError = error.message;
    } catch (e) {
      internalEmailError = e instanceof Error ? e.message : 'unknown error';
    }
    if (internalEmailError) console.error('[lead] internal email failed:', internalEmailError);

    // Lead — visual proposal copy to whoever filled the form
    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: row.email,
        replyTo: notifyEmail,
        subject: forLead.subject,
        html: forLead.html,
        text: forLead.text,
      });
      if (error) leadEmailError = error.message;
    } catch (e) {
      leadEmailError = e instanceof Error ? e.message : 'unknown error';
    }
    if (leadEmailError) console.error('[lead] lead email failed:', leadEmailError);
  } else {
    console.warn('[lead] Resend env vars missing, emails not sent');
  }

  const persisted = supabaseError == null;
  const notified  = internalEmailError == null;
  const leadCopy  = leadEmailError == null && resendKey != null;

  if (!persisted && !notified) {
    return NextResponse.json(
      { ok: false, errors: { supabase: supabaseError, resend: internalEmailError } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, persisted, notified, leadCopy });
}
