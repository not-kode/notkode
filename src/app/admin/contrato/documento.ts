// O documento do contrato, em um lugar só.
//
// Sai como string de HTML, e não como componente, porque o mesmo documento é
// usado em dois pontos: a tela do /admin (que imprime) e o congelamento para
// assinatura, que precisa gravar o arquivo no storage. Renderizar React fora do
// React exigiria react-dom/server, que o Next barra em módulo alcançável pelo
// cliente. Se fossem duas montagens diferentes, o que o cliente assina poderia
// divergir do que a gente vê, então o custo do template cru compensa.

import { DEFAULT_CLIENT_OBLIGATIONS, DEFAULT_PROVIDER_OBLIGATIONS, obligationLines } from './defaults';

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

const clausula = (titulo: string, corpo: string) =>
  `<section class="clausula"><h2>${esc(titulo)}</h2>${corpo}</section>`;

/**
 * O miolo do contrato (o que vai dentro de `<div class="doc">`).
 * `dataDoDocumento` é a data por extenso do fecho; `assinaturaEletronica`
 * acrescenta a cláusula em que as partes aceitam assinar pelo sistema.
 */
export function contratoHtml({
  eng,
  parcelas,
  dataDoDocumento,
  assinaturaEletronica = false,
}: {
  eng: Eng;
  parcelas: Rec[];
  dataDoDocumento: string;
  assinaturaEletronica?: boolean;
}): string {
  const org = eng.organizations;
  const meses = monthsBetween(eng.start_date, eng.end_date);
  const totalParcelas = parcelas.reduce((s, r) => s + r.amount, 0);
  const hasMrr = (eng.mrr ?? 0) > 0;

  const obrigContratante = obligationLines(eng.client_obligations, DEFAULT_CLIENT_OBLIGATIONS);
  const obrigContratada = obligationLines(eng.provider_obligations, DEFAULT_PROVIDER_OBLIGATIONS);

  // Cláusula de pagamento montada por blocos: recorrente (MRR) e pontual (valor
  // avulso) aparecem separados; depois o cronograma das parcelas reais.
  const valorPontual = eng.valor ?? 0;
  const diaVenc = diaDoVencimento(parcelas, eng.start_date);
  const pgto: string[] = [];
  if (hasMrr) {
    pgto.push(
      `Pela prestação dos <strong>serviços recorrentes</strong>, a CONTRATANTE pagará o valor mensal de <strong>${esc(brl(eng.mrr!))}</strong>`
      + (diaVenc ? `, vencível todo dia ${esc(diaVenc)} de cada mês` : '')
      + (meses ? `, totalizando <strong>${esc(brl(eng.mrr! * meses))}</strong> ao longo dos ${meses} meses de vigência` : '')
      + '.',
    );
  }
  if (valorPontual > 0) {
    pgto.push(
      `Pela prestação dos <strong>serviços pontuais</strong>, a CONTRATANTE pagará o valor de <strong>${esc(brl(valorPontual))}</strong>`
      + (hasMrr ? ', em parcela única devida junto da primeira mensalidade' : '') + '.',
    );
  }
  if (!hasMrr && valorPontual === 0 && parcelas.length > 0) {
    pgto.push(`O valor total dos serviços é de <strong>${esc(brl(totalParcelas))}</strong>.`);
  }
  if (parcelas.length > 0) {
    const itens = parcelas
      .map((r, i) => `<li>${esc(r.description ?? `Parcela ${i + 1}`)} — <strong>${esc(brl(r.amount))}</strong>, com vencimento em ${esc(fmtDate(r.due_date))}.</li>`)
      .join('');
    pgto.push(`O pagamento observará o seguinte cronograma:<ul class="parcelas">${itens}</ul>`);
  }
  pgto.push('Os pagamentos serão realizados via PIX, para a chave a ser informada pela CONTRATADA.');
  pgto.push('Em caso de atraso no pagamento, será cobrada multa de 10% (dez por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês.');
  pgto.push('<strong>Custos de terceiros:</strong> eventuais custos de uso de APIs, integrações e modelos de IA de provedores terceiros, quando aplicáveis ao escopo contratado, são de responsabilidade da CONTRATANTE, cobrados diretamente pelos respectivos provedores, e não estão inclusos no valor deste contrato.');

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

  const objeto = clausula('Cláusula Primeira – Do Objeto',
    `<p>${esc(eng.scope ?? 'O presente contrato tem por objeto a prestação dos serviços descritos abaixo, conforme escopo acordado entre as partes.')}</p>`
    + (eng.proposal_path ? '<p>O escopo detalhado dos serviços consta na Proposta Comercial anexa, que integra este contrato como <strong>Anexo I</strong>.</p>' : ''),
  );

  const obrigacoes = (numero: number, titulo: string, linhas: string[]) =>
    clausula(titulo, linhas.map((l, i) => `<p>${numero}.${i + 1}. ${esc(l)}</p>`).join(''));

  const pagamento = clausula('Cláusula Quarta – Do Valor e Condições de Pagamento',
    pgto.map((n, i) => `<div class="item">4.${i + 1}. ${n}</div>`).join(''),
  );

  const prazo = clausula('Cláusula Quinta – Do Prazo Contratual e Renovação',
    `<p>5.1. Este contrato tem vigência ${meses ? `de <strong>${meses} meses</strong>` : 'conforme acordado entre as partes'}`
    + `${eng.start_date ? `, com início em ${esc(fmtDate(eng.start_date))}` : ', com início na data de sua assinatura'}`
    + `${eng.end_date ? ` e término em ${esc(fmtDate(eng.end_date))}` : ''}.</p>`
    + (eng.renewal_note ? `<p>5.2. ${esc(eng.renewal_note)}</p>` : '')
    + `<p>${eng.renewal_note ? '5.3.' : '5.2.'} Os prazos e entregas previstos poderão ser prorrogados por acordo mútuo, mediante formalização de Termo Aditivo, especialmente em caso de atraso no fornecimento de acessos ou materiais pela CONTRATANTE.</p>`,
  );

  const rescisao = clausula('Cláusula Sexta – Da Rescisão e Multa',
    '<p>6.1. Qualquer das partes poderá rescindir o presente contrato mediante notificação prévia por escrito com antecedência mínima de 30 (trinta) dias.</p>'
    + (hasMrr
      ? '<p>6.2. Em caso de rescisão antecipada por iniciativa da CONTRATANTE, antes do término da vigência, será devida multa compensatória equivalente a 3 (três) mensalidades do valor vigente, a título de ressarcimento pelos serviços prestados e investimentos realizados.</p>'
      : '<p>6.2. Em caso de rescisão antecipada por iniciativa da CONTRATANTE, serão devidos os valores correspondentes aos serviços já executados até a data da rescisão, acrescidos das despesas comprovadamente incorridas pela CONTRATADA.</p>')
    + '<p>6.3. Em caso de inadimplência superior a 30 (trinta) dias, a CONTRATADA poderá suspender a prestação dos serviços e o acesso aos entregáveis e rescindir o contrato, mantendo o direito ao recebimento dos valores em aberto acrescidos das penalidades previstas na Cláusula Quarta.</p>'
    + '<p>6.4. Se a CONTRATANTE não fornecer os acessos e informações necessários em tempo hábil, os prazos serão ajustados proporcionalmente, sem penalidade para a CONTRATADA.</p>',
  );

  const propriedade = clausula('Cláusula Sétima – Da Propriedade Intelectual e Titularidade dos Dados',
    '<p>7.1. Após o pagamento integral dos valores devidos, a CONTRATANTE terá propriedade exclusiva dos entregáveis produzidos no âmbito deste contrato, incluindo, quando aplicável, código-fonte, configurações e materiais desenvolvidos.</p>'
    + '<p>7.2. Todos os dados, leads, históricos de atendimento e informações geradas no âmbito dos serviços são de propriedade exclusiva da CONTRATANTE, que poderá exportá-los a qualquer momento.</p>'
    + '<p>7.3. A CONTRATADA se compromete a manter sigilo sobre todas as informações confidenciais da CONTRATANTE a que tiver acesso em razão deste contrato.</p>',
  );

  const eletronica = assinaturaEletronica ? clausula('Cláusula Oitava – Da Assinatura Eletrônica',
    '<p>8.1. As partes declaram aceitar a assinatura deste contrato por meio eletrônico, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, reconhecendo sua validade e eficácia entre si, ainda que não utilizado certificado digital emitido no âmbito da ICP-Brasil.</p>'
    + '<p>8.2. A autoria da assinatura é comprovada pelo envio de código de verificação ao endereço eletrônico de cada signatário e pelo registro, na plataforma da CONTRATADA, da data, da hora, do endereço IP e do dispositivo utilizados no ato.</p>'
    + '<p>8.3. A integridade do documento é assegurada por código de resumo criptográfico (SHA-256) calculado no momento do envio para assinatura, disponível, junto da relação de signatários, na página pública de verificação indicada na página de assinaturas deste instrumento.</p>',
  ) : '';

  const foro = clausula(assinaturaEletronica ? 'Cláusula Nona – Do Foro' : 'Cláusula Oitava – Do Foro',
    `<p>${assinaturaEletronica ? '9.1.' : '8.1.'} As partes elegem o foro da Comarca de São Paulo – SP para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>`,
  );

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
  ${objeto}
  ${obrigacoes(2, 'Cláusula Segunda – Das Obrigações da Contratante', obrigContratante)}
  ${obrigacoes(3, 'Cláusula Terceira – Das Obrigações da Contratada', obrigContratada)}
  ${pagamento}
  ${prazo}
  ${rescisao}
  ${propriedade}
  ${eletronica}
  ${foro}
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
