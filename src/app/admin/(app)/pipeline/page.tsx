import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { type DealStage } from './stages';
import { PipelineBoard, type BoardDeal } from './board';
import { dealTotal, dealTotalNet, dealMonthly, dealMonthlyNet, dealNota } from './deal-value';
import { liquidoDaParcela } from '../_shared/liquido';
import { type OrgOption, type Product } from './orgs';

export const dynamic = 'force-dynamic';

type Channel = { kind: string; value: string; is_primary: boolean };
type OrgRow = {
  id: string;
  name: string | null;
  site: string | null;
  instagram: string | null;
  legal_name: string | null;
  tax_id: string | null;
  state_registration: string | null;
  address_street: string | null;
  address_number: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  legal_rep: string | null;
};
type DealRow = {
  id: string;
  stage: DealStage;
  stage_changed_at: string | null;
  service_tag: string | null;
  service_tags: string[] | null;
  source: string | null;
  valor_pontual: number | null;
  mrr: number | null;
  repasse_valor: number | null;
  repasse_para: string | null;
  precisa_nota: boolean;
  notes: string | null;
  organization_id: string | null;
  proposal_path: string | null;
  proposal_name: string | null;
  contacts: { id: string; name: string | null; contact_channels: Channel[] | null } | null;
  organizations: OrgRow | null;
  deal_installments: { id: string; description: string | null; amount: number; due_date: string }[] | null;
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function pick(channels: Channel[] | null, kind: string): string | null {
  const list = channels ?? [];
  return (list.find((c) => c.kind === kind && c.is_primary) ?? list.find((c) => c.kind === kind))?.value ?? null;
}

export default async function PipelinePage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('deals')
    .select(
      'id, stage, stage_changed_at, service_tag, service_tags, source, valor_pontual, mrr, repasse_valor, repasse_para, precisa_nota, notes, organization_id, proposal_path, proposal_name, ' +
        'contacts(id, name, contact_channels(kind, value, is_primary)), ' +
        'organizations(id, name, site, instagram, legal_name, tax_id, state_registration, address_street, address_number, address_district, address_city, address_state, address_zip, legal_rep), ' +
        'deal_installments(id, description, amount, due_date)',
    )
    .order('created_at', { ascending: false });

  // Empresas já cadastradas (com contato principal), para o autocomplete do novo
  // negócio: vincula o cliente existente e preenche whats/e-mail automaticamente.
  type OrgContactRow = {
    id: string;
    name: string | null;
    contact_organizations:
      | { is_primary: boolean; contacts: { id: string; name: string | null; contact_channels: Channel[] | null } | null }[]
      | null;
  };
  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id, name, contact_organizations(is_primary, contacts(id, name, contact_channels(kind, value, is_primary)))')
    .order('name');
  const orgOptions: OrgOption[] = ((orgRows ?? []) as unknown as OrgContactRow[]).flatMap((o) => {
    if (!o.name) return [];
    const links = o.contact_organizations ?? [];
    const link = links.find((l) => l.is_primary && l.contacts) ?? links.find((l) => l.contacts);
    const c = link?.contacts ?? null;
    return [
      {
        id: o.id,
        name: o.name,
        contact: c
          ? {
              id: c.id,
              name: c.name,
              email: pick(c.contact_channels ?? null, 'email'),
              whatsapp: pick(c.contact_channels ?? null, 'whatsapp'),
            }
          : null,
      },
    ];
  });

  // Negócios que já viraram contrato: o card ganho mostra "gerar contrato" só
  // enquanto ele não existe.
  const { data: vinculos } = await supabase.from('deal_engagements').select('deal_id');
  const comContrato = new Set((vinculos ?? []).map((v) => v.deal_id as string));

  // Produtos/serviços da tabela products (lista editável pelo próprio sistema).
  const { data: prodRows } = await supabase.from('products').select('key, name, active').order('sort');
  const products: Product[] = (prodRows ?? []).map((p) => ({ key: p.key, name: p.name, active: p.active }));

  // MRR que já existe hoje: base para mostrar de quanto para quanto a receita de
  // todo mês iria se o pipeline inteiro fechasse. O repasse e a nota dos
  // contratos ativos vêm junto para o "sobram" falar do mês inteiro, e não só da
  // parte que ainda depende de fechar.
  const { data: engRows } = await supabase
    .from('engagements')
    .select('mrr, lifecycle, type, repasse_valor, precisa_nota')
    .eq('lifecycle', 'ativo');
  const ativos = (engRows ?? []) as { mrr: number | null; type: string; repasse_valor: number | null; precisa_nota: boolean | null }[];
  const mrrAtual = ativos.reduce((s, e) => s + (e.mrr ?? 0), 0);
  const mrrAtualNet = ativos.reduce(
    (s, e) => s + liquidoDaParcela(e.mrr ?? 0, { type: e.type, repasse_valor: e.repasse_valor, precisa_nota: e.precisa_nota ?? false }),
    0,
  );

  const rows = (data ?? []) as unknown as DealRow[];
  const deals: BoardDeal[] = rows.map((r) => ({
    id: r.id,
    stage: r.stage,
    stage_changed_at: r.stage_changed_at,
    service_tag: r.service_tag,
    service_tags: r.service_tags ?? [],
    source: r.source,
    valor_pontual: r.valor_pontual,
    mrr: r.mrr,
    repasse_valor: r.repasse_valor,
    repasse_para: r.repasse_para,
    precisa_nota: r.precisa_nota,
    notes: r.notes,
    organization_id: r.organization_id,
    contact_id: r.contacts?.id ?? null,
    name: r.contacts?.name ?? null,
    email: pick(r.contacts?.contact_channels ?? null, 'email'),
    whatsapp: pick(r.contacts?.contact_channels ?? null, 'whatsapp'),
    org: r.organizations ?? null,
    proposal_path: r.proposal_path,
    proposal_name: r.proposal_name,
    installments: [...(r.deal_installments ?? [])].sort((a, b) => a.due_date.localeCompare(b.due_date)),
    has_contract: comContrato.has(r.id),
  }));

  const openDeals = deals.filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido');

  // Quanto o pipeline vale por inteiro e quanto viraria receita todo mês se tudo
  // fechasse. Fechar R$ 65 mil parcelado não é R$ 65 mil por mês.
  //
  // O número de destaque é o VALOR FECHADO, o que foi vendido. Nota e repasse
  // são custos dele, não desconto: trocar o valor do projeto pelo que sobra
  // depois do imposto confunde quem negociou o preço. O líquido fica na linha de
  // baixo, e a nota tem cartão próprio.
  const openValue = openDeals.reduce((sum, d) => sum + dealTotal(d), 0);
  const openValueNet = openDeals.reduce((sum, d) => sum + dealTotalNet(d), 0);
  // Quanto o funil somaria à receita de todo mês. Vive DENTRO do cartão de
  // recorrente: eram dois cartões falando de mês com números diferentes (o do
  // funil e o total), e ler um exigia fazer a conta do outro de cabeça.
  const openMensal = openDeals.reduce((sum, d) => sum + dealMonthly(d), 0);
  const openMensalNet = openDeals.reduce((sum, d) => sum + dealMonthlyNet(d), 0);
  // Parte do "por mês" que é mensalidade de verdade: parcela de negócio pontual
  // pinga todo mês, mas acaba, então não pode virar MRR.
  const mrrPipeline = openDeals.reduce((sum, d) => sum + (d.mrr ?? 0), 0);
  const parcelasMensais = openMensal - mrrPipeline;
  // Quanto do pipeline vai embora em nota, e de quantos negócios ela sai.
  const notaPipeline = openDeals.reduce((sum, d) => sum + dealNota(d), 0);
  const comNota = openDeals.filter((d) => d.precisa_nota && dealTotal(d) > 0).length;
  const won = deals.filter((d) => d.stage === 'ganho').length;
  const lost = deals.filter((d) => d.stage === 'perdido').length;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      <header className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">
              <span className="status-dot" />
              Pipeline de vendas
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Negócios</h1>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-stretch gap-3">
          <div className="min-w-[11rem] rounded-md border border-black/[0.06] bg-white px-4 py-3">
            <p className="font-label text-[11px] uppercase tracking-wider text-text-muted">Se fechar tudo</p>
            <p className="mt-0.5 text-xl font-semibold text-text-primary">{brl(openValue)}</p>
            <p className="font-label text-[10px] text-text-muted/70">
              {openDeals.length} em aberto
              {openValueNet < openValue && <> · sobram {brl(openValueNet)}</>}
            </p>
          </div>
          {/* Quanto do que está na mesa vai embora em imposto. Fica ao lado do
              valor cheio para a conta não sumir dentro dele. */}
          {notaPipeline > 0 && (
            <div className="min-w-[11rem] rounded-md border border-black/[0.06] bg-white px-4 py-3">
              <p className="font-label text-[11px] uppercase tracking-wider text-text-muted">Nota fiscal</p>
              <p className="mt-0.5 text-xl font-semibold text-warning">− {brl(notaPipeline)}</p>
              <p className="font-label text-[10px] text-text-muted/70">
                6% · {comNota} negócio{comNota === 1 ? '' : 's'} com nota
              </p>
            </div>
          )}
          {/* De quanto para quanto a receita de todo mês iria: o número que diz
              se vale o esforço, com o quanto vem do funil escrito por extenso. */}
          {openMensal > 0 && (
            <div className="min-w-[15rem] rounded-md border border-primary/25 bg-primary/[0.04] px-4 py-3">
              <p className="font-label text-[11px] uppercase tracking-wider text-text-muted">Por mês</p>
              <p className="mt-0.5 flex items-baseline gap-1.5 text-xl font-semibold text-text-primary">
                {brl(mrrAtual)}
                <span className="font-label text-sm font-normal text-text-muted">→</span>
                <span className="text-primary">{brl(mrrAtual + mrrPipeline)}</span>
              </p>
              <p className="font-label text-[10px] text-text-muted/70">
                hoje → com {brl(mrrPipeline)} do funil
                {parcelasMensais > 0.5 && <> · mais {brl(parcelasMensais)}/mês em parcelas</>}
                {mrrAtualNet + openMensalNet < mrrAtual + openMensal - 0.5 && (
                  <> · sobram {brl(mrrAtualNet + openMensalNet)}</>
                )}
              </p>
            </div>
          )}
          {(won > 0 || lost > 0) && (
            <p className="self-center font-label text-[11px] text-text-muted">
              {won > 0 && <span className="text-success">{won} ganho{won === 1 ? '' : 's'}</span>}
              {won > 0 && lost > 0 && ' · '}
              {lost > 0 && <span className="text-danger">{lost} perdido{lost === 1 ? '' : 's'}</span>}
            </p>
          )}
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Erro ao carregar pipeline: {error.message}
        </p>
      )}

      <PipelineBoard initialDeals={deals} products={products} orgOptions={orgOptions} />
    </div>
  );
}
