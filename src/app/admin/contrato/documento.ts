// O documento do contrato, em um lugar só.
//
// Sai como string de HTML, e não como componente, porque o mesmo documento é
// usado em dois pontos: a tela do /admin (que imprime) e o congelamento para
// assinatura, que precisa gravar o arquivo no storage. Renderizar React fora do
// React exigiria react-dom/server, que o Next barra em módulo alcançável pelo
// cliente. Se fossem duas montagens diferentes, o que o cliente assina poderia
// divergir do que a gente vê, então o custo do template cru compensa.

import { DEFAULT_CLIENT_OBLIGATIONS, DEFAULT_PROVIDER_OBLIGATIONS, obligationLines } from './defaults';
import { MODELO_DE_FABRICA, type Bloco, type Modelo } from './modelo';

// CONTRATADA — dados fixos da Notkode.
export const CONTRATADA = {
  razao: 'CAMILA GREGORIO DE SOUZA LTDA',
  fantasia: 'Notkode',
  cnpj: '46.733.108/0001-94',
  endereco: 'Rua Wilson Vallim, nº 67, AP 44, Vila São Paulo, São Paulo – SP, CEP 04651-150',
  rep: 'Camila Gregório de Souza',
  cpf: '425.447.878-05',
};

export type Eng = {
  id: string; title: string | null; type: string; valor: number | null; mrr: number | null;
  start_date: string | null; end_date: string | null; scope: string | null; renewal_note: string | null;
  client_obligations: string | null; provider_obligations: string | null;
  proposal_path: string | null; proposal_name: string | null;
  organizations: {
    name: string | null; legal_name: string | null; tax_id: string | null; legal_rep: string | null; legal_rep_cpf: string | null;
    address_street: string | null; address_number: string | null; address_district: string | null;
    address_city: string | null; address_state: string | null; address_zip: string | null;
  } | null;
};
export type Rec = { description: string | null; amount: number; due_date: string };

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
export const fmtDate = (d: string | null) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

/** Todo dado que vem do banco passa por aqui antes de entrar no HTML. */
export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

// O dia do vencimento das mensalidades sai das próprias parcelas (é o que foi
// combinado com o cliente); sem parcelas, cai no dia do início da vigência.
const DIA_EXTENSO = [
  '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte',
  'vinte e um', 'vinte e dois', 'vinte e três', 'vinte e quatro', 'vinte e cinco', 'vinte e seis',
  'vinte e sete', 'vinte e oito', 'vinte e nove', 'trinta', 'trinta e um',
];
function diaDoVencimento(parcelas: { due_date: string }[], inicio: string | null): string | null {
  const ref = parcelas[0]?.due_date ?? inicio;
  const dia = ref ? Number(ref.split('-')[2]) : NaN;
  if (!dia || dia < 1 || dia > 31) return null;
  return `${String(dia).padStart(2, '0')} (${DIA_EXTENSO[dia]})`;
}
function monthsBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by * 12 + bm) - (ay * 12 + am);
}
export function enderecoOrg(o: NonNullable<Eng['organizations']>): string {
  const parts = [
    o.address_street && o.address_number ? `${o.address_street}, nº ${o.address_number}` : o.address_street,
    o.address_district, [o.address_city, o.address_state].filter(Boolean).join(' – '),
    o.address_zip ? `CEP ${o.address_zip}` : null,
  ].filter(Boolean);
  return parts.join(', ');
}

/** O que ainda falta no cadastro do cliente para o contrato sair completo. */
export function dadosQueFaltam(org: Eng['organizations']): string[] {
  const missing: string[] = [];
  if (!org?.legal_name) missing.push('razão social');
  if (!org?.tax_id) missing.push('CNPJ/CPF');
  if (!org || !enderecoOrg(org)) missing.push('endereço');
  if (!org?.legal_rep) missing.push('representante legal');
  return missing;
}

