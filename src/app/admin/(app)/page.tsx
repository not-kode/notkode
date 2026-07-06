import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DashboardView, type DashboardData, type DayCount, type FunnelStep } from './dashboard-view';

export const dynamic = 'force-dynamic';

const SERVICE_LABELS: Record<string, string> = {
  'sistemas-ia': 'Sistema com IA', 'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação', 'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook', 'manutencao': 'Plano de Manutenção',
};
// Rótulos amigáveis dos CTAs (data-cta) para o ranking de cliques.
const CTA_LABELS: Record<string, string> = {
  'hero-primary': 'Hero — botão principal', 'final-cta': 'Chamada final',
  'whatsapp-ativacao': 'WhatsApp — ativação', 'whatsapp-sucesso': 'WhatsApp — pós-formulário',
  'nav-servicos': 'Menu — Serviços', 'nav-sistemas-ia': 'Menu — Sistemas IA',
  'nav-parcerias': 'Menu — Parcerias', 'nav-sobre': 'Menu — Sobre', 'nav-logo': 'Logo',
};
const prettyCta = (raw: string) =>
  CTA_LABELS[raw] ?? raw.replace(/^servico-card\//, 'Card serviço — ').replace(/^mobile-(nav|servico)\//, 'Mobile — ').replace(/-/g, ' ');

const isoDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default async function AdminHome() {
  const supabase = getSupabaseAdmin();
  const since30 = isoDaysAgo(30);
  const since14 = isoDaysAgo(14);
  const todayStr = new Date().toISOString().slice(0, 10);
  const countHead = { count: 'exact' as const, head: true };

  const [pv, cc, pvRows, ctaRows, formRows, leadRows, wonDeals, engRows, recRows] = await Promise.all([
    supabase.from('events').select('*', countHead).eq('type', 'page_view').gte('created_at', since30),
    supabase.from('events').select('*', countHead).eq('type', 'cta_click').gte('created_at', since30),
    supabase.from('events').select('created_at').eq('type', 'page_view').gte('created_at', since14),
    supabase.from('events').select('label').eq('type', 'cta_click').gte('created_at', since30),
    supabase.from('events').select('type, label, session_id').in('type', ['form_start', 'form_step', 'form_submit']).gte('created_at', since30),
    supabase.from('lead_submissions').select('service_tag, promoted_at'),
    supabase.from('deals').select('*', countHead).eq('stage', 'ganho'),
    supabase.from('engagements').select('organization_id, lifecycle, mrr'),
    supabase.from('receivables').select('amount, status, due_date'),
  ]);

  const ctas = (ctaRows.data ?? []) as { label: string | null }[];
  const formEvents = (formRows.data ?? []) as { type: string; label: string | null; session_id: string | null }[];
  const leads = (leadRows.data ?? []) as { service_tag: string | null; promoted_at: string | null }[];
  const engs = (engRows.data ?? []) as { organization_id: string | null; lifecycle: string; mrr: number | null }[];
  const recs = (recRows.data ?? []) as { amount: number; status: string; due_date: string }[];

  const visitas = pv.count ?? 0;
  const cliquesCta = cc.count ?? 0;

  // Sessões distintas por predicado de evento de formulário.
  const distinct = (pred: (e: { type: string; label: string | null }) => boolean) =>
    new Set(formEvents.filter((e) => pred(e) && e.session_id).map((e) => e.session_id)).size;
  const formIniciado = distinct((e) => e.type === 'form_start');
  const formEnviado = distinct((e) => e.type === 'form_submit');

  // Funil do site (só tracking, mesma janela) — monotônico.
  const siteFunnel: FunnelStep[] = [
    { label: 'Visitas', count: visitas },
    { label: 'Cliques CTA', count: cliquesCta },
    { label: 'Form iniciado', count: formIniciado },
    { label: 'Form enviado', count: formEnviado },
  ];

  // Funil de desistência do formulário: por número de passo alcançado + enviado.
  const stepPositions = [...new Set(
    formEvents.filter((e) => e.type === 'form_step' && e.label && /^\d+$/.test(e.label)).map((e) => Number(e.label)),
  )].sort((a, b) => a - b);
  const formFunnel: FunnelStep[] = [
    ...stepPositions.map((p) => ({ label: `Passo ${p}`, count: distinct((e) => e.type === 'form_step' && e.label === String(p)) })),
    { label: 'Enviou', count: formEnviado },
  ];

  // Visitas por dia (14 dias)
  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) buckets.set(dayKey(new Date(Date.now() - i * 86_400_000)), 0);
  for (const row of (pvRows.data ?? []) as { created_at: string }[]) {
    const k = row.created_at.slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  const visitasPorDia: DayCount[] = [...buckets.entries()].map(([day, count]) => ({ day, count }));

  // Cliques por CTA
  const ctaMap = new Map<string, number>();
  for (const c of ctas) {
    const key = c.label ?? 'sem-rótulo';
    ctaMap.set(key, (ctaMap.get(key) ?? 0) + 1);
  }
  const porCta = [...ctaMap.entries()]
    .map(([label, count]) => ({ label: prettyCta(label), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Leads por serviço
  const servicoMap = new Map<string, number>();
  for (const l of leads) servicoMap.set(l.service_tag ?? 'outros', (servicoMap.get(l.service_tag ?? 'outros') ?? 0) + 1);
  const porServico = [...servicoMap.entries()]
    .map(([tag, count]) => ({ tag, label: SERVICE_LABELS[tag] ?? tag, count }))
    .sort((a, b) => b.count - a.count);

  // Negócio (CRM)
  const mrr = engs.filter((e) => e.lifecycle === 'ativo').reduce((s, e) => s + (e.mrr ?? 0), 0);
  const atrasado = recs.filter((r) => r.status === 'pendente' && r.due_date < todayStr).reduce((s, r) => s + r.amount, 0);
  const clientesAtivos = new Set(
    engs.filter((e) => (e.lifecycle === 'ativo' || e.lifecycle === 'pausado') && e.organization_id).map((e) => e.organization_id),
  ).size;

  const data: DashboardData = {
    kpis: { visitas, conversao: visitas > 0 ? formEnviado / visitas : 0, formsEnviados: formEnviado, cliquesCta },
    siteFunnel,
    formFunnel,
    visitasPorDia,
    porCta,
    porServico,
    negocio: { mrr, atrasado, clientesAtivos, leadsTotal: leads.length, ganhos: wonDeals.count ?? 0 },
    eventosTotais: visitas + cliquesCta + formEvents.length,
  };

  return <DashboardView data={data} />;
}
