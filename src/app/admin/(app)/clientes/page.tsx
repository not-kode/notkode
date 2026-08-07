import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ONBOARDING_TEMPLATES } from '@/lib/onboarding-schema';
import { ClientesView, type ClientView } from './clientes-view';
import type { ModeloRow } from './modelos-view';
import { lerClausulas } from '@/app/admin/contrato/modelo';
import { syncRecurringReceivables } from '../financeiro/recurring-sync';
import type { BriefingRow } from '../onboarding/onboarding-view';

export const dynamic = 'force-dynamic';

type Channel = { kind: string; value: string; is_primary: boolean };
type OrgRow = {
  id: string; name: string | null; market: string | null;
  site: string | null; instagram: string | null;
  legal_name: string | null; tax_id: string | null; state_registration: string | null;
  address_street: string | null; address_number: string | null; address_district: string | null;
  address_city: string | null; address_state: string | null; address_zip: string | null;
  legal_rep: string | null; legal_rep_cpf: string | null;
};
type EngRow = {
  id: string; organization_id: string | null; title: string | null; type: string; status: string; lifecycle: string;
  valor: number | null; mrr: number | null; start_date: string | null; end_date: string | null; notes: string | null;
  execution_start: string | null; execution_end: string | null;
  scope: string | null; renewal_note: string | null; client_obligations: string | null; provider_obligations: string | null;
  proposal_path: string | null; proposal_name: string | null;
  contract_template_id: string | null;
  repasse_valor: number | null; precisa_nota: boolean | null;
};
type RecRow = {
  id: string; engagement_id: string | null; description: string | null; amount: number;
  due_date: string; status: string; paid_amount: number | null; paid_at: string | null;
};
type CoRow = {
  organization_id: string; role: string | null;
  contacts: { id: string; name: string | null; contact_channels: Channel[] | null } | null;
};
type BriefRow = {
  id: string; organization_id: string | null; token: string; status: string;
  product_name: string | null; submitted_at: string | null; created_at: string;
  template_key: string | null; respostas: Record<string, string | string[]> | null;
};
type DealRow = { id: string; organization_id: string | null };
type SigRow = {
  id: string; engagement_id: string; codigo: string; status: string;
  created_at: string; completed_at: string | null;
};
type SignerRow = {
  id: string; request_id: string; nome: string; email: string; papel: string;
  status: string; assinado_em: string | null; token: string;
};
type ModeloTemplateRow = {
  id: string; nome: string; descricao: string | null; escopo_padrao: string | null;
  padrao: boolean; clausulas: unknown;
};
type LeadRow = {
  deal_id: string | null; service_tag: string | null; page_origin: string | null;
  estimated_min: number | null; estimated_max: number | null; created_at: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

function pick(channels: Channel[] | null, kind: string): string | null {
  const list = channels ?? [];
  return (list.find((c) => c.kind === kind && c.is_primary) ?? list.find((c) => c.kind === kind))?.value ?? null;
}

export default async function ClientesPage() {
  // A ficha do cliente lista as parcelas do contrato, então ela também precisa
  // das mensalidades dos meses à frente em dia (mesma régua do Financeiro).
  await syncRecurringReceivables();

  const supabase = getSupabaseAdmin();
  const [{ data: orgData }, { data: engData }, { data: recData }, { data: coData }, { data: briefData }, { data: dealData }, { data: leadData }] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, market, site, instagram, legal_name, tax_id, state_registration, address_street, address_number, address_district, address_city, address_state, address_zip, legal_rep, legal_rep_cpf')
      .order('name'),
    supabase
      .from('engagements')
      .select('id, organization_id, title, type, status, lifecycle, valor, mrr, start_date, end_date, execution_start, execution_end, notes, scope, renewal_note, client_obligations, provider_obligations, proposal_path, proposal_name, contract_template_id, repasse_valor, precisa_nota')
      .order('created_at', { ascending: true }),
    supabase
      .from('receivables')
      .select('id, engagement_id, description, amount, due_date, status, paid_amount, paid_at')
      .order('due_date', { ascending: true }),
    supabase
      .from('contact_organizations')
      .select('organization_id, role, contacts(id, name, contact_channels(kind, value, is_primary))'),
    supabase
      .from('onboarding_briefings')
      .select('id, organization_id, token, status, product_name, submitted_at, created_at, template_key, respostas')
      .order('created_at', { ascending: false }),
    supabase
      .from('deals')
      .select('id, organization_id'),
    supabase
      .from('lead_submissions')
      .select('deal_id, service_tag, page_origin, estimated_min, estimated_max, created_at')
      .not('deal_id', 'is', null)
      .order('created_at', { ascending: false }),
  ]);

  // Assinaturas em aberto ou concluídas, para o card do contrato mostrar em que
  // pé está o documento. Pedido cancelado não interessa aqui.
  const [{ data: sigData }, { data: signerData }] = await Promise.all([
    supabase
      .from('signature_requests')
      .select('id, engagement_id, codigo, status, created_at, completed_at')
      .in('status', ['enviado', 'assinado'])
      .order('created_at', { ascending: false }),
    supabase
      .from('signature_signers')
      .select('id, request_id, nome, email, papel, status, assinado_em, token')
      .order('ordem', { ascending: true }),
  ]);
  const sigs = (sigData ?? []) as SigRow[];
  const signers = (signerData ?? []) as SignerRow[];

  const orgs = (orgData ?? []) as OrgRow[];
  const engs = (engData ?? []) as EngRow[];
  const recs = (recData ?? []) as RecRow[];
  const cos = (coData ?? []) as unknown as CoRow[];
  const briefs = (briefData ?? []) as BriefRow[];
  const deals = (dealData ?? []) as DealRow[];
  const leads = (leadData ?? []) as LeadRow[];

  // Anexos do briefing: lista o Storage por token e assina URLs de download.
  const arquivos: Record<string, { name: string; url: string | null }[]> = {};
  await Promise.all(
    briefs.map(async (b) => {
      const { data: list } = await supabase.storage.from('onboarding').list(b.token);
      arquivos[b.id] = await Promise.all(
        (list ?? [])
          .filter((f) => f.name && f.id !== null)
          .map(async (f) => {
            const { data: signed } = await supabase.storage
              .from('onboarding')
              .createSignedUrl(`${b.token}/${f.name}`, 3600);
            return { name: f.name, url: signed?.signedUrl ?? null };
          }),
      );
    }),
  );

  const clients: ClientView[] = orgs.map((o) => {
    const brief = briefs.find((b) => b.organization_id === o.id);
    // Origem: a submissão de lead mais recente ligada a um negócio desta empresa.
    const dealIds = deals.filter((d) => d.organization_id === o.id).map((d) => d.id);
    const lead = leads.find((l) => l.deal_id && dealIds.includes(l.deal_id)) ?? null;
    return {
    ...o,
    leadOrigin: lead
      ? {
          service_tag: lead.service_tag, page_origin: lead.page_origin,
          estimated_min: lead.estimated_min, estimated_max: lead.estimated_max,
        }
      : null,
    briefing: brief
      ? {
          id: brief.id,
          status: brief.status,
          product_name: brief.product_name,
          submitted_at: brief.submitted_at,
          url: `${SITE_URL}/onboarding/${brief.token}`,
        }
      : null,
    briefings: briefs
      .filter((b) => b.organization_id === o.id)
      .map((b): BriefingRow => ({
        id: b.id,
        token: b.token,
        orgName: o.name ?? 'Cliente',
        product_name: b.product_name,
        template: b.template_key ?? 'produto',
        status: b.status,
        submitted_at: b.submitted_at,
        created_at: b.created_at,
        respostas: b.respostas ?? {},
        files: arquivos[b.id] ?? [],
      })),
    contacts: cos
      .filter((c) => c.organization_id === o.id && c.contacts)
      .map((c) => ({
        id: c.contacts!.id,
        name: c.contacts!.name,
        role: c.role,
        email: pick(c.contacts!.contact_channels ?? null, 'email'),
        whatsapp: pick(c.contacts!.contact_channels ?? null, 'whatsapp'),
      })),
    contratos: engs
      .filter((e) => e.organization_id === o.id)
      .map((e) => ({
        id: e.id, title: e.title, type: e.type, status: e.status, lifecycle: e.lifecycle,
        valor: e.valor, mrr: e.mrr, start_date: e.start_date, end_date: e.end_date, notes: e.notes,
        execution_start: e.execution_start, execution_end: e.execution_end,
        scope: e.scope, renewal_note: e.renewal_note, client_obligations: e.client_obligations, provider_obligations: e.provider_obligations,
        repasse_valor: e.repasse_valor, precisa_nota: e.precisa_nota ?? false,
        proposal_path: e.proposal_path, proposal_name: e.proposal_name,
        contract_template_id: e.contract_template_id,
        assinatura: (() => {
          const s = sigs.find((x) => x.engagement_id === e.id);
          if (!s) return null;
          return {
            id: s.id, codigo: s.codigo, status: s.status,
            created_at: s.created_at, completed_at: s.completed_at,
            signatarios: signers
              .filter((g) => g.request_id === s.id)
              .map((g) => ({
                id: g.id, nome: g.nome, email: g.email, papel: g.papel,
                status: g.status, assinado_em: g.assinado_em,
                // O link individual também serve para mandar por WhatsApp,
                // quando o e-mail não chega ou o cliente prefere.
                link: `${SITE_URL}/assinar/${g.token}`,
              })),
          };
        })(),
        parcelas: recs
          .filter((r) => r.engagement_id === e.id)
          .map((r) => ({
            id: r.id, description: r.description, amount: r.amount, due_date: r.due_date,
            status: r.status, paid_amount: r.paid_amount, paid_at: r.paid_at,
          })),
      })),
    };
  });

  // Modelos de contrato, com quantos contratos usam cada um.
  const { data: modeloData } = await supabase
    .from('contract_templates')
    .select('id, nome, descricao, escopo_padrao, padrao, clausulas')
    .order('padrao', { ascending: false })
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true });

  const modelos: ModeloRow[] = ((modeloData ?? []) as ModeloTemplateRow[]).map((m) => ({
    id: m.id,
    nome: m.nome,
    descricao: m.descricao,
    escopo_padrao: m.escopo_padrao,
    padrao: m.padrao,
    clausulas: lerClausulas(m.clausulas),
    emUso: engs.filter((e) => e.contract_template_id === m.id).length,
  }));

  // Rótulos de produto da tabela products (lista editável pelo sistema).
  const { data: prodRows } = await supabase.from('products').select('key, name');
  const productLabels: Record<string, string> = Object.fromEntries((prodRows ?? []).map((p) => [p.key, p.name]));

  // Cliente de verdade = tem pelo menos um contrato. Empresa que ainda está
  // negociando (organização criada pelo pipeline) vive só no funil.
  const soClientes = clients.filter((c) => c.contratos.length > 0);

  const templates = Object.entries(ONBOARDING_TEMPLATES).map(([key, t]) => ({ key, label: t.label }));

  return <ClientesView clients={soClientes} productLabels={productLabels} templates={templates} modelos={modelos} />;
}
