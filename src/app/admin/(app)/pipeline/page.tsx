import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { type DealStage } from './stages';
import { PipelineBoard, type BoardDeal } from './board';
import { NewDealDialog } from './new-deal-dialog';
import { type OrgOption, type Product } from './orgs';

export const dynamic = 'force-dynamic';

type Channel = { kind: string; value: string; is_primary: boolean };
type OrgRow = {
  id: string;
  name: string | null;
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
      'id, stage, service_tag, service_tags, source, valor_pontual, mrr, repasse_valor, repasse_para, precisa_nota, notes, organization_id, proposal_path, proposal_name, ' +
        'contacts(id, name, contact_channels(kind, value, is_primary)), ' +
        'organizations(id, name, legal_name, tax_id, state_registration, address_street, address_number, address_district, address_city, address_state, address_zip, legal_rep), ' +
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

  // Produtos/serviços da tabela products (lista editável pelo próprio sistema).
  const { data: prodRows } = await supabase.from('products').select('key, name, active').order('sort');
  const products: Product[] = (prodRows ?? []).map((p) => ({ key: p.key, name: p.name, active: p.active }));

  const rows = (data ?? []) as unknown as DealRow[];
  const deals: BoardDeal[] = rows.map((r) => ({
    id: r.id,
    stage: r.stage,
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
  }));

  const openDeals = deals.filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido');
  const openValue = openDeals.reduce((sum, d) => sum + (d.valor_pontual ?? 0), 0);
  const won = deals.filter((d) => d.stage === 'ganho').length;
  const lost = deals.filter((d) => d.stage === 'perdido').length;

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow mb-1">
          <span className="status-dot" />
          Pipeline de vendas
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Negócios</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-label text-xs text-text-muted">
              <span>
                {openDeals.length} em aberto · <span className="text-text-secondary">{brl(openValue)}</span>
              </span>
              {won > 0 && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">
                  {won} ganho{won === 1 ? '' : 's'}
                </span>
              )}
              {lost > 0 && (
                <span className="rounded-full bg-danger/10 px-2 py-0.5 text-danger">
                  {lost} perdido{lost === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <NewDealDialog orgOptions={orgOptions} products={products} />
          </div>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Erro ao carregar pipeline: {error.message}
        </p>
      )}

      <PipelineBoard initialDeals={deals} products={products} />
      <p className="mt-3 font-label text-[10px] text-text-muted/70">Arraste os cards entre as colunas para mudar o estágio.</p>
    </div>
  );
}
