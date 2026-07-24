// Visão geral do /admin — NEGÓCIO (faturamento/CRM) primeiro, SITE (tracking) depois.
// Tudo obedece ao filtro de período no topo. Componente de apresentação (server).
// Identidade Notkode: creme quente + tinta (#191918/navy), azul só como acento.
import { Suspense } from 'react';
import { PeriodFilter } from './period-filter';
import { VisitsChart, SourceDonut, RankBars, RevenueBars } from './charts';

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

export type FunnelStep = { label: string; count: number };
export type FormFunnel = { form: string; steps: FunnelStep[] };
export type FormDemand = {
  service: string;
  label: string;
  total: number;
  enviados: number;
  one: number;
  multi: number;
  needs: { label: string; count: number }[];
};
export type ServiceCount = { tag: string; label: string; count: number };
export type CtaCount = { label: string; count: number };
export type DayCount = { day: string; count: number };
export type MonthRevenue = { mes: string; valor: number };
export type DashboardData = {
  rangeLabel: string;
  negocio: {
    faturamento: number;
    aReceber: number;
    emAtraso: number;
    mrr: number;
    mrrNovo: number;
    novoAvulso: number;
    contratosNovos: number;
    clientesAtivos: number;
    ganhos: number;
    receitaPorMes: MonthRevenue[];
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
    formDemand: FormDemand[];
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

// Barra de funil: largura e % SEMPRE em relação ao início (quantos dos que
// começaram chegaram até aqui). Barra em tinta; vermelho no maior abandono;
// azul na etapa "Enviou".
function Bar({ label, value, top, drop, wLabel = 'w-28', highlight }: { label: string; value: number; top: number; drop?: boolean; wLabel?: string; highlight?: boolean }) {
  // Zero é zero: sem largura mínima, senão a barra vazia vira um "pontinho" enganoso.
  const w = top > 0 && value > 0 ? Math.max(1.5, (value / top) * 100) : 0;
  const barTone = highlight ? 'bg-primary' : drop ? 'bg-danger/70' : 'bg-navy/85';
  return (
    <div className="flex items-center gap-3">
      <div className={`${wLabel} shrink-0 truncate text-right text-xs ${drop ? 'font-medium text-danger' : 'text-text-secondary'}`} title={label}>{label}</div>
      <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-[#191918]/[0.06]">
        <div className={`h-full rounded-sm ${barTone}`} style={{ width: `${w}%` }} />
      </div>
      <div className="flex w-20 shrink-0 items-baseline justify-end gap-1.5">
        <span className="font-mono text-xs font-medium text-text-primary">{nf(value)}</span>
        <span className="font-mono text-[11px] text-text-muted">{pct(value, top)}</span>
      </div>
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

export function DashboardView({ data }: { data: DashboardData }) {
  const { negocio: n, site: s, rangeLabel } = data;
  const semVisitas = s.visitasPorDia.every((d) => d.count === 0);
  const temReceita = n.receitaPorMes.some((m) => m.valor > 0);

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

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Faturamento" value={brl(n.faturamento)} tone="accent" hint="recebido no período" />
        <Kpi label="A receber" value={brl(n.aReceber)} hint="no prazo, até o fim do mês" />
        <Kpi label="Em atraso" value={brl(n.emAtraso)} tone={n.emAtraso > 0 ? 'danger' : undefined} hint="vencido" />
        <Kpi label="MRR ativo" value={brl(n.mrr)} hint="recorrente/mês" />
        <Kpi label="MRR novo" value={brl(n.mrrNovo)} tone={n.mrrNovo > 0 ? 'accent' : undefined} hint={`recorrente/mês iniciado no período${n.contratosNovos > 0 ? ` · ${nf(n.contratosNovos)} contrato${n.contratosNovos === 1 ? '' : 's'}` : ''}`} />
        <Kpi label="Novo avulso" value={brl(n.novoAvulso)} hint="pontual iniciado no período" />
        <Kpi label="Clientes ativos" value={nf(n.clientesAtivos)} hint="hoje" />
        <Kpi label="Negócios ganhos" value={nf(n.ganhos)} hint="desde o início" />
      </div>

      <div className="mb-8">
        <Section title="Receita por mês" sub="· 12 meses (recebido)">
          {temReceita ? <RevenueBars data={n.receitaPorMes} /> : <Empty>Sem receita registrada.</Empty>}
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
        <Section title="Formulários" sub={`· onde as pessoas param · ${rangeLabel}`}>
          {s.formFunnels.length === 0 ? (
            <p className="py-2 text-sm text-text-muted">Ninguém começou um formulário no período.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {s.formFunnels.map((f) => {
                  const top = f.steps[0]?.count ?? 1;
                  const started = f.steps[0]?.count ?? 0;
                  const sent = f.steps[f.steps.length - 1]?.count ?? 0;
                  const drop = biggestDropIndex(f.steps);
                  const smallSample = started < 10;
                  // Onde cada formulário mora no site (pra ninguém confundir os funis).
                  const FORM_WHERE: Record<string, string> = {
                    'Orçamento': 'calculadora das páginas de site/landing',
                    'Qualificação': 'form de Sistemas com IA, Parcerias e Agentes',
                  };
                  return (
                    <div key={f.form} className="rounded-md border border-[#191918]/[0.06] p-4">
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <p className="font-mono text-[11px] font-medium tracking-tight text-text-primary">
                          {f.form}
                          {FORM_WHERE[f.form] && (
                            <span className="ml-1.5 font-normal normal-case text-text-muted">· {FORM_WHERE[f.form]}</span>
                          )}
                        </p>
                        <p className="font-mono text-[11px] text-text-muted">
                          <span className="font-medium text-primary">{pct(sent, started)}</span> conversão
                        </p>
                      </div>
                      <p className="mb-3 text-[11px] text-text-muted">
                        {nf(started)} começaram · {nf(sent)} enviaram
                        {smallSample && <span className="ml-1.5 text-warning">· amostra pequena</span>}
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {f.steps.map((step, i) => (
                          <Bar key={step.label} label={step.label} value={step.count} top={top} drop={i === drop} highlight={i === f.steps.length - 1} wLabel="w-44" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[11px] text-text-muted">
                A % é sobre quem começou o formulário (quanto chegou até cada etapa). Vermelho = maior ponto de abandono.
              </p>
            </>
          )}
        </Section>
      </div>

      {/* O que as pessoas pedem — necessidades marcadas nos formulários, inclusive
          de quem não enviou (captura progressiva). Mostra a demanda real por serviço. */}
      <div className="mb-6">
        <Section title="O que as pessoas pedem" sub={`· necessidades marcadas · ${rangeLabel}`}>
          {s.formDemand.length === 0 ? (
            <p className="py-2 text-sm text-text-muted">
              Ninguém marcou uma necessidade no período. Assim que começarem a escolher o que precisam no formulário, aparece aqui — mesmo quem não enviar.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {s.formDemand.map((d) => (
                <div key={d.service} className="rounded-md border border-[#191918]/[0.06] p-4">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <p className="font-mono text-[11px] font-medium tracking-tight text-text-primary">{d.label}</p>
                    <p className="font-mono text-[11px] text-text-muted">
                      {nf(d.total)} {d.total === 1 ? 'pessoa' : 'pessoas'}
                      {d.enviados > 0 && <span className="text-success"> · {nf(d.enviados)} enviou</span>}
                    </p>
                  </div>
                  <p className="mb-3 text-[11px] text-text-muted">
                    {nf(d.one)} pediram <strong className="font-medium text-text-secondary">só um</strong> · {nf(d.multi)} pediram <strong className="font-medium text-text-secondary">vários</strong>
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <RankBars data={d.needs} labelWidth={150} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-[11px] text-text-muted">
            Conta cada pessoa que marcou ao menos uma necessidade (por sessão), tenha enviado ou não. “Vários” = marcou duas ou mais.
          </p>
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
