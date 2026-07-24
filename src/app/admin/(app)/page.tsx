import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DashboardView, type DashboardData, type DayCount, type FunnelStep, type FormFunnel } from './dashboard-view';
import { resolveRange } from './period';

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

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
    return utmSource;
  }
  if (!referrer) return 'Direto';
  let host: string;
  try {
    host = new URL(referrer).host.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'Direto';
  }
  if (!host || host.includes('notkode')) return 'Direto';
  for (const [test, label] of HOST_SOURCES) if (test(host)) return label;
  return host;
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const range = resolveRange({ range: sp.range, from: sp.from, to: sp.to });
  const { fromISO, toISO, fromDate, toDate, days } = range;

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const todayStr = ymd(now);
  const fromStr = ymd(fromDate);
  const toStr = ymd(toDate);
  const countHead = { count: 'exact' as const, head: true };

  const [pv, ctaRows, pvRows, srcRows, formRows, leadRows, wonDeals, engRows, recRows] = await Promise.all([
    supabase.from('events').select('*', countHead).eq('type', 'page_view').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('events').select('label').eq('type', 'cta_click').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('events').select('created_at, session_id, referrer, utm_source').eq('type', 'page_view').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('events').select('referrer, utm_source').eq('type', 'page_view').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('events').select('type, label, session_id, service_tag').in('type', ['form_start', 'form_step', 'form_submit']).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('lead_submissions').select('service_tag').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('deals').select('*', countHead).eq('stage', 'ganho'),
    supabase.from('engagements').select('organization_id, lifecycle, mrr, valor, type, start_date'),
    supabase.from('receivables').select('amount, status, due_date, paid_at'),
  ]);

  const ctas = (ctaRows.data ?? []) as { label: string | null }[];
  type FormEv = { type: string; label: string | null; session_id: string | null; service_tag: string | null };
  const formEvents = (formRows.data ?? []) as FormEv[];
  const leads = (leadRows.data ?? []) as { service_tag: string | null }[];
  const engs = (engRows.data ?? []) as { organization_id: string | null; lifecycle: string; mrr: number | null; valor: number | null; type: string; start_date: string | null }[];
  const recs = (recRows.data ?? []) as { amount: number; status: string; due_date: string; paid_at: string | null }[];
  const visitas = pv.count ?? 0;

  // ── Site: funil de formulário POR PÁGINA (service_tag) ──
  // Cada página tem seu formulário; mostramos, por página, quantos iniciaram e
  // quantos chegaram a cada etapa até enviar — pra ver em qual etapa a galera sai.
  const parseStep = (label: string | null) => {
    const parts = (label ?? '').split('::');
    return parts.length === 3 ? { form: parts[0], pos: Number(parts[1]), name: parts[2] } : null;
  };
  const prettyService = (s: string) => SERVICE_LABELS[s] ?? s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Origem de ENTRADA por sessão (a 1ª visualização de página): usada no tooltip do
  // funil pra mostrar de onde vieram as pessoas que chegaram a cada etapa.
  const sessOrigin = new Map<string, { t: number; origin: string }>();
  for (const r of (pvRows.data ?? []) as { created_at: string; session_id: string | null; referrer: string | null; utm_source: string | null }[]) {
    if (!r.session_id) continue;
    const t = new Date(r.created_at).getTime();
    const cur = sessOrigin.get(r.session_id);
    if (!cur || t < cur.t) sessOrigin.set(r.session_id, { t, origin: classifySource(r.referrer, r.utm_source) });
  }
  // Conjunto de sessões que satisfazem o predicado + a quebra por origem dessas sessões.
  const sessionsOf = (pred: (e: FormEv) => boolean) =>
    new Set(formEvents.filter((e) => pred(e) && e.session_id).map((e) => e.session_id as string));
  const originsOf = (sessions: Set<string>): { label: string; count: number }[] => {
    const m = new Map<string, number>();
    for (const s of sessions) {
      const o = sessOrigin.get(s)?.origin ?? 'Direto';
      m.set(o, (m.get(o) ?? 0) + 1);
    }
    return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  };

  const services = [...new Set(formEvents.map((e) => e.service_tag).filter((s): s is string => !!s))];
  const formFunnels: FormFunnel[] = services
    .map((svc) => {
      const inSvc = (e: FormEv) => e.service_tag === svc;
      // Nome do formulário daquela página (Qualificação, Orçamento…), pra legenda.
      const formType =
        formEvents.filter(inSvc).map((e) => (e.type === 'form_start' ? e.label : parseStep(e.label)?.form)).find((f): f is string => !!f) ?? null;
      const stepsMeta = new Map<number, string>();
      for (const e of formEvents) {
        if (!inSvc(e) || e.type !== 'form_step') continue;
        const p = parseStep(e.label);
        if (p) stepsMeta.set(p.pos, p.name);
      }
      const ordered = [...stepsMeta.entries()].sort((a, b) => a[0] - b[0]);
      const mkStep = (label: string, pred: (e: FormEv) => boolean): FunnelStep => {
        const sess = sessionsOf(pred);
        return { label, count: sess.size, origins: originsOf(sess) };
      };
      const steps: FunnelStep[] = [
        ...ordered.map(([pos, name]) =>
          mkStep(name, (e) => inSvc(e) && e.type === 'form_step' && parseStep(e.label)?.pos === pos),
        ),
        mkStep('Enviou', (e) => inSvc(e) && e.type === 'form_submit'),
      ];
      return { form: prettyService(svc), formType, steps };
    })
    .filter((f) => f.steps.some((s) => s.count > 0))
    .sort((a, b) => (b.steps[0]?.count ?? 0) - (a.steps[0]?.count ?? 0));

  // ── Site: visitas por dia (bucket adapta ao tamanho do intervalo) ──
  const bucketDays = days <= 45 ? 1 : days <= 180 ? 7 : 30;
  const stepMs = bucketDays * 86_400_000;
  const starts: Date[] = [];
  const buckets = new Map<string, number>();
  for (let t = fromDate.getTime(); t <= toDate.getTime(); t += stepMs) {
    const d = new Date(t);
    starts.push(d);
    buckets.set(ymd(d), 0);
  }
  for (const row of (pvRows.data ?? []) as { created_at: string }[]) {
    const idx = Math.floor((new Date(row.created_at).getTime() - fromDate.getTime()) / stepMs);
    const start = starts[idx];
    if (start) buckets.set(ymd(start), (buckets.get(ymd(start)) ?? 0) + 1);
  }
  const visitasPorDia: DayCount[] = starts.map((d) => ({ day: ymd(d), count: buckets.get(ymd(d)) ?? 0 }));

  // ── Site: origem, CTA, leads por serviço ──
  const srcData = (srcRows.data ?? []) as { referrer: string | null; utm_source: string | null }[];
  const sourceMap = new Map<string, number>();
  for (const r of srcData) sourceMap.set(classifySource(r.referrer, r.utm_source), (sourceMap.get(classifySource(r.referrer, r.utm_source)) ?? 0) + 1);
  const porOrigem = [...sourceMap.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const ctaMap = new Map<string, number>();
  for (const c of ctas) ctaMap.set(c.label ?? 'sem-rótulo', (ctaMap.get(c.label ?? 'sem-rótulo') ?? 0) + 1);
  const porCta = [...ctaMap.entries()].map(([label, count]) => ({ label: prettyCta(label), count })).sort((a, b) => b.count - a.count).slice(0, 8);

  // Rótulos de produto: tabela products (editável pelo sistema) com fallback pro código.
  const { data: prodRows } = await supabase.from('products').select('key, name');
  const productLabels: Record<string, string> = Object.fromEntries((prodRows ?? []).map((p) => [p.key, p.name]));

  const servicoMap = new Map<string, number>();
  for (const l of leads) servicoMap.set(l.service_tag ?? 'outros', (servicoMap.get(l.service_tag ?? 'outros') ?? 0) + 1);
  const porServico = [...servicoMap.entries()].map(([tag, count]) => ({ tag, label: productLabels[tag] ?? SERVICE_LABELS[tag] ?? tag, count })).sort((a, b) => b.count - a.count);

  // ── Negócio: faturamento no período + fluxo de caixa (fidedigno) ──
  const faturamento = recs.filter((r) => r.status === 'recebido' && r.paid_at && r.paid_at >= fromStr && r.paid_at <= toStr).reduce((s, r) => s + r.amount, 0);
  // A receber = pendente que ainda vai vencer, de hoje até o FIM DO MÊS do período.
  // (o período "este mês" vai só até hoje para o faturamento; aqui olhamos o mês
  //  inteiro para não zerar uma parcela que vence mais pra frente no mesmo mês.)
  const mesFim = ymd(new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0));
  const aReceber = recs.filter((r) => r.status === 'pendente' && r.due_date >= todayStr && r.due_date <= mesFim).reduce((s, r) => s + r.amount, 0);
  // Em atraso = status 'atrasado' OU pendente já vencido (regra unificada).
  const emAtraso = recs.filter((r) => r.status === 'atrasado' || (r.status === 'pendente' && r.due_date < todayStr)).reduce((s, r) => s + r.amount, 0);
  const mrr = engs.filter((e) => e.lifecycle === 'ativo').reduce((s, e) => s + (e.mrr ?? 0), 0);
  const clientesAtivos = new Set(engs.filter((e) => (e.lifecycle === 'ativo' || e.lifecycle === 'pausado') && e.organization_id).map((e) => e.organization_id)).size;

  // Novo no PERÍODO: contratos que COMEÇARAM (start_date) dentro do filtro. Base
  // mais fidedigna que a data de cadastro (que ficou toda no dia da migração).
  // Separa o mensal novo (MRR que passou a entrar) do avulso/pontual — sem misturar.
  const novoNoPeriodo = engs.filter((e) => e.start_date != null && e.start_date >= fromStr && e.start_date <= toStr);
  const mrrNovo = novoNoPeriodo.reduce((s, e) => s + (e.mrr ?? 0), 0);
  const novoAvulso = novoNoPeriodo.reduce((s, e) => s + (e.valor ?? 0), 0);
  const contratosNovos = novoNoPeriodo.length;

  // Receita por mês — 12 meses móveis (histórico, independente do filtro).
  const receitaPorMes: { mes: string; valor: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const valor = recs.filter((r) => r.status === 'recebido' && r.paid_at?.startsWith(key)).reduce((s, r) => s + r.amount, 0);
    receitaPorMes.push({ mes: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, valor });
  }

  // Sessões únicas + tempo médio de sessão (da 1ª à última visualização de página).
  const sessMap = new Map<string, { min: number; max: number }>();
  for (const r of (pvRows.data ?? []) as { created_at: string; session_id: string | null }[]) {
    if (!r.session_id) continue;
    const t = new Date(r.created_at).getTime();
    const cur = sessMap.get(r.session_id);
    if (!cur) sessMap.set(r.session_id, { min: t, max: t });
    else { if (t < cur.min) cur.min = t; if (t > cur.max) cur.max = t; }
  }
  const sessoes = sessMap.size;
  // Duração por sessão CORTADA em 30min: aba esquecida aberta (ou sessão interna
  // longa) estourava a média para horas irreais e minava a confiança no painel.
  const CAP_SESSAO_MS = 30 * 60 * 1000;
  const tempoMedioSegundos = sessoes > 0
    ? Math.round(
        [...sessMap.values()].reduce((acc, v) => acc + Math.min(v.max - v.min, CAP_SESSAO_MS), 0) / sessoes / 1000,
      )
    : 0;

  const data: DashboardData = {
    rangeLabel: range.label,
    negocio: { faturamento, aReceber, emAtraso, mrr, mrrNovo, novoAvulso, contratosNovos, clientesAtivos, ganhos: wonDeals.count ?? 0, receitaPorMes },
    site: {
      visitas,
      sessoes,
      tempoMedioSegundos,
      conversao: sessoes > 0 ? leads.length / sessoes : 0,
      leads: leads.length,
      visitasPorDia,
      porOrigem,
      porCta,
      porServico,
      formFunnels,
    },
    temDadosSite: visitas + ctas.length + formEvents.length > 0,
  };

  return <DashboardView data={data} />;
}
