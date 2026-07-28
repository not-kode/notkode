// Visão geral do /admin — NEGÓCIO (faturamento/CRM) primeiro, SITE (tracking) depois.
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

export type FunnelStep = { label: string; count: number; origins?: { label: string; count: number }[] };
/** mixedVersions: o período pega antes e depois de uma mudança na ordem do formulário. */
export type FormFunnel = { form: string; formType?: string | null; steps: FunnelStep[]; mixedVersions?: boolean };
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
    porOrigem: CtaCount[];
    porCta: CtaCount[];
    porServico: ServiceCount[];
    formFunnels: FormFunnel[];
  };
  temDadosSite: boolean;
};

const card = 'rounded-md border border-[#191918]/[0.08] bg-surface-base';

function Kpi({ label, value, tone, hint }: { label: string; value: string; tone?: 'accent' | 'danger'; hint?: string }) {
  const valueTone = tone === 'accent' ? 'text-primary' : tone === 'danger' ? 'text-danger' : 'text-text-primary';
  return (
    <div className={`${card} p-4`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className={`mt-2 font-mono text-[26px] font-medium leading-none tracking-tight ${valueTone}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[10px] text-text-muted">{hint}</p>}
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

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="py-8 text-center text-sm text-text-muted">{children}</p>
);

function biggestDropIndex(steps: FunnelStep[]): number {
  let worst = -1, worstRatio = 1;
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1].count;
    if (prev <= 0) continue;
    const ratio = steps[i].count / prev;
    if (ratio < worstRatio) { worstRatio = ratio; worst = i; }
  }
  return worst;
}

// ── Funil de formulário ──────────────────────────────────────────────────────
// Uma etapa por linha, com a leitura que interessa: quantos chegaram e quantos
// se perderam desde a etapa anterior. A barra sozinha dizia pouco, porque a
// primeira é sempre 100% e as outras viravam faixas quase iguais.

function FunnelRow({ step, prev, top, isDrop, isLast }: {
  step: FunnelStep; prev: number | null; top: number; isDrop: boolean; isLast: boolean;
}) {
  const w = top > 0 && step.count > 0 ? Math.max(1.5, (step.count / top) * 100) : 0;
  const perdeu = prev !== null ? prev - step.count : 0;
  const barTone = isLast ? 'bg-primary' : isDrop ? 'bg-danger/70' : 'bg-navy/85';
  const origins = step.origins ?? [];

  return (
    <div className="group relative flex items-center gap-3">
      <div
        className={`w-32 shrink-0 truncate text-right text-xs sm:w-40 ${isDrop ? 'font-medium text-danger' : 'text-text-secondary'}`}
        title={step.label}
      >
        {step.label}
      </div>

      <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-[#191918]/[0.06]">
        <div className={`h-full rounded-sm ${barTone}`} style={{ width: `${w}%` }} />
      </div>

      {/* Chegaram aqui, e o que se perdeu no caminho até aqui. */}
      <div className="flex w-28 shrink-0 items-baseline justify-end gap-2">
        <span className="font-mono text-xs font-medium tabular-nums text-text-primary">{nf(step.count)}</span>
        <span className={`font-mono text-[11px] tabular-nums ${isDrop ? 'text-danger' : 'text-text-muted'}`}>
          {perdeu > 0 ? `−${nf(perdeu)}` : prev === null ? pct(step.count, top) : '—'}
        </span>
      </div>

      {origins.length > 0 && (
        <div className="pointer-events-none absolute left-32 top-full z-30 mt-1 hidden min-w-[11rem] max-w-[16rem] rounded-md border border-[#191918]/[0.10] bg-surface-base p-2.5 shadow-lg group-hover:block sm:left-40">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            De onde vieram · {nf(step.count)}
          </p>
          <ul className="flex flex-col gap-1">
            {origins.map((o) => (
              <li key={o.label} className="flex items-center justify-between gap-4 text-[12px]">
                <span className="text-text-secondary">{o.label}</span>
                <span className="font-mono tabular-nums text-text-primary">{nf(o.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FormFunnelCard({ funnel }: { funnel: FormFunnel }) {
  const steps = funnel.steps;
  const started = steps[0]?.count ?? 0;
  const sent = steps[steps.length - 1]?.count ?? 0;
  const drop = biggestDropIndex(steps);
  const converteu = sent > 0;

  return (
    <div className="rounded-md border border-[#191918]/[0.06] p-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] font-medium tracking-tight text-text-primary">
          {funnel.form}
          {funnel.formType && <span className="ml-1.5 font-normal normal-case text-text-muted">· {funnel.formType}</span>}
        </p>
        <p className="font-mono text-[11px] text-text-muted">
          <span className={converteu ? 'font-medium text-primary' : 'text-text-secondary'}>{pct(sent, started)}</span> conversão
        </p>
      </div>
      <p className="mb-3 text-[11px] text-text-muted">
        {nf(started)} mexeram no formulário · {nf(sent)} enviaram
      </p>

      <div className="flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <FunnelRow
            key={`${step.label}-${i}`}
            step={step}
            prev={i === 0 ? null : steps[i - 1].count}
            top={started || 1}
            isDrop={i === drop}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>

      {drop > 0 && steps[drop - 1].count > steps[drop].count && (
        <p className="mt-3 text-[11px] text-text-secondary">
          Maior perda: {nf(steps[drop - 1].count - steps[drop].count)} de {nf(steps[drop - 1].count)} pararam em{' '}
          <span className="font-medium text-danger">{steps[drop].label}</span>.
        </p>
      )}

      {funnel.mixedVersions && (
        <p className="mt-2 text-[11px] text-warning">
          O formulário mudou de ordem dentro deste período. As etapas mostram a versão atual; o que foi medido antes da
          mudança ficou de fora.
        </p>
      )}
    </div>
  );
}

export function DashboardView({ data }: { data: DashboardData }) {
  const { negocio: n, site: s, rangeLabel } = data;
  const semVisitas = s.visitasPorDia.every((d) => d.count === 0);
  const temReceita = n.receitaPorMes.some((m) => m.recebido + m.aReceber + m.pipeline > 0);

  return (
    <div className="-mx-4 -my-6 min-h-full bg-surface-elevated px-4 py-6 md:-mx-8 md:-my-8 md:px-8 md:py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-mono text-xl font-medium tracking-tight text-text-primary">Visão geral</h1>
          <p className="mt-1 text-sm text-text-muted">Negócio e site num lugar só.</p>
        </div>
        <Suspense fallback={null}><PeriodFilter /></Suspense>
      </header>

      {/* ════════════════ NEGÓCIO — o que importa primeiro ════════════════ */}
      <GroupLabel>Negócio · {rangeLabel}</GroupLabel>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Faturamento" value={brl(n.faturamento)} tone="accent" hint={`recebido · ${rangeLabel}`} />
        <Kpi label="A receber" value={brl(n.aReceber)} hint={`no prazo · ${rangeLabel}`} />
        <Kpi label="Em atraso" value={brl(n.emAtraso)} tone={n.emAtraso > 0 ? 'danger' : undefined} hint="vencido · total" />
        <Kpi label="MRR ativo" value={brl(n.mrr)} hint="recorrente/mês · hoje" />
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

      {/* Formulários — card dedicado (há mais de um formulário no site) */}
      <div className="mb-6">
        <Section title="Formulários" sub={`· por página · onde as pessoas param · ${rangeLabel}`}>
          {s.formFunnels.length === 0 ? (
            <p className="py-2 text-sm text-text-muted">Ninguém mexeu num formulário no período.</p>
          ) : (
            (() => {
              // Formulário com pouquíssima gente não merece o mesmo espaço: vai para um
              // bloco fechado, senão a tela dá o mesmo peso a 9 sessões e a 3.
              const relevantes = s.formFunnels.filter((f) => (f.steps[0]?.count ?? 0) >= 5);
              const poucos = s.formFunnels.filter((f) => (f.steps[0]?.count ?? 0) < 5);
              return (
                <>
                  <div className="flex flex-col gap-4">
                    {relevantes.map((f) => <FormFunnelCard key={f.form} funnel={f} />)}
                  </div>

                  {poucos.length > 0 && (
                    <details className={relevantes.length ? 'mt-4' : ''}>
                      <summary className="cursor-pointer font-mono text-[11px] text-text-muted">
                        Pouca amostra ainda ({poucos.length}): {poucos.map((f) => f.form).join(', ')}
                      </summary>
                      <div className="mt-3 flex flex-col gap-4">
                        {poucos.map((f) => <FormFunnelCard key={f.form} funnel={f} />)}
                      </div>
                    </details>
                  )}

                  <p className="mt-4 text-[11px] text-text-muted">
                    Cada linha mostra quantos chegaram até ali e, ao lado, quantos se perderam desde a etapa anterior.
                    &quot;Mexeram&quot; conta quem interagiu de verdade, não quem só viu a página.
                  </p>
                </>
              );
            })()
          )}
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
