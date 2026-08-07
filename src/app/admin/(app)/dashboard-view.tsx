// Dashboard do /admin — NEGÓCIO (faturamento/CRM) primeiro, SITE (tracking) depois.
// Tudo obedece ao filtro de período no topo. Componente de apresentação (server).
// Identidade Notkode: creme quente + tinta (#191918/navy), azul só como acento.
import { Suspense } from 'react';
import { PeriodFilter } from './period-filter';
import { VisitsChart, SourceDonut, RankBars, RevenueProjection } from './charts';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const nf = (n: number) => n.toLocaleString('pt-BR');
const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : '—');
const fmtDur = (secs: number) => {
  if (secs <= 0) return '—';
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s ? `${m}min ${s}s` : `${m}min`;
};

export type ServiceCount = { tag: string; label: string; count: number };
export type CtaCount = { label: string; count: number };
export type DayCount = { day: string; count: number };
/** Mês da projeção: o que entrou, o que está contratado e o que depende do pipeline. */
export type MonthProjection = {
  /** AAAA-MM, usado para recortar a janela (ano corrente x próximos 12 meses). */
  key: string;
  mes: string;
  recebido: number;
  aReceber: number;
  pipeline: number;
  atual: boolean;
};
export type DashboardData = {
  rangeLabel: string;
  negocio: {
    faturamento: number;
    aReceber: number;
    emAtraso: number;
    mrr: number;
    /** Os mesmos números antes do repasse ao parceiro e da nota fiscal. */
    brutos: { faturamento: number; aReceber: number; emAtraso: number; mrr: number };
    clientesAtivos: number;
    ganhos: number;
    receitaPorMes: MonthProjection[];
  };
  site: {
    visitas: number;
    sessoes: number;
    tempoMedioSegundos: number;
    conversao: number;
    leads: number;
    visitasPorDia: DayCount[];
    porPagina: CtaCount[];
    porOrigem: CtaCount[];
    porCta: CtaCount[];
    porServico: ServiceCount[];
  };
  temDadosSite: boolean;
};

const card = 'rounded-md border border-[#191918]/[0.08] bg-surface-base';

/**
 * `bruto` só aparece quando ele é maior que o valor mostrado: os cartões de
 * dinheiro trazem o LÍQUIDO (sem repasse ao parceiro nem nota), e quem viu o
 * valor cheio na proposta precisa achar a diferença sem ter que abrir o
 * financeiro.
 */
function Kpi({ label, value, tone, hint, bruto }: { label: string; value: string; tone?: 'accent' | 'danger'; hint?: string; bruto?: string }) {
  const valueTone = tone === 'accent' ? 'text-primary' : tone === 'danger' ? 'text-danger' : 'text-text-primary';
  return (
    <div className={`${card} p-4`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className={`mt-2 font-mono text-[26px] font-medium leading-none tracking-tight ${valueTone}`}>{value}</p>
      {(hint || bruto) && (
        <p className="mt-1.5 text-[10px] text-text-muted">
          {hint}
          {hint && bruto && ' · '}
          {bruto && <span className="text-text-muted/70">{bruto} bruto</span>}
        </p>
      )}
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className={`${card} p-5`}>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary">
        {title}{sub && <span className="ml-2 normal-case tracking-normal text-text-muted">{sub}</span>}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-2 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{children}</span>
      <span className="h-px flex-1 bg-[#191918]/[0.08]" />
    </div>
  );
}

/** O bruto só interessa quando há desconto: senão vira o mesmo número duas vezes. */
const soBruto = (bruto: number, liquido: number) => (bruto > liquido + 0.5 ? brl(bruto) : undefined);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="py-8 text-center text-sm text-text-muted">{children}</p>
);

