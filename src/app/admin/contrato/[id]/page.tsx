import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PrintButton } from './print-button';
import { DEFAULT_CLIENT_OBLIGATIONS, DEFAULT_PROVIDER_OBLIGATIONS, obligationLines } from '../defaults';
import { loadAnexoProposta } from '../anexo';

export const dynamic = 'force-dynamic';

// CONTRATADA — dados fixos da Notkode.
const CONTRATADA = {
  razao: 'CAMILA GREGORIO DE SOUZA LTDA',
  fantasia: 'Notkode',
  cnpj: '46.733.108/0001-94',
  endereco: 'Rua Wilson Vallim, nº 67, AP 44, Vila São Paulo, São Paulo – SP, CEP 04651-150',
  rep: 'Camila Gregório de Souza',
  cpf: '425.447.878-05',
};

type Eng = {
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
type Rec = { description: string | null; amount: number; due_date: string };

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
const fmtDate = (d: string | null) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};
function monthsBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by * 12 + bm) - (ay * 12 + am);
}
function enderecoOrg(o: NonNullable<Eng['organizations']>): string {
  const parts = [
    o.address_street && o.address_number ? `${o.address_street}, nº ${o.address_number}` : o.address_street,
    o.address_district, [o.address_city, o.address_state].filter(Boolean).join(' – '),
    o.address_zip ? `CEP ${o.address_zip}` : null,
  ].filter(Boolean);
  return parts.join(', ');
}

