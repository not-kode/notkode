import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DashboardView, type DashboardData, type DayCount } from './dashboard-view';

export const dynamic = 'force-dynamic';

const SERVICE_LABELS: Record<string, string> = {
  'sistemas-ia': 'Sistema com IA', 'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação', 'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook', 'manutencao': 'Plano de Manutenção',
};

const isoDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default async function AdminHome() {
  const supabase = getSupabaseAdmin();
  const since30 = isoDaysAgo(30);
  const since14 = isoDaysAgo(14);
  const todayStr = new Date().toISOString().slice(0, 10);
  const countHead = { count: 'exact' as const, head: true };

  const [
    pv, cc, fs, pvRows, leadRows, wonDeals, engRows, recRows, formRows,
  ] = await Promise.all([
    supabase.from('events').select('*', countHead).eq('type', 'page_view').gte('created_at', since30),
    supabase.from('events').select('*', countHead).eq('type', 'cta_click').gte('created_at', since30),
    supabase.from('events').select('*', countHead).eq('type', 'form_submit').gte('created_at', since30),
    supabase.from('events').select('created_at').eq('type', 'page_view').gte('created_at', since14),
    supabase.from('lead_submissions').select('service_tag, promoted_at'),
    supabase.from('deals').select('*', countHead).eq('stage', 'ganho'),
    supabase.from('engagements').select('organization_id, lifecycle, mrr'),
    supabase.from('receivables').select('amount, status, due_date'),
    supabase.from('events').select('type, label, session_id').in('type', ['form_start', 'form_step', 'form_submit']).gte('created_at', since30),
  ]);

  const leads = (leadRows.data ?? []) as { service_tag: string | null; promoted_at: string | null }[];
  const engs = (engRows.data ?? []) as { organization_id: string | null; lifecycle: string; mrr: number | null }[];
  const recs = (recRows.data ?? []) as { amount: number; status: string; due_date: string }[];
  const formEvents = (formRows.data ?? []) as { type: string; label: string | null; session_id: string | null }[];

  // Funil do formulário (sessões distintas): iniciou → chegou no contato → enviou.
  // "contato" é a etapa comum aos dois formulários, então funciona cross-form.
  const distinct = (pred: (e: { type: string; label: string | null }) => boolean) =>
    new Set(formEvents.filter((e) => pred(e) && e.session_id).map((e) => e.session_id)).size;
  const formFunnel = [
    { label: 'Iniciaram', count: distinct((e) => e.type === 'form_start') },
    { label: 'Chegaram no contato', count: distinct((e) => e.type === 'form_step' && e.label === 'contato') },
    { label: 'Enviaram', count: distinct((e) => e.type === 'form_submit') },
  ];

  // Funil
  const funnel = {
    visitas: pv.count ?? 0,
    cliques: cc.count ?? 0,
    forms: fs.count ?? 0,
    promovidos: leads.filter((l) => l.promoted_at).length,
    ganhos: wonDeals.count ?? 0,
  };

  // Visitas por dia (14 dias, do mais antigo ao mais recente)
  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) buckets.set(dayKey(new Date(Date.now() - i * 86_400_000)), 0);
  for (const row of (pvRows.data ?? []) as { created_at: string }[]) {
    const k = row.created_at.slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  const visitasPorDia: DayCount[] = [...buckets.entries()].map(([day, count]) => ({ day, count }));

  // Leads por serviço
  const porServicoMap = new Map<string, number>();
  for (const l of leads) {
    const tag = l.service_tag ?? 'outros';
    porServicoMap.set(tag, (porServicoMap.get(tag) ?? 0) + 1);
  }
  const porServico = [...porServicoMap.entries()]
    .map(([tag, count]) => ({ tag, label: SERVICE_LABELS[tag] ?? tag, count }))
    .sort((a, b) => b.count - a.count);

  // KPIs
  const mrr = engs.filter((e) => e.lifecycle === 'ativo').reduce((s, e) => s + (e.mrr ?? 0), 0);
  const atrasado = recs.filter((r) => r.status === 'pendente' && r.due_date < todayStr).reduce((s, r) => s + r.amount, 0);
  const clientesAtivos = new Set(
    engs.filter((e) => (e.lifecycle === 'ativo' || e.lifecycle === 'pausado') && e.organization_id).map((e) => e.organization_id),
  ).size;

  const data: DashboardData = {
    funnel,
    formFunnel,
    porServico,
    visitasPorDia,
    kpis: { mrr, atrasado, clientesAtivos, leadsTotal: leads.length },
    eventosTotais: funnel.visitas + funnel.cliques + funnel.forms,
  };

  return <DashboardView data={data} />;
}
