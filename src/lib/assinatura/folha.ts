// A folha de assinaturas: a página que entra no fim do documento quando todo
// mundo assinou. É ela que carrega a prova — quem assinou, quando, de onde, e o
// hash do documento que estava na tela na hora da assinatura.

import { escapeHtml, hashLegivel, linkDeVerificacao } from './nucleo';

export type SignerAssinado = {
  nome: string;
  email: string;
  documento: string | null;
  papel: string;
  assinatura_nome: string | null;
  assinatura_imagem: string | null;
  assinado_em: string | null;
  assinado_ip: string | null;
  assinado_user_agent: string | null;
};

const PAPEL_LABEL: Record<string, string> = {
  contratante: 'CONTRATANTE',
  contratada: 'CONTRATADA',
  testemunha: 'TESTEMUNHA',
};

const carimbo = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const data = d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const hora = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `${data} às ${hora} (horário de Brasília)`;
};

export const FOLHA_CSS = `
  .folha { page-break-before: always; padding-top: 8px; }
  .folha .titulo { font-size: 18px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 4px; }
  .folha .sub { font-size: 12.5px; color: #6b6b68; margin-bottom: 22px; }
  .folha .doc-hash { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: #191918; word-break: break-all; background: #F4F5F7; border: 1px solid rgba(25,25,24,.08); border-radius: 6px; padding: 10px 12px; margin-bottom: 22px; }
  .folha .assinante { border-top: 1px solid rgba(25,25,24,.12); padding: 14px 0; page-break-inside: avoid; }
  .folha .assinante:last-of-type { border-bottom: 1px solid rgba(25,25,24,.12); }
  .folha .papel { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: .12em; color: #6b6b68; }
  .folha .nome { font-size: 14px; font-weight: 700; margin-top: 2px; }
  .folha .linha { font-size: 12px; color: #4b4b48; margin-top: 2px; }
  .folha .traco { margin-top: 8px; }
  .folha .traco img { height: 54px; width: auto; }
  .folha .rodape { margin-top: 26px; font-size: 11.5px; color: #6b6b68; line-height: 1.7; }
  .folha .rodape a { color: #3B82F6; text-decoration: none; }
`;

export function folhaDeAssinaturasHtml(opcoes: {
  titulo: string;
  codigo: string;
  documentoHash: string;
  criadoEm: string | null;
  concluidoEm: string | null;
  signatarios: SignerAssinado[];
}): string {
  const { titulo, codigo, documentoHash, criadoEm, concluidoEm, signatarios } = opcoes;

  const blocos = signatarios.map((s) => `
    <div class="assinante">
      <div class="papel">${escapeHtml(PAPEL_LABEL[s.papel] ?? s.papel.toUpperCase())}</div>
      <div class="nome">${escapeHtml(s.nome)}</div>
      ${s.documento ? `<div class="linha">CPF nº ${escapeHtml(s.documento)}</div>` : ''}
      <div class="linha">${escapeHtml(s.email)}</div>
      <div class="linha">Assinado em ${escapeHtml(carimbo(s.assinado_em))}</div>
      <div class="linha">IP ${escapeHtml(s.assinado_ip ?? '—')}</div>
      ${s.assinado_user_agent ? `<div class="linha">Dispositivo: ${escapeHtml(s.assinado_user_agent)}</div>` : ''}
      ${s.assinatura_imagem
        ? `<div class="traco"><img src="${escapeHtml(s.assinatura_imagem)}" alt="Assinatura de ${escapeHtml(s.nome)}"></div>`
        : s.assinatura_nome ? `<div class="linha">Assinatura: ${escapeHtml(s.assinatura_nome)}</div>` : ''}
    </div>`).join('');

  return `
<section class="page folha">
  <div class="titulo">Página de assinaturas</div>
  <div class="sub">${escapeHtml(titulo)}</div>

  <div class="doc-hash">
    Código de verificação: ${escapeHtml(codigo)}<br>
    Documento (SHA-256): ${escapeHtml(hashLegivel(documentoHash))}
  </div>

  ${blocos}

  <div class="rodape">
    Documento enviado para assinatura em ${escapeHtml(carimbo(criadoEm))} e concluído em ${escapeHtml(carimbo(concluidoEm))}.<br>
    A autenticidade deste documento pode ser conferida em
    <a href="${escapeHtml(linkDeVerificacao(codigo))}">${escapeHtml(linkDeVerificacao(codigo))}</a>,
    onde constam o resumo criptográfico acima e a relação de signatários.<br>
    Assinado eletronicamente nos termos do art. 10, § 2º, da MP nº 2.200-2/2001 e da Lei nº 14.063/2020.
  </div>
</section>`;
}