export default async function ContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [{ data: engData }, { data: recData }] = await Promise.all([
    supabase
      .from('engagements')
      .select('id, title, type, valor, mrr, start_date, end_date, scope, renewal_note, client_obligations, provider_obligations, proposal_path, proposal_name, organizations(name, legal_name, tax_id, legal_rep, legal_rep_cpf, address_street, address_number, address_district, address_city, address_state, address_zip)')
      .eq('id', id)
      .single(),
    supabase.from('receivables').select('description, amount, due_date').eq('engagement_id', id).order('due_date'),
  ]);

  const eng = engData as unknown as Eng | null;
  if (!eng) notFound();
  const org = eng.organizations;
  const parcelas = (recData ?? []) as Rec[];
  const anexo = await loadAnexoProposta(supabase, eng.proposal_path);

  const meses = monthsBetween(eng.start_date, eng.end_date);
  const totalParcelas = parcelas.reduce((s, r) => s + r.amount, 0);
  const hasMrr = (eng.mrr ?? 0) > 0;

  const obrigContratante = obligationLines(eng.client_obligations, DEFAULT_CLIENT_OBLIGATIONS);
  const obrigContratada = obligationLines(eng.provider_obligations, DEFAULT_PROVIDER_OBLIGATIONS);

  // Cláusula de pagamento montada por blocos: recorrente (MRR) e pontual (valor avulso)
  // aparecem separados; depois o cronograma das parcelas reais.
  const valorPontual = eng.valor ?? 0;
  const pgto: React.ReactNode[] = [];
  if (hasMrr) {
    pgto.push(
      <>Pela prestação dos <strong>serviços recorrentes</strong>, a CONTRATANTE pagará o valor mensal de <strong>{brl(eng.mrr!)}</strong>, vencível todo dia 10 (dez) de cada mês{meses ? <>, totalizando <strong>{brl(eng.mrr! * meses)}</strong> ao longo dos {meses} meses de vigência</> : null}.</>,
    );
  }
  if (valorPontual > 0) {
    pgto.push(
      <>Pela prestação dos <strong>serviços pontuais</strong>, a CONTRATANTE pagará o valor de <strong>{brl(valorPontual)}</strong>{hasMrr ? ', em parcela única devida junto da primeira mensalidade' : ''}.</>,
    );
  }
  if (!hasMrr && valorPontual === 0 && parcelas.length > 0) {
    pgto.push(<>O valor total dos serviços é de <strong>{brl(totalParcelas)}</strong>.</>);
  }
  if (parcelas.length > 0) {
    pgto.push(
      <>O pagamento observará o seguinte cronograma:
        <ul className="parcelas">
          {parcelas.map((r, i) => (
            <li key={i}>{r.description ?? `Parcela ${i + 1}`} — <strong>{brl(r.amount)}</strong>, com vencimento em {fmtDate(r.due_date)}.</li>
          ))}
        </ul>
      </>,
    );
  }
  pgto.push(<>Os pagamentos serão realizados via PIX, para a chave a ser informada pela CONTRATADA.</>);
  pgto.push(<>Em caso de atraso no pagamento, será cobrada multa de 10% (dez por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês.</>);
  pgto.push(<><strong>Custos de terceiros:</strong> eventuais custos de uso de APIs, integrações e modelos de IA de provedores terceiros, quando aplicáveis ao escopo contratado, são de responsabilidade da CONTRATANTE, cobrados diretamente pelos respectivos provedores, e não estão inclusos no valor deste contrato.</>);

  const missing: string[] = [];
  if (!org?.legal_name) missing.push('razão social');
  if (!org?.tax_id) missing.push('CNPJ/CPF');
  if (!enderecoOrg(org!)) missing.push('endereço');
  if (!org?.legal_rep) missing.push('representante legal');

  return (
    <div className="doc">
        {anexo && (
          <>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap" />
            <style>{anexo.css}</style>
          </>
        )}
        <style>{CSS}</style>
        <PrintButton />

        <main className="page">
          {missing.length > 0 && (
            <div className="no-print alert">
              Faltam dados cadastrais deste cliente: <strong>{missing.join(', ')}</strong>. Preencha no cliente antes de assinar.
            </div>
          )}

          <header className="head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-logo" src="/brand/logos/logo-horizontal-dark.png" alt="Notkode" />
            <div className="doc-title">Contrato de Prestação de Serviços</div>
            {eng.title && <div className="doc-sub">{eng.title}</div>}
          </header>

          <section className="parties">
            <p><strong>CONTRATANTE:</strong> {org?.legal_name ?? '[RAZÃO SOCIAL]'}, pessoa jurídica de direito privado, inscrita no CNPJ/CPF sob nº {org?.tax_id ?? '[Nº]'}, estabelecida na {enderecoOrg(org!) || '[ENDEREÇO]'}, neste ato representada por seu representante legal infra assinado.</p>
            <p><strong>CONTRATADA:</strong> {CONTRATADA.razao} (Nome Fantasia: {CONTRATADA.fantasia}), pessoa jurídica de direito privado, inscrita no CNPJ sob nº {CONTRATADA.cnpj}, estabelecida na {CONTRATADA.endereco}, neste ato representada por seu representante legal infra assinado.</p>
            <p className="lead">As partes, de comum acordo, celebram o presente <strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong>, conforme as cláusulas e condições a seguir estipuladas:</p>
          </section>

          <Clausula titulo="Cláusula Primeira – Do Objeto">
            <p>{eng.scope ?? 'O presente contrato tem por objeto a prestação dos serviços descritos abaixo, conforme escopo acordado entre as partes.'}</p>
            {eng.proposal_path && (
              <p>O escopo detalhado dos serviços consta na Proposta Comercial anexa, que integra este contrato como <strong>Anexo I</strong>.</p>
            )}
          </Clausula>

          <Clausula titulo="Cláusula Segunda – Das Obrigações da Contratante">
            {obrigContratante.map((linha, i) => (
              <p key={i}>2.{i + 1}. {linha}</p>
            ))}
          </Clausula>

          <Clausula titulo="Cláusula Terceira – Das Obrigações da Contratada">
            {obrigContratada.map((linha, i) => (
              <p key={i}>3.{i + 1}. {linha}</p>
            ))}
          </Clausula>

          <Clausula titulo="Cláusula Quarta – Do Valor e Condições de Pagamento">
            {pgto.map((n, i) => (
              <div className="item" key={i}>4.{i + 1}. {n}</div>
            ))}
          </Clausula>

          <Clausula titulo="Cláusula Quinta – Do Prazo Contratual e Renovação">
            <p>5.1. Este contrato tem vigência {meses ? <>de <strong>{meses} meses</strong></> : 'conforme acordado entre as partes'}{eng.start_date ? `, com início em ${fmtDate(eng.start_date)}` : ', com início na data de sua assinatura'}{eng.end_date ? ` e término em ${fmtDate(eng.end_date)}` : ''}.</p>
            {eng.renewal_note && <p>5.2. {eng.renewal_note}</p>}
            <p>{eng.renewal_note ? '5.3.' : '5.2.'} Os prazos e entregas previstos poderão ser prorrogados por acordo mútuo, mediante formalização de Termo Aditivo, especialmente em caso de atraso no fornecimento de acessos ou materiais pela CONTRATANTE.</p>
          </Clausula>

          <Clausula titulo="Cláusula Sexta – Da Rescisão e Multa">
            <p>6.1. Qualquer das partes poderá rescindir o presente contrato mediante notificação prévia por escrito com antecedência mínima de 30 (trinta) dias.</p>
            {hasMrr ? (
              <p>6.2. Em caso de rescisão antecipada por iniciativa da CONTRATANTE, antes do término da vigência, será devida multa compensatória equivalente a 3 (três) mensalidades do valor vigente, a título de ressarcimento pelos serviços prestados e investimentos realizados.</p>
            ) : (
              <p>6.2. Em caso de rescisão antecipada por iniciativa da CONTRATANTE, serão devidos os valores correspondentes aos serviços já executados até a data da rescisão, acrescidos das despesas comprovadamente incorridas pela CONTRATADA.</p>
            )}
            <p>6.3. Em caso de inadimplência superior a 30 (trinta) dias, a CONTRATADA poderá suspender a prestação dos serviços e o acesso aos entregáveis e rescindir o contrato, mantendo o direito ao recebimento dos valores em aberto acrescidos das penalidades previstas na Cláusula Quarta.</p>
            <p>6.4. Se a CONTRATANTE não fornecer os acessos e informações necessários em tempo hábil, os prazos serão ajustados proporcionalmente, sem penalidade para a CONTRATADA.</p>
          </Clausula>

          <Clausula titulo="Cláusula Sétima – Da Propriedade Intelectual e Titularidade dos Dados">
            <p>7.1. Após o pagamento integral dos valores devidos, a CONTRATANTE terá propriedade exclusiva dos entregáveis produzidos no âmbito deste contrato, incluindo, quando aplicável, código-fonte, configurações e materiais desenvolvidos.</p>
            <p>7.2. Todos os dados, leads, históricos de atendimento e informações geradas no âmbito dos serviços são de propriedade exclusiva da CONTRATANTE, que poderá exportá-los a qualquer momento.</p>
            <p>7.3. A CONTRATADA se compromete a manter sigilo sobre todas as informações confidenciais da CONTRATANTE a que tiver acesso em razão deste contrato.</p>
          </Clausula>

          <Clausula titulo="Cláusula Oitava – Do Foro">
            <p>8.1. As partes elegem o foro da Comarca de São Paulo – SP para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </Clausula>

          {eng.proposal_path && (
            <div className="anexo">
              <p><strong>Anexo I – Proposta Comercial.</strong> A Proposta Comercial{eng.proposal_name ? ` (${eng.proposal_name})` : ''} anexa faz parte integrante deste contrato, detalhando o escopo dos serviços contratados{anexo ? ', e segue reproduzida ao final deste instrumento' : ''}.</p>
              {!anexo && eng.proposal_path && (
                <a className="no-print anexo-link" href={`/admin/proposta/${eng.id}`} target="_blank" rel="noopener noreferrer">Abrir proposta anexa ↗</a>
              )}
            </div>
          )}

          <p className="close">E por estarem assim justos e contratados, as partes assinam o presente instrumento.</p>
          <p className="local">São Paulo, _______ de ____________________ de ______.</p>

          <div className="signs">
            <div className="sign">
              <div className="line" />
              <p className="s-name">{org?.legal_name ?? '[RAZÃO SOCIAL]'}</p>
              {org?.legal_rep && <p className="s-rep">{org.legal_rep}</p>}
              {org?.legal_rep_cpf && <p className="s-cpf">CPF nº {org.legal_rep_cpf}</p>}
              <p className="s-role">CONTRATANTE</p>
            </div>
            <div className="sign">
              <div className="line" />
              <p className="s-name">{CONTRATADA.razao}</p>
              <p className="s-rep">{CONTRATADA.rep}</p>
              <p className="s-cpf">CPF nº {CONTRATADA.cpf}</p>
              <p className="s-role">CONTRATADA · {CONTRATADA.fantasia}</p>
            </div>
          </div>
        </main>

        {anexo && (
          <div className="nk-anexo" dangerouslySetInnerHTML={{ __html: anexo.body }} />
        )}
    </div>
  );
}

