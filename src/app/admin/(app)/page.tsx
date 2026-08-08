import { getSupabaseAdmin, lerTudo } from '@/lib/supabase-admin';
import { DashboardView, type DashboardData, type DayCount, type MonthProjection } from './dashboard-view';
import { resolveRange } from './period';
import { pendingMonthly } from './financeiro/recurring';
import { SERVICE_LABELS, classifySource } from './_shared/site-metrics';
import { ALIQUOTA_NOTA, liquidoDaParcela, parcelasPorContrato, somarLiquido, type ContratoLiquido } from './_shared/liquido';

export const dynamic = 'force-dynamic';

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

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const range = resolveRange({ range: sp.range, from: sp.from, to: sp.to });
  const { fromISO, fromDate, toDate, days, siteToISO, siteToDate } = range;

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const todayStr = ymd(now);
  const fromStr = ymd(fromDate);
  const toStr = ymd(toDate);
  const countHead = { count: 'exact' as const, head: true };

  // As leituras de `events` vão paginadas (lerTudo): o PostgREST corta em 1000
  // linhas sem avisar, e um período com muita visita passaria a mostrar métrica
  // pela metade — errada, mas com cara de certa.
  const [pv, ctaRows, pvRows, leadRows, wonDeals, engRows, recRows, dealRows, dealInstRows] = await Promise.all([
    supabase.from('events').select('*', countHead).eq('type', 'page_view').gte('created_at', fromISO).lte('created_at', siteToISO),
    lerTudo<{ label: string | null }>((de, ate) =>
      supabase.from('events').select('label').eq('type', 'cta_click').gte('created_at', fromISO).lte('created_at', siteToISO).order('created_at').range(de, ate)),
    lerTudo<{ created_at: string; session_id: string | null; referrer: string | null; utm_source: string | null; page: string | null }>((de, ate) =>
      supabase.from('events').select('created_at, session_id, referrer, utm_source, page').eq('type', 'page_view').gte('created_at', fromISO).lte('created_at', siteToISO).order('created_at').range(de, ate)),
    supabase.from('lead_submissions').select('service_tag').gte('created_at', fromISO).lte('created_at', siteToISO),
    supabase.from('deals').select('*', countHead).eq('stage', 'ganho'),
    supabase.from('engagements').select('id, organization_id, lifecycle, type, mrr, start_date, end_date, repasse_valor, precisa_nota'),
    supabase.from('receivables').select('amount, status, due_date, paid_at, paid_amount, engagement_id'),
    supabase.from('deals').select('id, stage, mrr, repasse_valor, precisa_nota'),
    supabase.from('deal_installments').select('deal_id, amount, due_date'),
  ]);

  const ctas = ctaRows.data;
  const leads = (leadRows.data ?? []) as { service_tag: string | null }[];
  const engs = (engRows.data ?? []) as {
    id: string; organization_id: string | null; lifecycle: string; type: string;
    mrr: number | null; start_date: string | null; end_date: string | null;
    repasse_valor: number | null; precisa_nota: boolean | null;
  }[];
  const recs = (recRows.data ?? []) as { amount: number; status: string; due_date: string; paid_at: string | null; paid_amount: number | null; engagement_id: string | null }[];

  // Parcelas dos negócios ainda em aberto: é a parte da projeção que depende de
  // fechar. Negócio ganho já virou contrato e aparece como parcela a receber.
  const abertos = new Map(
    ((dealRows.data ?? []) as { id: string; stage: string; mrr: number | null; repasse_valor: number | null; precisa_nota: boolean | null }[])
      .filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido')
      .map((d) => [
        d.id,
        // Negócio recorrente segue a régua do recorrente: o repasse pesa em cada
        // mensalidade, não é rateado entre elas.
        { type: (d.mrr ?? 0) > 0 ? 'recorrente' : 'pontual', repasse_valor: d.repasse_valor, precisa_nota: d.precisa_nota ?? false } as ContratoLiquido,
      ]),
  );
  const parcelasCruas = ((dealInstRows.data ?? []) as { deal_id: string; amount: number; due_date: string }[])
    .filter((p) => abertos.has(p.deal_id));
  // Quantas parcelas cada negócio tem, para ratear o repasse do pontual.
  const parcelasDoDeal = new Map<string, number>();
  for (const p of parcelasCruas) parcelasDoDeal.set(p.deal_id, (parcelasDoDeal.get(p.deal_id) ?? 0) + 1);
  const parcelasPipeline = parcelasCruas.map((p) => ({
    ...p,
    negocio: abertos.get(p.deal_id) ?? null,
    parcelas: parcelasDoDeal.get(p.deal_id) ?? 1,
  }));
  const visitas = pv.count ?? 0;

  // ── Site: visitas por dia (bucket adapta ao tamanho do intervalo) ──
  const bucketDays = days <= 45 ? 1 : days <= 180 ? 7 : 30;
  const stepMs = bucketDays * 86_400_000;
  const starts: Date[] = [];
  const buckets = new Map<string, number>();
  for (let t = fromDate.getTime(); t <= siteToDate.getTime(); t += stepMs) {
    const d = new Date(t);
    starts.push(d);
    buckets.set(ymd(d), 0);
  }
  for (const row of pvRows.data) {
    const idx = Math.floor((new Date(row.created_at).getTime() - fromDate.getTime()) / stepMs);
    const start = starts[idx];
    if (start) buckets.set(ymd(start), (buckets.get(ymd(start)) ?? 0) + 1);
  }
  const visitasPorDia: DayCount[] = starts.map((d) => ({ day: ymd(d), count: buckets.get(ymd(d)) ?? 0 }));

  // ── Site: origem, CTA, leads por serviço ──
  // A origem sai dos mesmos page_views já carregados: buscar a tabela de novo só
  // para reler referrer/utm era uma consulta a mais pela mesma coisa.
  const srcData = pvRows.data;
  const sourceMap = new Map<string, number>();
  for (const r of srcData) sourceMap.set(classifySource(r.referrer, r.utm_source), (sourceMap.get(classifySource(r.referrer, r.utm_source)) ?? 0) + 1);
  const porOrigem = [...sourceMap.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  // Páginas mais vistas: sem isso, "123 visitas" é um número solto e não dá para
  // saber se veio da home, do blog ou de alguém mexendo nos apps o dia inteiro.
  const pageMap = new Map<string, number>();
  for (const r of pvRows.data) {
    // O prefixo de idioma (/pt, /en) é a mesma página para quem lê a métrica.
    const limpa = (r.page ?? '/').replace(/^\/(pt|en)(?=\/|$)/, '') || '/';
    pageMap.set(limpa, (pageMap.get(limpa) ?? 0) + 1);
  }
  const porPagina = [...pageMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

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
  // Vale o que entrou de verdade (paid_amount), não o valor cheio da parcela —
  // um pagamento parcial não pode virar faturamento cheio. Mesma régua do Financeiro.
  const recebidoDe = (r: { amount: number; paid_amount: number | null }) => r.paid_amount ?? r.amount;
  // O número de destaque é o VALOR COBRADO. Repasse ao parceiro e nota são
  // custos em cima dele: entram como "o que sobra" na linha de apoio e, no caso
  // da nota, num cartão próprio. Encolher o faturamento pelo imposto faria o
  // painel discordar do contrato que foi assinado.
  const contratoDe = (e: (typeof engs)[number]): ContratoLiquido =>
    ({ type: e.type, repasse_valor: e.repasse_valor, precisa_nota: e.precisa_nota ?? false });
  const contratos = new Map<string, ContratoLiquido>(engs.map((e) => [e.id, contratoDe(e)]));
  const nParcelas = parcelasPorContrato(recs);
  const somar = (linhas: typeof recs, valorDe: (r: (typeof recs)[number]) => number = (r) => r.amount) =>
    linhas.reduce((s, r) => s + valorDe(r), 0);
  const somarNet = (linhas: typeof recs, valorDe?: (r: (typeof recs)[number]) => number) =>
    somarLiquido(linhas, contratos, nParcelas, valorDe);
  // Quanto de imposto sai de uma lista de parcelas.
  const somarNota = (linhas: typeof recs, valorDe: (r: (typeof recs)[number]) => number = (r) => r.amount) =>
    linhas.reduce((s, r) => {
      const c = r.engagement_id ? contratos.get(r.engagement_id) : null;
      return s + (c?.precisa_nota ? valorDe(r) * ALIQUOTA_NOTA : 0);
    }, 0);

  const recebidas = recs.filter((r) => r.status === 'recebido' && r.paid_at && r.paid_at >= fromStr && r.paid_at <= toStr);
  // A receber = pendente ainda no prazo com vencimento DENTRO do período escolhido.
  // Os presets de mês/ano cobrem o período inteiro (ver period.ts), então o que
  // vence mais pra frente no mesmo recorte entra aqui em vez de sumir.
  const aReceberLinhas = recs.filter((r) => r.status === 'pendente' && r.due_date >= todayStr && r.due_date >= fromStr && r.due_date <= toStr);
  // Em atraso = status 'atrasado' OU pendente já vencido (regra unificada).
  const atrasadas = recs.filter((r) => r.status === 'atrasado' || (r.status === 'pendente' && r.due_date < todayStr));
  const ativos = engs.filter((e) => e.lifecycle === 'ativo');

  // O período INTEIRO: o que já entrou junto com o que ainda vem, na mesma régua
  // do cartão de mês do Financeiro. Sem ele, o painel mostrava as duas metades
  // e deixava a soma por conta de quem lê — o total só existia no gráfico, e
  // referente ao ano, não ao período escolhido. Cancelada fica de fora, que é
  // dinheiro que não vem mais.
  const doPeriodo = recs.filter(
    (r) => r.status !== 'cancelado' && r.due_date >= fromStr && r.due_date <= toStr,
  );

  const total = somar(doPeriodo, recebidoDe);
  const faturamento = somar(recebidas, recebidoDe);
  const aReceber = somar(aReceberLinhas);
  const emAtraso = somar(atrasadas);
  const mrr = ativos.reduce((s, e) => s + (e.mrr ?? 0), 0);
  const notaDoPeriodo = somarNota(recebidas, recebidoDe);
  const clientesAtivos = new Set(engs.filter((e) => (e.lifecycle === 'ativo' || e.lifecycle === 'pausado') && e.organization_id).map((e) => e.organization_id)).size;

  // Receita mês a mês. O passado é o que entrou; o futuro separa o que já está
  // contratado (parcelas dos contratos) do que ainda depende de fechar (parcelas
  // dos negócios em aberto no pipeline).
  // A janela vai de janeiro do ano corrente até 12 meses à frente: cobre tanto a
  // visão "ano inteiro" quanto a "próximos 12 meses", e quem escolhe é o gráfico.
  const mesAtualKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Vencimentos já lançados por contrato: base para prever as mensalidades dos
  // meses à frente que ainda não foram lançadas (mesma régua do Financeiro).
  const duesByEng = new Map<string, string[]>();
  for (const r of recs) {
    if (!r.engagement_id) continue;
    duesByEng.set(r.engagement_id, [...(duesByEng.get(r.engagement_id) ?? []), r.due_date]);
  }

  const receitaPorMes: MonthProjection[] = [];
  const primeiroMes = new Date(now.getFullYear(), 0, 1);
  const ultimoMes = new Date(now.getFullYear(), now.getMonth() + 12, 1);
  for (let d = primeiroMes; d <= ultimoMes; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    // Mensalidade de contrato ativo que ainda não virou parcela também é receita
    // contratada: sem isso a projeção despenca nos meses à frente só porque o
    // lançamento é manual. Passado fica de fora — lá vale o que aconteceu.
    const recorrentePrevisto =
      key >= mesAtualKey
        ? pendingMonthly(engs, duesByEng, key).reduce((s, p) => s + (p.eng.mrr ?? 0), 0)
        : 0;
    receitaPorMes.push({
      key,
      mes: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      recebido: somar(recs.filter((r) => r.status === 'recebido' && r.paid_at?.startsWith(key)), recebidoDe),
      aReceber:
        somar(recs.filter((r) => r.status !== 'recebido' && r.status !== 'cancelado' && r.due_date.startsWith(key))) +
        recorrentePrevisto,
      pipeline: parcelasPipeline
        .filter((p) => p.due_date.startsWith(key))
        .reduce((s, p) => s + p.amount, 0),
      atual: key === mesAtualKey,
    });
  }

  // Sessões únicas + tempo médio de sessão (da 1ª à última visualização de página).
  const sessMap = new Map<string, { min: number; max: number }>();
  for (const r of pvRows.data) {
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
    negocio: {
      total, faturamento, aReceber, emAtraso, mrr, clientesAtivos,
      // O que sobra de cada número depois do repasse ao parceiro e da nota.
      liquidos: {
        total: somarNet(doPeriodo, recebidoDe),
        faturamento: somarNet(recebidas, recebidoDe),
        aReceber: somarNet(aReceberLinhas),
        emAtraso: somarNet(atrasadas),
        mrr: ativos.reduce((s, e) => s + liquidoDaParcela(e.mrr ?? 0, contratoDe(e)), 0),
      },
      // A parte de nota dentro de cada um: é o que deixa o cartão dizer se a
      // diferença veio do imposto, do repasse ao parceiro, ou dos dois.
      notas: {
        total: somarNota(doPeriodo, recebidoDe),
        faturamento: notaDoPeriodo,
        aReceber: somarNota(aReceberLinhas),
        emAtraso: somarNota(atrasadas),
        mrr: ativos.reduce((s, e) => s + ((e.precisa_nota ?? false) ? (e.mrr ?? 0) * ALIQUOTA_NOTA : 0), 0),
      },
      nota: notaDoPeriodo,
      ganhos: wonDeals.count ?? 0,
      receitaPorMes,
    },
    site: {
      visitas,
      sessoes,
      tempoMedioSegundos,
      conversao: sessoes > 0 ? leads.length / sessoes : 0,
      leads: leads.length,
      visitasPorDia,
      porPagina,
      porOrigem,
      porCta,
      porServico,
    },
    temDadosSite: visitas + ctas.length > 0,
  };

  return <DashboardView data={data} />;
}
