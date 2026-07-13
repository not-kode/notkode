import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DashboardView, type DashboardData, type DayCount, type FunnelStep, type FormFunnel } from './dashboard-view';

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

// Classifica a origem de uma visita a partir do utm_source (prioritário) e, na
// falta, do host do referrer de entrada. Sem referrer externo → "Direto".
const HOST_SOURCES: [test: (h: string) => boolean, label: string][] = [
  [(h) => h.includes('google'), 'Google'],
  [(h) => h.includes('instagram') || h === 'ig', 'Instagram'],
  [(h) => h.includes('facebook') || h === 'fb.me', 'Facebook'],
  [(h) => h.includes('linkedin') || h === 'lnkd.in', 'LinkedIn'],
  [(h) => h === 't.co' || h.includes('twitter') || h === 'x.com', 'X (Twitter)'],
  [(h) => h.includes('bing'), 'Bing'],
  [(h) => h.includes('duckduckgo'), 'DuckDuckGo'],
  [(h) => h.includes('youtube'), 'YouTube'],
  [(h) => h.includes('whatsapp') || h === 'wa.me', 'WhatsApp'],
];
function classifySource(referrer: string | null, utmSource: string | null): string {
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (s.includes('insta') || s === 'ig') return 'Instagram';
    if (s.includes('google')) return 'Google';
    if (s.includes('face') || s === 'fb') return 'Facebook';
    if (s.includes('linkedin')) return 'LinkedIn';
    if (s.includes('whats')) return 'WhatsApp';
    return utmSource; // mantém o rótulo bruto da campanha
  }
  if (!referrer) return 'Direto';
  let host: string;
  try {
    host = new URL(referrer).host.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'Direto';
  }
  if (!host || host.includes('notkode')) return 'Direto'; // referrer interno residual
  for (const [test, label] of HOST_SOURCES) if (test(host)) return label;
  return host; // origem desconhecida → mostra o domínio cru
}

export default async function AdminHome() {
  const supabase = getSupabaseAdmin();
  const since30 = isoDaysAgo(30);
  const since14 = isoDaysAgo(14);
  const todayStr = new Date().toISOString().slice(0, 10);
  const countHead = { count: 'exact' as const, head: true };

  const [pv, cc, pvRows, srcRows, ctaRows, formRows, leadRows, wonDeals, engRows, recRows] = await Promise.all([
    supabase.from('events').select('*', countHead).eq('type', 'page_view').gte('created_at', since30),
    supabase.from('events').select('*', countHead).eq('type', 'cta_click').gte('created_at', since30),
    supabase.from('events').select('created_at').eq('type', 'page_view').gte('created_at', since14),
    supabase.from('events').select('referrer, utm_source').eq('type', 'page_view').gte('created_at', since30),
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

  // Funil de desistência POR FORMULÁRIO. O rótulo do form_step chega como
  // "<Form>::<posição>::<nome da etapa>"; agrupamos por form, ordenamos por posição
  // e anexamos "Enviou" (form_submit com label = nome do form). Eventos antigos
  // (label numérico, sem "::") são ignorados aqui — não têm nome de form nem de etapa.
  const parseStep = (label: string | null) => {
    const parts = (label ?? '').split('::');
    return parts.length === 3 ? { form: parts[0], pos: Number(parts[1]), name: parts[2] } : null;
  };
  const forms = [...new Set(
    formEvents.map((e) => (e.type === 'form_step' ? parseStep(e.label)?.form : e.type === 'form_start' ? e.label : null)).filter((f): f is string => !!f),
  )];
  const formFunnels: FormFunnel[] = forms.map((form) => {
    // (posição, nome) distintos deste form, na ordem das etapas
    const stepsMeta = new Map<number, string>();
    for (const e of formEvents) {
      if (e.type !== 'form_step') continue;
      const p = parseStep(e.label);
      if (p && p.form === form) stepsMeta.set(p.pos, p.name);
    }
    const ordered = [...stepsMeta.entries()].sort((a, b) => a[0] - b[0]);
    const steps: FunnelStep[] = [
      ...ordered.map(([pos, name]) => ({
        label: name,
        count: distinct((e) => e.type === 'form_step' && parseStep(e.label)?.form === form && parseStep(e.label)?.pos === pos),
      })),
      { label: 'Enviou', count: distinct((e) => e.type === 'form_submit' && e.label === form) },
    ];
    return { form, steps };
  }).filter((f) => f.steps.some((s) => s.count > 0));

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

  // Origem das visitas (referrer de entrada + utm_source)
  const srcData = (srcRows.data ?? []) as { referrer: string | null; utm_source: string | null }[];
  const sourceMap = new Map<string, number>();
  for (const r of srcData) {
    const key = classifySource(r.referrer, r.utm_source);
    sourceMap.set(key, (sourceMap.get(key) ?? 0) + 1);
  }
  const porOrigem = [...sourceMap.entries()]
    .map(([label, count]) => ({ label, count }))
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
    formFunnels,
    visitasPorDia,
    porOrigem,
    porCta,
    porServico,
    negocio: { mrr, atrasado, clientesAtivos, leadsTotal: leads.length, ganhos: wonDeals.count ?? 0 },
    eventosTotais: visitas + cliquesCta + formEvents.length,
  };

  return <DashboardView data={data} />;
}
