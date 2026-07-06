import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { FinanceView, type EngView, type RecView } from './finance-view';

export const dynamic = 'force-dynamic';

type EngRow = {
  id: string; title: string | null; type: string; status: string; lifecycle: string;
  valor: number | null; mrr: number | null; billing_cycle: string | null;
  start_date: string | null; end_date: string | null; notes: string | null;
  organization_id: string | null;
  organizations: { name: string | null } | null;
};
type RecRow = {
  id: string; description: string | null; amount: number; due_date: string;
  status: string; paid_amount: number | null; paid_at: string | null;
  engagement_id: string | null;
  engagements: { title: string | null; organizations: { name: string | null } | null } | null;
  organizations: { name: string | null } | null;
};

export default async function FinanceiroPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: engData }, { data: recData }, { data: orgData }] = await Promise.all([
    supabase
      .from('engagements')
      .select(
        'id, title, type, status, lifecycle, valor, mrr, billing_cycle, start_date, end_date, notes, organization_id, organizations(name)',
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('receivables')
      .select(
        'id, description, amount, due_date, status, paid_amount, paid_at, engagement_id, engagements(title, organizations(name)), organizations(name)',
      )
      .order('due_date', { ascending: true }),
    supabase.from('organizations').select('id, name').order('name'),
  ]);

  const engRows = (engData ?? []) as unknown as EngRow[];
  const recRows = (recData ?? []) as unknown as RecRow[];
  const orgs = ((orgData ?? []) as { id: string; name: string | null }[]).map((o) => ({
    id: o.id,
    name: o.name ?? '—',
  }));

  const engagements: EngView[] = engRows.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    status: e.status,
    lifecycle: e.lifecycle,
    valor: e.valor,
    mrr: e.mrr,
    billing_cycle: e.billing_cycle,
    start_date: e.start_date,
    end_date: e.end_date,
    notes: e.notes,
    organization_id: e.organization_id,
    org_name: e.organizations?.name ?? null,
  }));

  const receivables: RecView[] = recRows.map((r) => ({
    id: r.id,
    description: r.description,
    amount: r.amount,
    due_date: r.due_date,
    status: r.status,
    paid_amount: r.paid_amount,
    paid_at: r.paid_at,
    engagement_id: r.engagement_id,
    engagement_title: r.engagements?.title ?? null,
    org_name: r.engagements?.organizations?.name ?? r.organizations?.name ?? null,
  }));

  return <FinanceView engagements={engagements} receivables={receivables} orgs={orgs} />;
}
