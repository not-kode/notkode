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

export type DadosDoAto = {
  nome: string; email: string; quando: string | null; ip: string | null; dispositivo: string | null;
};

const carimbo = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às ${d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (horário de Brasília)`;
};

/**
 * Recibo da assinatura, enviado na hora para quem acabou de assinar.
 *
 * Vai separado da cópia final de propósito: entre a primeira assinatura e a
 * última pode levar dias, e quem assinou precisa ter na mão, imediatamente, o
 * registro do que foi feito em nome dele.
 */
export function enviarReciboDeAssinatura(opcoes: {
  para: string; nome: string; titulo: string; codigo: string; hash: string;
  quando: string | null; ip: string | null; dispositivo: string | null; faltam: number;
}): Promise<string | null> {
  const link = linkDeVerificacao(opcoes.codigo);
  const html = `
<p style="font-size:15px">Olá, ${escapeHtml(opcoes.nome)}.</p>
<p style="font-size:15px">Sua assinatura em <strong>${escapeHtml(opcoes.titulo)}</strong> foi registrada.</p>
<table style="font-size:13px;color:#4b4b48;border-collapse:collapse;margin:18px 0">
  <tr><td style="padding:3px 12px 3px 0;color:#6b6b68">Data e hora</td><td>${escapeHtml(carimbo(opcoes.quando))}</td></tr>
  <tr><td style="padding:3px 12px 3px 0;color:#6b6b68">Endereço IP</td><td>${escapeHtml(opcoes.ip ?? '—')}</td></tr>
  <tr><td style="padding:3px 12px 3px 0;color:#6b6b68">Dispositivo</td><td>${escapeHtml(opcoes.dispositivo ?? '—')}</td></tr>
  <tr><td style="padding:3px 12px 3px 0;color:#6b6b68">E-mail</td><td>${escapeHtml(opcoes.para)}</td></tr>
</table>
<p style="font-size:13px;color:#4b4b48">${opcoes.faltam > 0
  ? `Ainda ${opcoes.faltam === 1 ? 'falta 1 signatário' : `faltam ${opcoes.faltam} signatários`}. Quando todos assinarem, você recebe a cópia final do documento.`
  : 'Todas as partes assinaram. A cópia final do documento vai em outro e-mail.'}</p>
${BOTAO(link, 'Acompanhar o documento')}
<p style="font-size:12.5px;color:#6b6b68">Código de verificação: <strong>${escapeHtml(opcoes.codigo)}</strong></p>
<p style="font-size:12.5px;color:#6b6b68;word-break:break-all">Documento (SHA-256): ${escapeHtml(hashLegivel(opcoes.hash))}</p>
<p style="font-size:12.5px;color:#6b6b68">Se não foi você que assinou, responda este e-mail imediatamente.</p>`;
  const texto = `Sua assinatura em "${opcoes.titulo}" foi registrada.\n\n`
    + `Data e hora: ${carimbo(opcoes.quando)}\nIP: ${opcoes.ip ?? '—'}\nDispositivo: ${opcoes.dispositivo ?? '—'}\n`
    + `E-mail: ${opcoes.para}\n\nVerificação: ${link}\nCódigo: ${opcoes.codigo}\nSHA-256: ${opcoes.hash}\n\n`
    + 'Se não foi você que assinou, responda este e-mail imediatamente.';
  return enviar(opcoes.para, `Assinatura registrada: ${opcoes.titulo}`, html, texto);
}

/** Cópia do documento assinado, com o hash, os dados de cada assinatura e o link. */
export function enviarCopiaFinal(opcoes: {
  para: string; nome: string; titulo: string; codigo: string; hash: string; atos: DadosDoAto[];
}): Promise<string | null> {
  const link = linkDeVerificacao(opcoes.codigo);
  const linhas = opcoes.atos.map((a) => `
  <tr>
    <td style="padding:6px 12px 6px 0;border-top:1px solid #eee">
      <strong>${escapeHtml(a.nome)}</strong><br>
      <span style="color:#6b6b68">${escapeHtml(a.email)}</span>
    </td>
    <td style="padding:6px 0;border-top:1px solid #eee;color:#4b4b48">
      ${escapeHtml(carimbo(a.quando))}<br>
      <span style="color:#6b6b68">IP ${escapeHtml(a.ip ?? '—')}</span>
    </td>
  </tr>`).join('');

  const html = `
<p style="font-size:15px">Olá, ${escapeHtml(opcoes.nome)}.</p>
<p style="font-size:15px">O documento <strong>${escapeHtml(opcoes.titulo)}</strong> foi assinado por todas as partes.</p>
<table style="font-size:13px;width:100%;border-collapse:collapse;margin:18px 0">${linhas}</table>
${BOTAO(link, 'Ver documento assinado')}
<p style="font-size:12.5px;color:#6b6b68">Código de verificação: <strong>${escapeHtml(opcoes.codigo)}</strong></p>
<p style="font-size:12.5px;color:#6b6b68;word-break:break-all">Documento (SHA-256): ${escapeHtml(hashLegivel(opcoes.hash))}</p>
<p style="font-size:12.5px;color:#6b6b68">Guarde este e-mail: o código acima identifica o documento assinado e permite conferir, a qualquer momento, que ele não foi alterado.</p>`;

  const texto = `O documento "${opcoes.titulo}" foi assinado por todas as partes.\n\n`
    + opcoes.atos.map((a) => `${a.nome} (${a.email}) — ${carimbo(a.quando)} — IP ${a.ip ?? '—'}`).join('\n')
    + `\n\nVerificação: ${link}\nCódigo: ${opcoes.codigo}\nSHA-256: ${opcoes.hash}\n\nGuarde este e-mail.`;
  return enviar(opcoes.para, `Assinado: ${opcoes.titulo}`, html, texto);
}

/** Aviso interno de que alguém assinou. Só sai se houver caixa configurada. */
export function avisarInterno(assunto: string, linha: string): Promise<string | null> {
  if (!COPIA_INTERNA) return Promise.resolve(null);
  return enviar(COPIA_INTERNA, assunto, `<p style="font-size:15px">${escapeHtml(linha)}</p>`, linha);
}
