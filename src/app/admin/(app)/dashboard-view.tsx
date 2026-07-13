// Visão geral do /admin — desempenho do SITE (tracking) separado do NEGÓCIO (CRM).
// Componente de apresentação (server): sem estado, recebe tudo pronto.
// Identidade Notkode: creme quente + tinta (#191918/navy), azul só como acento pontual.

import { VisitsChart } from './visits-chart';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const nf = (n: number) => n.toLocaleString('pt-BR');
const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : '—');

export type FunnelStep = { label: string; count: number };
export type FormFunnel = { form: string; steps: FunnelStep[] };
export type ServiceCount = { tag: string; label: string; count: number };
export type CtaCount = { label: string; count: number };
export type DayCount = { day: string; count: number };
export type DashboardData = {
  kpis: { visitas: number; conversao: number; formsEnviados: number; cliquesCta: number };
  siteFunnel: FunnelStep[];
  formFunnels: FormFunnel[];
  visitasPorDia: DayCount[];
  porOrigem: CtaCount[];
  porCta: CtaCount[];
  porServico: ServiceCount[];
  negocio: { mrr: number; atrasado: number; clientesAtivos: number; leadsTotal: number; ganhos: number };
  eventosTotais: number;
};

// Card creme quente (#fffef2) sobre o canvas creme (#f3f2e7), filete de tinta discreto.
const card = 'rounded-md border border-[#191918]/[0.08] bg-surface-base';

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'accent' | 'danger' }) {
  const valueTone = tone === 'accent' ? 'text-primary' : tone === 'danger' ? 'text-danger' : 'text-text-primary';
  return (
    <div className={`${card} p-4`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className={`mt-2 font-mono text-[26px] font-medium leading-none tracking-tight ${valueTone}`}>{value}</p>
    </div>
  );
}

// Uma linha de barra horizontal — barra em tinta, número/percentual em mono à direita.
function Bar({ label, value, max, prev, drop, wLabel = 'w-36', highlight }: { label: string; value: number; max: number; prev?: number; drop?: boolean; wLabel?: string; highlight?: boolean }) {
  const w = max > 0 ? Math.max(1.5, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`${wLabel} shrink-0 truncate text-right text-xs text-text-secondary`} title={label}>{label}</div>
      <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-[#191918]/[0.06]">
        <div className={`h-full rounded-sm ${highlight ? 'bg-primary' : 'bg-navy/85'}`} style={{ width: `${w}%` }} />
      </div>
      <div className="flex w-24 shrink-0 items-baseline justify-end gap-1.5">
        <span className="font-mono text-xs font-medium text-text-primary">{nf(value)}</span>
        {prev != null && (
          <span className={`font-mono text-[11px] ${drop ? 'font-semibold text-danger' : 'text-text-muted'}`}>{pct(value, prev)}</span>
        )}
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

// Índice do passo com a maior queda relativa (para destacar no funil).
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
  const semTracking = data.eventosTotais === 0;
  const maxServico = Math.max(1, ...data.porServico.map((s) => s.count));
  const maxOrigem = Math.max(1, ...data.porOrigem.map((o) => o.count));
  const maxCta = Math.max(1, ...data.porCta.map((c) => c.count));
  const totalOrigem = data.porOrigem.reduce((s, o) => s + o.count, 0);
  const siteTop = data.siteFunnel[0]?.count ?? 1;

  return (
    <div className="-mx-4 -my-6 min-h-full bg-surface-elevated px-4 py-6 md:-mx-8 md:-my-8 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="font-mono text-xl font-medium tracking-tight text-text-primary">Visão geral</h1>
        <p className="mt-1 text-sm text-text-muted">Desempenho do site · últimos 30 dias.</p>
      </header>

      {semTracking && (
        <p className="mb-6 rounded-md border border-[#191918]/[0.08] bg-surface-base px-4 py-3 text-sm text-text-secondary">
          O rastreamento acabou de entrar no ar — as métricas do site começam a preencher conforme o site recebe acessos. O instantâneo do negócio (embaixo) já reflete os dados reais.
        </p>
      )}

      {/* KPIs do site */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Visitas · 30d" value={nf(data.kpis.visitas)} />
        <Kpi label="Conversão" value={pct(data.kpis.formsEnviados, data.kpis.visitas)} tone="accent" />
        <Kpi label="Formulários enviados" value={nf(data.kpis.formsEnviados)} />
        <Kpi label="Cliques em CTA" value={nf(data.kpis.cliquesCta)} />
      </div>

      {/* Funil do site */}
      <div className="mb-6">
        <Section title="Funil do site" sub="· 30 dias">
          <div className="flex flex-col gap-2.5">
            {data.siteFunnel.map((s, i) => (
              <Bar key={s.label} label={s.label} value={s.count} max={siteTop} prev={i > 0 ? data.siteFunnel[i - 1].count : undefined} highlight={i === data.siteFunnel.length - 1} />
            ))}
          </div>
          <p className="mt-3 text-[11px] text-text-muted">A % à direita é a conversão sobre o passo anterior.</p>
        </Section>
      </div>

      {/* Onde as pessoas param no formulário — um funil por formulário */}
      <div className="mb-6">
        <Section title="Onde as pessoas param no formulário" sub="· 30 dias">
          {data.formFunnels.length === 0 ? (
            <p className="text-sm text-text-muted">Ninguém começou um formulário nos últimos 30 dias ainda.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {data.formFunnels.map((f) => {
                const top = f.steps[0]?.count ?? 1;
                const drop = biggestDropIndex(f.steps);
                return (
                  <div key={f.form}>
                    <p className="mb-2.5 font-mono text-[11px] font-medium tracking-tight text-text-primary">{f.form}</p>
                    <div className="flex flex-col gap-2.5">
                      {f.steps.map((s, i) => (
                        <Bar key={s.label} label={s.label} value={s.count} max={top} prev={i > 0 ? f.steps[i - 1].count : undefined} drop={i === drop} highlight={i === f.steps.length - 1} wLabel="w-32" />
                      ))}
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-text-muted">Cada bloco é um formulário. A maior queda (em vermelho) mostra em qual etapa a pessoa desiste.</p>
            </div>
          )}
        </Section>
      </div>

      {/* Origem das visitas + Cliques por CTA */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Origem das visitas" sub="· 30 dias">
          {data.porOrigem.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Sem visitas registradas ainda.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2.5">
                {data.porOrigem.map((o) => (
                  <Bar key={o.label} label={o.label} value={o.count} max={maxOrigem} prev={totalOrigem} wLabel="w-32" />
                ))}
              </div>
              <p className="mt-3 text-[11px] text-text-muted">De onde a pessoa chegou. A % é a fatia do total. &quot;Direto&quot; = digitou o link, salvos ou apps sem referrer.</p>
            </>
          )}
        </Section>

        <Section title="Cliques por CTA">
          {data.porCta.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhum clique registrado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.porCta.map((c) => <Bar key={c.label} label={c.label} value={c.count} max={maxCta} wLabel="w-40" />)}
            </div>
          )}
        </Section>
      </div>

      {/* Visitas por dia */}
      <div className="mb-6">
        <Section title="Visitas por dia" sub="· 14 dias">
          {data.visitasPorDia.every((d) => d.count === 0) ? (
            <p className="py-6 text-center text-sm text-text-muted">Sem visitas registradas ainda.</p>
          ) : (
            <VisitsChart data={data.visitasPorDia} />
          )}
        </Section>
      </div>

      {/* Leads por serviço */}
      <div className="mb-6">
        <Section title="Leads por serviço">
          {data.porServico.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhum lead ainda.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.porServico.map((s) => <Bar key={s.tag} label={s.label} value={s.count} max={maxServico} wLabel="w-40" />)}
            </div>
          )}
        </Section>
      </div>

      {/* Instantâneo do negócio (CRM) — separado do site */}
      <Section title="Instantâneo do negócio" sub="· CRM">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi label="MRR ativo" value={brl(data.negocio.mrr)} />
          <Kpi label="Atrasado" value={brl(data.negocio.atrasado)} tone={data.negocio.atrasado > 0 ? 'danger' : undefined} />
          <Kpi label="Clientes ativos" value={nf(data.negocio.clientesAtivos)} />
          <Kpi label="Leads (total)" value={nf(data.negocio.leadsTotal)} />
          <Kpi label="Negócios ganhos" value={nf(data.negocio.ganhos)} />
        </div>
      </Section>
    </div>
  );
}
