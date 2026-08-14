import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { remetenteDaNotkode } from '@/lib/email-remetente';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getPricingSchema } from '@/lib/lead-schemas';
import { buildLeadEmail } from '@/lib/lead-email';
import { emailValido, whatsappValido } from '@/lib/validacao-contato';

// ── Payload types ──────────────────────────────────────────────────────────

type PricingPayload = {
  serviceTag: string;
  selection: Record<string, string | string[]>;
  lead: { name: string; whatsapp: string; email: string; notes?: string; company?: string };
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

type Utm = {
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_term?: string; utm_content?: string;
};

type NormalizedLead = {
  service_tag: string;
  page_origin: string | null;
  name: string;
  email: string;
  whatsapp: string;
  notes: string | null;
  selection: Record<string, string | string[]> | null;
  session_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
};

// Extrai só os 5 campos utm_* conhecidos do payload (o resto é ignorado).
function pickUtm(raw: unknown): Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content', string | null> {
  const u = (raw ?? {}) as Utm;
  const s = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 128) : null);
  return {
    utm_source: s(u.utm_source), utm_medium: s(u.utm_medium), utm_campaign: s(u.utm_campaign),
    utm_term: s(u.utm_term), utm_content: s(u.utm_content),
  };
}

// ── Normalize both forms into a single shape ───────────────────────────────

function normalize(
  body: PricingPayload | QualificationPayload,
  pageOrigin: string | null
): NormalizedLead | null {
  const utm = pickUtm((body as { utm?: unknown }).utm);
  const sidRaw = (body as { session_id?: unknown }).session_id;
  const session_id = typeof sidRaw === 'string' && sidRaw.trim() ? sidRaw.trim().slice(0, 64) : null;
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
      session_id,
      ...utm,
    };
  }

  const p = body as PricingPayload;
  if (!p.lead?.name || !p.lead?.email || !p.lead?.whatsapp) return null;
  const selection: Record<string, string | string[]> = {
    ...(p.selection ?? {}),
    ...(p.lead.company ? { company: p.lead.company } : {}),
  };
  return {
    service_tag: p.serviceTag,
    page_origin: pageOrigin,
    name: p.lead.name,
    email: p.lead.email,
    whatsapp: p.lead.whatsapp,
    notes: p.lead.notes ?? null,
    selection,
    session_id,
    ...utm,
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

/**
 * Aviso interno de que um lead quase se perdeu.
 *
 * Quem preencheu continua vendo a tela de sucesso, sempre: erro nosso não é problema
 * dela. Mas alguém precisa saber, com os dados na mão, para retomar o contato no braço.
 * Vai para LEAD_ALERT_EMAIL, ou para o mesmo endereço das notificações de lead.
 */
async function avisarFalhaInterna(motivo: string, dados: unknown) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = remetenteDaNotkode();
  const paraEmail = process.env.LEAD_ALERT_EMAIL ?? process.env.LEAD_NOTIFICATION_EMAIL;
  const corpo = JSON.stringify(dados, null, 2);

  // O log fica de qualquer jeito: se o próprio Resend for o que caiu, é o que sobra.
  console.error(`[lead][ALERTA] ${motivo}\n${corpo}`);
  if (!resendKey || !fromEmail || !paraEmail) return;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: fromEmail,
      to: paraEmail,
      subject: `[ALERTA] Lead não registrado: ${motivo}`,
      text: [
        'Um formulário do site foi enviado e a gente não conseguiu registrar direito.',
        'A pessoa viu a tela de sucesso normalmente, então o retorno precisa partir da gente.',
        '',
        `Motivo: ${motivo}`,
        '',
        'Dados recebidos:',
        corpo,
      ].join('\n'),
    });
  } catch (e) {
    console.error('[lead][ALERTA] falhou até o e-mail de alerta:', e instanceof Error ? e.message : e);
  }
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
    // O formulário já trava sem nome, e-mail e WhatsApp. Se chegou assim, algo furou o
    // caminho: avisa em vez de descartar em silêncio, que foi o que sempre aconteceu.
    await avisarFalhaInterna('faltou nome, e-mail ou WhatsApp', body);
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
  }
  if (!emailValido(row.email) || !whatsappValido(row.whatsapp)) {
    await avisarFalhaInterna('e-mail ou WhatsApp em formato inválido', row);
    return NextResponse.json({ error: 'invalid contact' }, { status: 400 });
  }

  // 1. Insert into Supabase
  let supabaseError: string | null = null;
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('lead_submissions').insert(row);
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
  const fromEmail = remetenteDaNotkode();
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

  // Gravou mas não avisou, ou avisou mas não gravou: o lead existe pela metade e alguém
  // precisa saber com os dados em mãos. Quem preencheu segue vendo sucesso.
  if (!persisted || !notified) {
    const motivo = !persisted && !notified
      ? 'falhou gravar no banco e avisar por e-mail'
      : !persisted
        ? `falhou gravar no banco (${supabaseError})`
        : `falhou o e-mail de notificação (${internalEmailError})`;
    await avisarFalhaInterna(motivo, row);
  }

  if (!persisted && !notified) {
    return NextResponse.json(
      { ok: false, errors: { supabase: supabaseError, resend: internalEmailError } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, persisted, notified, leadCopy });
}
