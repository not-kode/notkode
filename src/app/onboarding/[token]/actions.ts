'use server';

import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type Respostas = Record<string, string | string[]>;
type ActionResult = { ok: boolean; error?: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

/** Salva o rascunho (parcial). Não sobrescreve um briefing já enviado. */
export async function saveDraft(token: string, respostas: Respostas): Promise<ActionResult> {
  if (!token) return { ok: false, error: 'token ausente' };
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('onboarding_briefings')
    .update({ respostas, updated_at: new Date().toISOString() })
    .eq('token', token)
    .eq('status', 'rascunho');
  if (error) {
    console.error('[onboarding] saveDraft:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Marca como enviado, carimba a data e notifica a Notkode por e-mail. */
export async function submitBriefing(token: string, respostas: Respostas): Promise<ActionResult> {
  if (!token) return { ok: false, error: 'token ausente' };
  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('onboarding_briefings')
    .update({ respostas, status: 'enviado', submitted_at: nowIso, updated_at: nowIso })
    .eq('token', token)
    .select('product_name, organizations(name)')
    .maybeSingle();

  if (error) {
    console.error('[onboarding] submit:', error.message);
    return { ok: false, error: error.message };
  }

  // Notificação por e-mail (best-effort — não bloqueia o envio do cliente).
  try {
    const org = data?.organizations as { name?: string } | { name?: string }[] | null;
    const cliente = (Array.isArray(org) ? org[0]?.name : org?.name) ?? 'Cliente';
    const produto = (data?.product_name as string) ?? '';
    await notify(cliente, produto);
  } catch (e) {
    console.error('[onboarding] notify falhou:', e instanceof Error ? e.message : e);
  }

  return { ok: true };
}

async function notify(cliente: string, produto: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM_EMAIL;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!key || !from || !to) {
    console.warn('[onboarding] Resend env ausente, e-mail não enviado');
    return;
  }
  const resend = new Resend(key);
  const adminUrl = `${SITE_URL}/admin/onboarding`;
  await resend.emails.send({
    from,
    to,
    subject: `📋 Briefing concluído — ${cliente}${produto ? ` (${produto})` : ''}`,
    text: `${cliente} concluiu o briefing de onboarding${produto ? ` do ${produto}` : ''}.\n\nVeja as respostas no admin: ${adminUrl}`,
    html:
      `<p><strong>${cliente}</strong> concluiu o briefing de onboarding` +
      `${produto ? ` do <strong>${produto}</strong>` : ''}.</p>` +
      `<p><a href="${adminUrl}">Ver as respostas no admin →</a></p>`,
  });
}