export function DashboardView({ data }: { data: DashboardData }) {
  const { negocio: n, site: s, rangeLabel } = data;
  const semVisitas = s.visitasPorDia.every((d) => d.count === 0);
  const temReceita = n.receitaPorMes.some((m) => m.recebido + m.aReceber + m.pipeline > 0);

  return (
    <div className="-mx-4 -my-6 min-h-full bg-surface-elevated px-4 py-6 md:-mx-8 md:-my-8 md:px-8 md:py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-mono text-xl font-medium tracking-tight text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">Negócio e site num lugar só.</p>
        </div>
        <Suspense fallback={null}><PeriodFilter /></Suspense>
      </header>

      {/* ════════════════ NEGÓCIO — o que importa primeiro ════════════════ */}
      <GroupLabel>Negócio · {rangeLabel}</GroupLabel>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Faturamento" value={brl(n.faturamento)} tone="accent" hint={`recebido · ${rangeLabel}`} bruto={soBruto(n.brutos.faturamento, n.faturamento)} />
        <Kpi label="A receber" value={brl(n.aReceber)} hint={`no prazo · ${rangeLabel}`} bruto={soBruto(n.brutos.aReceber, n.aReceber)} />
        <Kpi label="Em atraso" value={brl(n.emAtraso)} tone={n.emAtraso > 0 ? 'danger' : undefined} hint="vencido · total" bruto={soBruto(n.brutos.emAtraso, n.emAtraso)} />
        <Kpi label="MRR ativo" value={brl(n.mrr)} hint="recorrente/mês · hoje" bruto={soBruto(n.brutos.mrr, n.mrr)} />
        <Kpi label="Clientes ativos" value={nf(n.clientesAtivos)} hint="hoje" />
        <Kpi label="Negócios ganhos" value={nf(n.ganhos)} hint="desde o início" />
      </div>

      <div className="mb-8">
        <Section title="Receita por mês" sub="· realizado e projeção">
          {temReceita ? <RevenueProjection data={n.receitaPorMes} /> : <Empty>Sem receita registrada.</Empty>}
        </Section>
      </div>

      {/* ════════════════ SITE — tracking ════════════════ */}
      <GroupLabel>Site · {rangeLabel}</GroupLabel>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Visitas" value={nf(s.visitas)} hint="páginas vistas" />
        <Kpi label="Sessões" value={nf(s.sessoes)} hint="visitantes únicos" />
        <Kpi label="Tempo médio" value={fmtDur(s.tempoMedioSegundos)} hint="por sessão" />
        <Kpi label="Conversão" value={pct(s.leads, s.sessoes)} tone="accent" hint="sessão → lead" />
        <Kpi label="Leads" value={nf(s.leads)} hint="no período" />
      </div>

      <div className="mb-6">
        <Section title="Visitas por dia" sub={`· ${rangeLabel}`}>
          {semVisitas ? <Empty>Sem visitas no período.</Empty> : <VisitsChart data={s.visitasPorDia} />}
        </Section>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Páginas mais vistas" sub={`· ${rangeLabel}`}>
          {s.porPagina.length === 0 ? (
            <Empty>Sem visitas no período.</Empty>
          ) : (
            <>
              <RankBars data={s.porPagina} labelWidth={150} />
              <p className="mt-4 text-[11px] text-text-muted">
                Onde as visitas aconteceram. /apps é a área de produtos, e não o site institucional.
              </p>
            </>
          )}
        </Section>

        <Section title="Origem das visitas" sub={`· ${rangeLabel}`}>
          {s.porOrigem.length === 0 ? (
            <Empty>Sem visitas no período.</Empty>
          ) : (
            <>
              <SourceDonut data={s.porOrigem} />
              <p className="mt-4 text-[11px] text-text-muted">De onde a pessoa chegou. &quot;Direto&quot; = digitou o link, salvos ou apps sem referrer.</p>
            </>
          )}
        </Section>

        <Section title="Cliques por CTA" sub={`· ${rangeLabel}`}>
          {s.porCta.length === 0 ? <Empty>Nenhum clique no período.</Empty> : <RankBars data={s.porCta} labelWidth={150} />}
        </Section>
      </div>

      {s.porServico.length > 0 && (
        <div className="mb-6">
          <Section title="Leads por serviço" sub={`· ${rangeLabel}`}>
            <RankBars data={s.porServico.map((x) => ({ label: x.label, count: x.count }))} labelWidth={160} />
          </Section>
        </div>
      )}
    </div>
  );
}