function Clausula({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="clausula">
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .doc { font-family: 'DM Sans', system-ui, sans-serif; color: #191918; background: #f3f3ee; min-height: 100vh; line-height: 1.6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { max-width: 800px; margin: 24px auto; background: #fff; padding: 64px 72px; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
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
  .anexo { margin-top: 24px; padding: 14px 16px; border: 1px solid rgba(25,25,24,.12); border-radius: 8px; background: #faf9f5; }
  .anexo p { font-size: 13px; }
  .anexo-link { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 600; color: #3B82F6; text-decoration: none; }
  .close { margin-top: 28px; font-size: 13.5px; }
  .local { margin-top: 28px; font-size: 13.5px; }
  .signs { display: flex; gap: 48px; margin-top: 64px; page-break-inside: avoid; }
  .sign { flex: 1; text-align: center; }
  .sign .line { border-top: 1px solid #191918; margin-bottom: 8px; }
  .s-name { font-size: 13px; font-weight: 700; }
  .s-rep { font-size: 12.5px; }
  .s-cpf { font-size: 12px; color: #6b6b68; }
  .s-role { font-size: 11px; letter-spacing: .1em; color: #6b6b68; margin-top: 4px; }
  @media print {
    .doc { background: #fff; min-height: auto; }
    .page { box-shadow: none; margin: 0; max-width: none; padding: 32px 40px; }
    .no-print { display: none !important; }

    /* Proposta embutida (Anexo) — impressão limpa, sem cortes nem fundo sobrando */
    .nk-anexo { background: #fff !important; }
    .nk-anexo .nkanexopage { max-width: none !important; margin: 0 !important; padding: 24px 40px !important; }
    .nk-anexo .doc-header { padding: 8px 0 16px !important; }
    .nk-anexo .cover { padding: 28px 0 !important; }
    .nk-anexo .cover-title { font-size: 2.4rem !important; }
    .nk-anexo .section { padding: 24px 0 !important; }
    /* Não quebrar blocos no meio */
    .nk-anexo .section,
    .nk-anexo .problema-card,
    .nk-anexo .projeto-header,
    .nk-anexo .entregavel,
    .nk-anexo .modulo,
    .nk-anexo .valor-box,
    .nk-anexo .roi-box,
    .nk-anexo .warning-box,
    .nk-anexo .infra-item,
    .nk-anexo .infra-disclaimer,
    .nk-anexo .invest-card,
    .nk-anexo .invest-addon,
    .nk-anexo .prazo-item,
    .nk-anexo .cta-box,
    .nk-anexo .cta-card { page-break-inside: avoid; break-inside: avoid; }
    .nk-anexo .section-title,
    .nk-anexo .entregaveis-title { page-break-after: avoid; }
    .nk-anexo .doc-footer { page-break-before: avoid; }
  }
`;
