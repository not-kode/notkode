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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const c = escapeHtml(cliente);
  const p = produto ? escapeHtml(produto) : '';
  const mono = "'JetBrains Mono',Menlo,Consolas,monospace";
  const sans = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  const html = `
  <div style="background:#f3f2e7;padding:32px 16px;font-family:${sans}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;border-collapse:collapse">
      <tr><td style="background:#fffef2;border:1px solid rgba(25,25,24,0.10);border-radius:16px;overflow:hidden">
        <div style="padding:16px 28px;border-bottom:1px solid rgba(25,25,24,0.08);background:rgba(25,25,24,0.02)">
          <span style="font-family:${mono};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#83807a">Notkode · Onboarding</span>
        </div>
        <div style="padding:32px 28px 20px">
          <div style="font-family:${mono};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#3b82f6;margin-bottom:14px">❯ briefing concluído</div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#191918;letter-spacing:-0.02em">${c}</h1>
          <p style="margin:0;font-size:15px;line-height:1.5;color:#56544c">concluiu o briefing de onboarding${p ? ` do <strong style="color:#191918">${p}</strong>` : ''}. As respostas já estão no sistema.</p>
        </div>
        <div style="padding:0 28px 32px">
          <a href="${adminUrl}" style="display:inline-block;background:#131520;color:#fffef2;text-decoration:none;font-size:14px;font-weight:600;padding:13px 24px;border-radius:10px">Ver as respostas no admin &rarr;</a>
        </div>
        <div style="padding:14px 28px;border-top:1px solid rgba(25,25,24,0.08);background:rgba(25,25,24,0.02)">
          <span style="font-family:${mono};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#a4a29c">notkode.com.br</span>
        </div>
      </td></tr>
    </table>
  </div>`;

  const text = `${cliente} concluiu o briefing de onboarding${produto ? ` do ${produto}` : ''}. As respostas já estão no sistema.\n\nVer no admin: ${adminUrl}`;

  await resend.emails.send({
    from,
    to,
    subject: `Briefing concluído — ${cliente}${produto ? ` (${produto})` : ''}`,
    text,
    html,
  });
}
