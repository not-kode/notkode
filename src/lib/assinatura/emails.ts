// Os e-mails da assinatura: convite, código de acesso e cópia final.
// Best-effort, como o resto do projeto: falha de envio é registrada e devolvida,
// nunca derruba o fluxo de quem está assinando.

import { Resend } from 'resend';
import { escapeHtml, hashLegivel, linkDeAssinatura, linkDeVerificacao } from './nucleo';

const REMETENTE = process.env.LEAD_FROM_EMAIL ?? 'Notkode <contato@notkode.com.br>';
const COPIA_INTERNA = process.env.LEAD_NOTIFICATION_EMAIL ?? null;

const MOLDURA = (corpo: string) => `
<div style="font-family:'DM Sans',system-ui,sans-serif;color:#191918;line-height:1.6;max-width:520px;margin:0 auto;padding:24px">
${corpo}
<p style="margin-top:28px;font-size:12px;color:#6b6b68">Notkode · notkode.com.br</p>
</div>`;

const BOTAO = (href: string, texto: string) => `
<p style="margin:24px 0">
  <a href="${escapeHtml(href)}" style="display:inline-block;background:#3B82F6;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px">${escapeHtml(texto)}</a>
</p>`;

async function enviar(para: string, assunto: string, html: string, texto: string): Promise<string | null> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    console.warn('[assinatura] RESEND_API_KEY ausente, e-mail não enviado');
    return 'RESEND_API_KEY ausente';
  }
  try {
    const { error } = await new Resend(chave).emails.send({
      from: REMETENTE, to: para, subject: assunto, html: MOLDURA(html), text: texto,
    });
    if (error) {
      console.error('[assinatura] falha no envio:', error.message);
      return error.message;
    }
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'erro desconhecido';
    console.error('[assinatura] falha no envio:', msg);
    return msg;
  }
}

/** Convite para assinar, com o link individual do signatário. */
export function enviarConvite(opcoes: { para: string; nome: string; titulo: string; token: string }): Promise<string | null> {
  const link = linkDeAssinatura(opcoes.token);
  const html = `
<p style="font-size:15px">Olá, ${escapeHtml(opcoes.nome)}.</p>
<p style="font-size:15px">O documento <strong>${escapeHtml(opcoes.titulo)}</strong> está pronto para a sua assinatura.</p>
<p style="font-size:15px">É rápido: você abre o documento, confirma um código que enviamos por e-mail e assina na própria página.</p>
${BOTAO(link, 'Ler e assinar')}
<p style="font-size:12.5px;color:#6b6b68">Se o botão não funcionar, copie este endereço: ${escapeHtml(link)}</p>
<p style="font-size:12.5px;color:#6b6b68">Este link é pessoal, não repasse.</p>`;
  const texto = `Olá, ${opcoes.nome}.\n\nO documento "${opcoes.titulo}" está pronto para a sua assinatura: ${link}\n\nEste link é pessoal, não repasse.`;
  return enviar(opcoes.para, `Para assinar: ${opcoes.titulo}`, html, texto);
}

/** Código de 6 dígitos que confirma quem está assinando. */
export function enviarCodigo(opcoes: { para: string; nome: string; codigo: string; titulo: string }): Promise<string | null> {
  const html = `
<p style="font-size:15px">Olá, ${escapeHtml(opcoes.nome)}.</p>
<p style="font-size:15px">Seu código para assinar <strong>${escapeHtml(opcoes.titulo)}</strong>:</p>
<p style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:32px;font-weight:700;letter-spacing:.18em;margin:20px 0">${escapeHtml(opcoes.codigo)}</p>
<p style="font-size:13px;color:#6b6b68">O código vale por 15 minutos. Se não foi você que pediu, ignore este e-mail e não assine nada.</p>`;
  const texto = `Seu código para assinar "${opcoes.titulo}": ${opcoes.codigo}\nO código vale por 15 minutos.`;
  return enviar(opcoes.para, `Seu código de assinatura: ${opcoes.codigo}`, html, texto);
}

/** Cópia do documento assinado, com o hash e o link de verificação. */
export function enviarCopiaFinal(opcoes: {
  para: string; nome: string; titulo: string; codigo: string; hash: string;
}): Promise<string | null> {
  const link = linkDeVerificacao(opcoes.codigo);
  const html = `
<p style="font-size:15px">Olá, ${escapeHtml(opcoes.nome)}.</p>
<p style="font-size:15px">O documento <strong>${escapeHtml(opcoes.titulo)}</strong> foi assinado por todas as partes.</p>
${BOTAO(link, 'Ver documento assinado')}
<p style="font-size:12.5px;color:#6b6b68">Código de verificação: <strong>${escapeHtml(opcoes.codigo)}</strong></p>
<p style="font-size:12.5px;color:#6b6b68;word-break:break-all">Documento (SHA-256): ${escapeHtml(hashLegivel(opcoes.hash))}</p>
<p style="font-size:12.5px;color:#6b6b68">Guarde este e-mail: o código acima identifica o documento assinado e permite conferir, a qualquer momento, que ele não foi alterado.</p>`;
  const texto = `O documento "${opcoes.titulo}" foi assinado por todas as partes.\n\nVerificação: ${link}\nCódigo: ${opcoes.codigo}\nSHA-256: ${opcoes.hash}\n\nGuarde este e-mail.`;
  return enviar(opcoes.para, `Assinado: ${opcoes.titulo}`, html, texto);
}

/** Aviso interno de que alguém assinou. Só sai se houver caixa configurada. */
export function avisarInterno(assunto: string, linha: string): Promise<string | null> {
  if (!COPIA_INTERNA) return Promise.resolve(null);
  return enviar(COPIA_INTERNA, assunto, `<p style="font-size:15px">${escapeHtml(linha)}</p>`, linha);
}
