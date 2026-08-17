'use server';

import { Resend } from 'resend';
import { remetenteDaNotkode } from '@/lib/email-remetente';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { briefingProgress, getOnboardingTemplate } from '@/lib/onboarding-schema';

type Respostas = Record<string, string | string[]>;
type ActionResult = { ok: boolean; error?: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

/** Respostas mínimas para o rascunho valer um aviso (evita avisar por um clique). */
const MIN_RASCUNHO = 3;
/** Intervalo entre avisos do mesmo rascunho, em horas. */
const INTERVALO_AVISO_H = 20;

type BriefingLido = {
  product_name: string | null;
  template_key: string | null;
  draft_notified_at?: string | null;
  organizations: { name?: string } | { name?: string }[] | null;
};

function nomeDoCliente(org: BriefingLido['organizations']): string {
  return (Array.isArray(org) ? org[0]?.name : org?.name) ?? 'Cliente';
}

/**
 * Salva o rascunho (parcial). Não sobrescreve um briefing já enviado.
 *
 * Também é aqui que nasce o aviso de briefing em andamento: o cliente pode
 * responder tudo e fechar a aba sem clicar em "Enviar briefing", e antes esse
 * caso não avisava ninguém — as respostas ficavam no banco e o projeto parado.
 */
export async function saveDraft(token: string, respostas: Respostas): Promise<ActionResult> {
  if (!token) return { ok: false, error: 'token ausente' };
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('onboarding_briefings')
    .update({ respostas, updated_at: new Date().toISOString() })
    .eq('token', token)
    .eq('status', 'rascunho')
    .select('product_name, template_key, draft_notified_at, organizations(name)')
    .maybeSingle();
  if (error) {
    console.error('[onboarding] saveDraft:', error.message);
    return { ok: false, error: error.message };
  }

  if (data) {
    try {
      await avisarRascunho(token, data as BriefingLido, respostas);
    } catch (e) {
      console.error('[onboarding] aviso de rascunho falhou:', e instanceof Error ? e.message : e);
    }
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
    .select('product_name, template_key, organizations(name)')
    .maybeSingle();

  if (error) {
    console.error('[onboarding] submit:', error.message);
    return { ok: false, error: error.message };
  }

  // Notificação por e-mail (best-effort — não bloqueia o envio do cliente).
  try {
    const lido = (data ?? null) as BriefingLido | null;
    const progresso = briefingProgress(getOnboardingTemplate(lido?.template_key), respostas);
    await notify({
      tipo: 'concluido',
      cliente: nomeDoCliente(lido?.organizations ?? null),
      produto: lido?.product_name ?? '',
      ...progresso,
    });
  } catch (e) {
    console.error('[onboarding] notify falhou:', e instanceof Error ? e.message : e);
  }

  return { ok: true };
}

/**
 * Avisa que o cliente está respondendo, no máximo uma vez por dia por
 * briefing: o aviso serve para a gente ir olhar, não para lotar a caixa a
 * cada seção que ele avança.
 */
async function avisarRascunho(token: string, lido: BriefingLido, respostas: Respostas) {
  const progresso = briefingProgress(getOnboardingTemplate(lido.template_key), respostas);
  if (progresso.respondidas < MIN_RASCUNHO) return;

  const ultimo = lido.draft_notified_at ? new Date(lido.draft_notified_at).getTime() : 0;
  if (Date.now() - ultimo < INTERVALO_AVISO_H * 3_600_000) return;

  await notify({
    tipo: 'andamento',
    cliente: nomeDoCliente(lido.organizations),
    produto: lido.product_name ?? '',
    ...progresso,
  });

  const supabase = getSupabaseAdmin();
  await supabase
    .from('onboarding_briefings')
    .update({ draft_notified_at: new Date().toISOString() })
    .eq('token', token);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type Aviso = {
  /** concluido = o cliente clicou em enviar; andamento = rascunho vivo, sem envio. */
  tipo: 'concluido' | 'andamento';
  cliente: string;
  produto: string;
  respondidas: number;
  total: number;
};

async function notify(aviso: Aviso) {
  const key = process.env.RESEND_API_KEY;
  const from = remetenteDaNotkode();
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!key || !from || !to) {
    console.warn('[onboarding] Resend env ausente, e-mail não enviado');
    return;
  }
  const resend = new Resend(key);
  const adminUrl = `${SITE_URL}/admin/onboarding`;
  const concluido = aviso.tipo === 'concluido';
  const c = escapeHtml(aviso.cliente);
  const p = aviso.produto ? escapeHtml(aviso.produto) : '';
  const mono = "'JetBrains Mono',Menlo,Consolas,monospace";
  const sans = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  const selo = concluido ? '❯ briefing concluído' : '❯ briefing em andamento';
  const seloCor = concluido ? '#3b82f6' : '#b45309';
  const contagem = `${aviso.respondidas} de ${aviso.total} perguntas respondidas`;
  const frase = concluido
    ? `concluiu o briefing de onboarding${p ? ` do <strong style="color:#191918">${p}</strong>` : ''}. ${contagem} — as respostas já estão no sistema.`
    : `está respondendo o briefing${p ? ` do <strong style="color:#191918">${p}</strong>` : ''} e ainda não clicou em enviar. Já são ${contagem}, e o que está lá dá para começar a olhar.`;

  const html = `
  <div style="background:#f3f2e7;padding:32px 16px;font-family:${sans}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;border-collapse:collapse">
      <tr><td style="background:#fffef2;border:1px solid rgba(25,25,24,0.10);border-radius:16px;overflow:hidden">
        <div style="padding:16px 28px;border-bottom:1px solid rgba(25,25,24,0.08);background:rgba(25,25,24,0.02)">
          <span style="font-family:${mono};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#83807a">Notkode · Onboarding</span>
        </div>
        <div style="padding:32px 28px 20px">
          <div style="font-family:${mono};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${seloCor};margin-bottom:14px">${selo}</div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#191918;letter-spacing:-0.02em">${c}</h1>
          <p style="margin:0;font-size:15px;line-height:1.5;color:#56544c">${frase}</p>
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

  const textoFrase = concluido
    ? `${aviso.cliente} concluiu o briefing de onboarding${aviso.produto ? ` do ${aviso.produto}` : ''}. ${contagem} — as respostas já estão no sistema.`
    : `${aviso.cliente} está respondendo o briefing${aviso.produto ? ` do ${aviso.produto}` : ''} e ainda não clicou em enviar. Já são ${contagem}.`;

  await resend.emails.send({
    from,
    to,
    subject: concluido
      ? `Briefing concluído — ${aviso.cliente}${aviso.produto ? ` (${aviso.produto})` : ''}`
      : `Briefing em andamento — ${aviso.cliente} respondeu ${aviso.respondidas} de ${aviso.total}`,
    text: `${textoFrase}\n\nVer no admin: ${adminUrl}`,
    html,
  });
}
