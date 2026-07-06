import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ClientesView, type ClientView } from './clientes-view';

export const dynamic = 'force-dynamic';

type Channel = { kind: string; value: string; is_primary: boolean };
type OrgRow = {
  id: string; name: string | null; market: string | null;
  legal_name: string | null; tax_id: string | null; state_registration: string | null;
  address_street: string | null; address_number: string | null; address_district: string | null;
  address_city: string | null; address_state: string | null; address_zip: string | null;
  legal_rep: string | null; legal_rep_cpf: string | null;
};
type EngRow = {
  id: string; organization_id: string | null; title: string | null; type: string; status: string; lifecycle: string;
  valor: number | null; mrr: number | null; start_date: string | null; end_date: string | null; notes: string | null;
  scope: string | null; renewal_note: string | null; client_obligations: string | null; provider_obligations: string | null;
  proposal_path: string | null; proposal_name: string | null;
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
  organization_id: string | null; token: string; status: string;
  product_name: string | null; submitted_at: string | null;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

function pick(channels: Channel[] | null, kind: string): string | null {
  const list = channels ?? [];
  return (list.find((c) => c.kind === kind && c.is_primary) ?? list.find((c) => c.kind === kind))?.value ?? null;
}

export default async function ClientesPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: orgData }, { data: engData }, { data: recData }, { data: coData }, { data: briefData }] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, market, legal_name, tax_id, state_registration, address_street, address_number, address_district, address_city, address_state, address_zip, legal_rep, legal_rep_cpf')
      .order('name'),
    supabase
      .from('engagements')
      .select('id, organization_id, title, type, status, lifecycle, valor, mrr, start_date, end_date, notes, scope, renewal_note, client_obligations, provider_obligations, proposal_path, proposal_name')
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
      .select('organization_id, token, status, product_name, submitted_at')
      .order('created_at', { ascending: false }),
  ]);

  const orgs = (orgData ?? []) as OrgRow[];
  const engs = (engData ?? []) as EngRow[];
  const recs = (recData ?? []) as RecRow[];
  const cos = (coData ?? []) as unknown as CoRow[];
  const briefs = (briefData ?? []) as BriefRow[];

  const clients: ClientView[] = orgs.map((o) => {
    const brief = briefs.find((b) => b.organization_id === o.id);
    return {
    ...o,
    briefing: brief
      ? {
          status: brief.status,
          product_name: brief.product_name,
          submitted_at: brief.submitted_at,
          url: `${SITE_URL}/onboarding/${brief.token}`,
        }
      : null,
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
        scope: e.scope, renewal_note: e.renewal_note, client_obligations: e.client_obligations, provider_obligations: e.provider_obligations,
        proposal_path: e.proposal_path, proposal_name: e.proposal_name,
        parcelas: recs
          .filter((r) => r.engagement_id === e.id)
          .map((r) => ({
            id: r.id, description: r.description, amount: r.amount, due_date: r.due_date,
            status: r.status, paid_amount: r.paid_amount, paid_at: r.paid_at,
          })),
      })),
    };
  });

  return <ClientesView clients={clients} />;
}
