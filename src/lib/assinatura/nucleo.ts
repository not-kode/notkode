// Núcleo da assinatura eletrônica: congelar o documento, calcular o hash,
// gerar token e código, e registrar a trilha de auditoria.
// Server-side apenas: usa a service-role do Supabase.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { carregarContrato, dataPorExtenso } from '@/lib/contrato/dados';
import { CONTRATO_CSS, contratoHtml } from '@/app/admin/contrato/documento';

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';
export const BUCKET = 'assinaturas';

export type Papel = 'contratante' | 'contratada' | 'testemunha';
export type TipoEvento =
  | 'criado' | 'enviado' | 'aberto' | 'otp_enviado' | 'otp_validado' | 'otp_falhou'
  | 'assinado' | 'recusado' | 'cancelado' | 'concluido';

/** Sem letra ambígua (0/O, 1/I): o código é lido e digitado por gente. */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function codigoDeVerificacao(tamanho = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(tamanho));
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('');
}

export function tokenSecreto(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Código de 6 dígitos enviado por e-mail na hora de assinar. */
export function codigoDeAcesso(): string {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
}

export async function sha256(dado: string | ArrayBuffer): Promise<string> {
  const bytes = typeof dado === 'string' ? new TextEncoder().encode(dado) : new Uint8Array(dado);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Hash mostrado para gente ler: em grupos de 8. */
export function hashLegivel(hash: string): string {
  return (hash.match(/.{1,8}/g) ?? [hash]).join(' ');
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

/** Envelope HTML completo, para o documento abrir sozinho fora do site. */
export function paginaHtml(titulo: string, corpo: string, cssExtra = ''): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titulo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CONTRATO_CSS}${cssExtra}</style>
</head>
<body>
<div class="doc">
${corpo}
</div>
</body>
</html>`;
}

/**
 * Congela o contrato: renderiza o documento como está agora e devolve o HTML
 * junto do sha256 dele. É este par que a assinatura protege — o contrato da
 * tela continua sendo montado ao vivo e pode mudar, o congelado não.
 */
export async function congelarContrato(engagementId: string): Promise<{ html: string; hash: string; titulo: string } | null> {
  const dados = await carregarContrato(engagementId);
  if (!dados) return null;

  const corpo = contratoHtml({
    eng: dados.eng,
    parcelas: dados.parcelas,
    dataDoDocumento: dataPorExtenso(),
    assinaturaEletronica: true,
  });

  const cliente = dados.eng.organizations?.legal_name ?? dados.eng.organizations?.name ?? '';
  const titulo = `Contrato ${dados.eng.title ?? ''} · ${cliente}`.replace(/\s+/g, ' ').trim();
  const html = paginaHtml(titulo, corpo);
  return { html, hash: await sha256(html), titulo };
}

/** Grava uma linha na trilha de auditoria. Nunca deixa o fluxo quebrar por isso. */
export async function registrarEvento(
  requestId: string,
  tipo: TipoEvento,
  extra: { signerId?: string | null; ip?: string | null; userAgent?: string | null; detalhe?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await getSupabaseAdmin().from('signature_events').insert({
      request_id: requestId,
      signer_id: extra.signerId ?? null,
      tipo,
      ip: extra.ip ?? null,
      user_agent: extra.userAgent ?? null,
      detalhe: extra.detalhe ?? {},
    });
  } catch (e) {
    console.error('[assinatura] evento não registrado:', e);
  }
}

/** IP e navegador de quem está do outro lado, para a trilha de auditoria. */
export function origemDaRequisicao(headers: Headers): { ip: string | null; userAgent: string | null } {
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-real-ip')
    ?? null;
  return { ip, userAgent: headers.get('user-agent') };
}

export const linkDeAssinatura = (token: string) => `${SITE}/assinar/${token}`;
export const linkDeVerificacao = (codigo: string) => `${SITE}/verificar/${codigo}`;