const ORDINAIS = [
  '', 'Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta', 'Sexta', 'Sétima', 'Oitava', 'Nona',
  'Décima', 'Décima Primeira', 'Décima Segunda', 'Décima Terceira', 'Décima Quarta', 'Décima Quinta',
  'Décima Sexta', 'Décima Sétima', 'Décima Oitava', 'Décima Nona', 'Vigésima',
];

const clausula = (numero: number, titulo: string, itens: string[]) => {
  const ordinal = ORDINAIS[numero] ? `Cláusula ${ORDINAIS[numero]} – ` : `Cláusula ${numero} – `;
  const corpo = itens.map((t, i) => `<div class="item">${numero}.${i + 1}. ${t}</div>`).join('');
  return `<section class="clausula"><h2>${esc(ordinal)}${esc(titulo)}</h2>${corpo}</section>`;
};

/**
 * Marcadores que o texto livre do modelo pode usar. O que não for reconhecido
 * fica como está, para o erro aparecer no documento em vez de sumir calado.
 */
export function marcadores(eng: Eng, parcelas: Rec[]): Record<string, string> {
  const org = eng.organizations;
  const meses = monthsBetween(eng.start_date, eng.end_date);
  const total = parcelas.reduce((s, r) => s + r.amount, 0);
  return {
    cliente: org?.legal_name ?? org?.name ?? '[RAZÃO SOCIAL]',
    cliente_cnpj: org?.tax_id ?? '[CNPJ]',
    cliente_endereco: (org && enderecoOrg(org)) || '[ENDEREÇO]',
    cliente_representante: org?.legal_rep ?? '[REPRESENTANTE]',
    contratada: CONTRATADA.razao,
    contratada_cnpj: CONTRATADA.cnpj,
    contrato: eng.title ?? '',
    escopo: eng.scope ?? '',
    valor_mensal: eng.mrr ? brl(eng.mrr) : '',
    valor_avulso: eng.valor ? brl(eng.valor) : '',
    valor_total: total ? brl(total) : '',
    vigencia_meses: meses ? String(meses) : '',
    inicio: fmtDate(eng.start_date),
    fim: fmtDate(eng.end_date),
  };
}

/** Troca {{marcador}} pelo valor e escapa o resto. */
function aplicarMarcadores(texto: string, valores: Record<string, string>): string {
  return esc(texto).replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (inteiro, chave: string) => {
    const valor = valores[chave.toLowerCase()];
    return valor === undefined ? inteiro : esc(valor);
  });
}

/** Cada linha não vazia do texto livre vira um item numerado da cláusula. */
const linhasDoTexto = (texto: string, valores: Record<string, string>): string[] =>
  texto.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => aplicarMarcadores(l, valores));

/**
 * O miolo do contrato (o que vai dentro de `<div class="doc">`).
 *
 * As cláusulas vêm do modelo; sem modelo, cai no de fábrica. `dataDoDocumento`
 * é a data por extenso do fecho, e `assinaturaEletronica` liga o bloco de
 * assinatura pelo sistema (que fica de fora do contrato impresso).
 */
export function contratoHtml({
  eng,
  parcelas,
  dataDoDocumento,
  assinaturaEletronica = false,
  modelo = MODELO_DE_FABRICA,
}: {
  eng: Eng;
  parcelas: Rec[];
  dataDoDocumento: string;
  assinaturaEletronica?: boolean;
  modelo?: Modelo;
}): string {
  const org = eng.organizations;
  const meses = monthsBetween(eng.start_date, eng.end_date);
  const totalParcelas = parcelas.reduce((s, r) => s + r.amount, 0);
  const hasMrr = (eng.mrr ?? 0) > 0;
  const valores = marcadores(eng, parcelas);

  // ── Blocos automáticos ────────────────────────────────────────────────
  const objeto = (): string[] => {
    // Escopo em várias linhas (a lista de entregáveis puxada da proposta) vira
    // lista de verdade no documento; em linha única, segue como parágrafo.
    const bruto = aplicarMarcadores(
      eng.scope ?? modelo.escopo_padrao
      ?? 'O presente contrato tem por objeto a prestação dos serviços descritos abaixo, conforme escopo acordado entre as partes.',
      valores,
    );
    const linhas = bruto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const eMarcada = (l: string) => /^[•\-*]/.test(l);

    // Cada trecho de linhas com marcador vira uma lista, no lugar onde estava:
    // o texto que vem depois da lista (o limite do escopo, por exemplo) precisa
    // continuar depois dela.
    const itens: string[] = [];
    let lista: string[] = [];
    const fecharLista = () => {
      if (lista.length === 0) return;
      const html = `<ul class="lista">${lista.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
      lista = [];
      // A frase que anuncia a lista ("o escopo compreende:") fica com ela no
      // mesmo item numerado; solta, viraria um item que não diz nada.
      const anterior = itens[itens.length - 1];
      if (anterior && anterior.trim().endsWith(':')) itens[itens.length - 1] = `${anterior} ${html}`;
      else itens.push(html);
    };
    for (const linha of linhas) {
      if (eMarcada(linha)) { lista.push(linha.replace(/^[•\-*]\s*/, '')); continue; }
      fecharLista();
      itens.push(linha);
    }
    fecharLista();
    if (eng.proposal_path) {
      itens.push('O escopo detalhado dos serviços consta na Proposta Comercial anexa, que integra este contrato como <strong>Anexo I</strong>.');
    }
    return itens;
  };

  const pagamento = (): string[] => {
    const valorPontual = eng.valor ?? 0;
    const diaVenc = diaDoVencimento(parcelas, eng.start_date);
    const itens: string[] = [];
    if (hasMrr) {
      itens.push(
        `Pela prestação dos <strong>serviços recorrentes</strong>, a CONTRATANTE pagará o valor mensal de <strong>${esc(brl(eng.mrr!))}</strong>`
        + (diaVenc ? `, vencível todo dia ${esc(diaVenc)} de cada mês` : '')
        + (meses ? `, totalizando <strong>${esc(brl(eng.mrr! * meses))}</strong> ao longo dos ${meses} meses de vigência` : '')
        + '.',
      );
    }
    if (valorPontual > 0) {
      itens.push(
        `Pela prestação dos <strong>serviços pontuais</strong>, a CONTRATANTE pagará o valor de <strong>${esc(brl(valorPontual))}</strong>`
        + (hasMrr ? ', em parcela única devida junto da primeira mensalidade' : '') + '.',
      );
    }
    if (!hasMrr && valorPontual === 0 && parcelas.length > 0) {
      itens.push(`O valor total dos serviços é de <strong>${esc(brl(totalParcelas))}</strong>.`);
    }
    if (parcelas.length > 0) {
      const linhas = parcelas
        .map((r, i) => `<li>${esc(r.description ?? `Parcela ${i + 1}`)} — <strong>${esc(brl(r.amount))}</strong>, com vencimento em ${esc(fmtDate(r.due_date))}.</li>`)
        .join('');
      itens.push(`O pagamento observará o seguinte cronograma:<ul class="parcelas">${linhas}</ul>`);
    }
    itens.push('Os pagamentos serão realizados via PIX, para a chave a ser informada pela CONTRATADA.');
    itens.push('Em caso de atraso no pagamento, será cobrada multa de 10% (dez por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês.');
    itens.push('<strong>Custos de terceiros:</strong> eventuais custos de uso de APIs, integrações e modelos de IA de provedores terceiros, quando aplicáveis ao escopo contratado, são de responsabilidade da CONTRATANTE, cobrados diretamente pelos respectivos provedores, e não estão inclusos no valor deste contrato.');
    return itens;
  };

  const vigencia = (): string[] => {
    const itens = [
      `Este contrato tem vigência ${meses ? `de <strong>${meses} meses</strong>` : 'conforme acordado entre as partes'}`
      + `${eng.start_date ? `, com início em ${esc(fmtDate(eng.start_date))}` : ', com início na data de sua assinatura'}`
      + `${eng.end_date ? ` e término em ${esc(fmtDate(eng.end_date))}` : ''}.`,
    ];
    if (eng.renewal_note) itens.push(esc(eng.renewal_note));
    itens.push('Os prazos e entregas previstos poderão ser prorrogados por acordo mútuo, mediante formalização de Termo Aditivo, especialmente em caso de atraso no fornecimento de acessos ou materiais pela CONTRATANTE.');
    return itens;
  };

  const assinaturaEletronicaItens = (): string[] => [
    'As partes declaram aceitar a assinatura deste contrato por meio eletrônico, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, reconhecendo sua validade e eficácia entre si, ainda que não utilizado certificado digital emitido no âmbito da ICP-Brasil.',
    'A autoria da assinatura é comprovada pelo envio de código de verificação ao endereço eletrônico de cada signatário e pelo registro, na plataforma da CONTRATADA, da data, da hora, do endereço IP e do dispositivo utilizados no ato.',
    'A integridade do documento é assegurada por código de resumo criptográfico (SHA-256) calculado no momento do envio para assinatura, disponível, junto da relação de signatários, na página pública de verificação indicada na página de assinaturas deste instrumento.',
  ];

  const itensDoBloco = (b: Bloco): string[] => {
    switch (b.tipo) {
      case 'objeto': return objeto();
      case 'obrigacoes_cliente': return obligationLines(eng.client_obligations, DEFAULT_CLIENT_OBLIGATIONS).map(esc);
      case 'obrigacoes_contratada': return obligationLines(eng.provider_obligations, DEFAULT_PROVIDER_OBLIGATIONS).map(esc);
      case 'pagamento': return pagamento();
      case 'vigencia': return vigencia();
      case 'assinatura_eletronica': return assinaturaEletronicaItens();
      case 'foro': return ['As partes elegem o foro da Comarca de São Paulo – SP para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.'];
      case 'texto': return linhasDoTexto(b.texto ?? '', valores);
    }
  };

  const blocos = (modelo.clausulas.length ? modelo.clausulas : MODELO_DE_FABRICA.clausulas)
    // A cláusula de assinatura eletrônica só faz sentido no documento que vai
    // ser assinado pelo sistema; no impresso ela sairia mentindo.
    .filter((b) => b.tipo !== 'assinatura_eletronica' || assinaturaEletronica);

  const clausulas = blocos
    .map((b) => ({ bloco: b, itens: itensDoBloco(b) }))
    .filter((c) => c.itens.length > 0)
    .map((c, i) => clausula(i + 1, c.bloco.titulo, c.itens))
    .join('\n  ');

  const cabecalho = `
  <header class="head">
    <img class="brand-logo" src="/brand/logos/logo-horizontal-dark.png" alt="Notkode">
    <div class="doc-title">Contrato de Prestação de Serviços</div>
    ${eng.title ? `<div class="doc-sub">${esc(eng.title)}</div>` : ''}
  </header>`;

  const partes = `
  <section class="parties">
    <p><strong>CONTRATANTE:</strong> ${esc(org?.legal_name ?? '[RAZÃO SOCIAL]')}, pessoa jurídica de direito privado, inscrita no CNPJ/CPF sob nº ${esc(org?.tax_id ?? '[Nº]')}, estabelecida na ${esc((org && enderecoOrg(org)) || '[ENDEREÇO]')}, neste ato representada por seu representante legal infra assinado.</p>
    <p><strong>CONTRATADA:</strong> ${esc(CONTRATADA.razao)} (Nome Fantasia: ${esc(CONTRATADA.fantasia)}), pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${esc(CONTRATADA.cnpj)}, estabelecida na ${esc(CONTRATADA.endereco)}, neste ato representada por seu representante legal infra assinado.</p>
    <p class="lead">As partes, de comum acordo, celebram o presente <strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong>, conforme as cláusulas e condições a seguir estipuladas:</p>
  </section>`;

  const anexo = eng.proposal_path
    ? '<div class="anexo"><p><strong>Anexo I – Proposta Comercial.</strong> A Proposta Comercial anexa faz parte integrante deste contrato, detalhando o escopo dos serviços contratados.</p></div>'
    : '';

  const assinaturas = `
  <div class="signs">
    <div class="sign">
      <div class="line"></div>
      <p class="s-name">${esc(org?.legal_name ?? '[RAZÃO SOCIAL]')}</p>
      ${org?.legal_rep ? `<p class="s-rep">${esc(org.legal_rep)}</p>` : ''}
      ${org?.legal_rep_cpf ? `<p class="s-cpf">CPF nº ${esc(org.legal_rep_cpf)}</p>` : ''}
      <p class="s-role">CONTRATANTE</p>
    </div>
    <div class="sign">
      <div class="line"></div>
      <p class="s-name">${esc(CONTRATADA.razao)}</p>
      <p class="s-rep">${esc(CONTRATADA.rep)}</p>
      <p class="s-cpf">CPF nº ${esc(CONTRATADA.cpf)}</p>
      <p class="s-role">CONTRATADA · ${esc(CONTRATADA.fantasia)}</p>
    </div>
  </div>`;

  return `<main class="page">
  ${cabecalho}
  ${partes}
  ${clausulas}
  ${anexo}
  <p class="close">E por estarem assim justos e contratados, as partes assinam o presente instrumento.</p>
  <p class="local">São Paulo, ${esc(dataDoDocumento)}.</p>
  ${assinaturas}
</main>`;
}

export const CONTRATO_CSS = `
  @page { margin: 14mm 0; }
  html, body { background: #fff !important; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .doc { font-family: 'DM Sans', system-ui, sans-serif; color: #191918; background: #fff; line-height: 1.6; }
  .page { max-width: 780px; margin: 0 auto; background: #fff; padding: 40px 48px; }
  .alert { margin-bottom: 24px; padding: 12px 16px; border-radius: 8px; background: #FEF2F2; border: 1px solid #FCA5A5; color: #B91C1C; font-size: 13px; }
  .head { border-bottom: 2px solid #191918; padding-bottom: 20px; margin-bottom: 28px; }
  .brand-logo { height: 30px; width: auto; display: block; margin-bottom: 18px; }
  .doc-title { font-size: 24px; font-weight: 700; letter-spacing: -.02em; }
  .doc-sub { font-size: 14px; color: #6b6b68; margin-top: 4px; }
  .parties { margin-bottom: 28px; }
  .parties p { margin-bottom: 12px; font-size: 14px; text-align: justify; }
  .parties .lead { margin-top: 18px; }
  .clausula { margin-bottom: 22px; page-break-inside: avoid; }
  .clausula h2 { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: #191918; }
  .clausula p, .clausula .item { font-size: 13.5px; margin-bottom: 6px; text-align: justify; }
  .parcelas { margin: 6px 0 6px 20px; }
  .parcelas li { font-size: 13.5px; margin-bottom: 3px; }
  .lista { margin: 6px 0 6px 20px; }
  .lista li { font-size: 13.5px; margin-bottom: 3px; }
  .anexo { margin-top: 24px; padding: 14px 16px; border: 1px solid rgba(25,25,24,.18); border-radius: 8px; background: #fff; }
  .anexo p { font-size: 13px; }
  .close { margin-top: 28px; font-size: 13.5px; }
  .local { margin-top: 28px; font-size: 13.5px; }
  .signs { display: flex; gap: 48px; margin-top: 64px; page-break-inside: avoid; }
  .sign { flex: 1; text-align: center; }
  .sign .line { border-top: 1px solid #191918; margin-bottom: 8px; }
  .s-name { font-size: 13px; font-weight: 700; }
  .s-rep { font-size: 12.5px; }
  .s-cpf { font-size: 12px; color: #6b6b68; margin-top: 4px; }
  .s-role { font-size: 11px; letter-spacing: .1em; color: #6b6b68; margin-top: 4px; }
  @media print {
    /* Margem lateral vai no padding do conteúdo (funciona em toda página,
       mesmo com "Margens: Nenhuma" no diálogo de impressão). Vertical no @page. */
    .page { margin: 0; max-width: none; padding: 0 18mm; }
    .no-print { display: none !important; }
  }
`;

