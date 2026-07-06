// Visão geral do /admin — desempenho do SITE (tracking) separado do NEGÓCIO (CRM).
// Componente de apresentação (server): sem estado, recebe tudo pronto.

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const nf = (n: number) => n.toLocaleString('pt-BR');
const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : '—');

export type FunnelStep = { label: string; count: number };
export type ServiceCount = { tag: string; label: string; count: number };
export type CtaCount = { label: string; count: number };
export type DayCount = { day: string; count: number };
export type DashboardData = {
  kpis: { visitas: number; conversao: number; formsEnviados: number; cliquesCta: number };
  siteFunnel: FunnelStep[];
  formFunnel: FunnelStep[];
  visitasPorDia: DayCount[];
  porCta: CtaCount[];
  porServico: ServiceCount[];
  negocio: { mrr: number; atrasado: number; clientesAtivos: number; leadsTotal: number; ganhos: number };
  eventosTotais: number;
};

const card = 'rounded-lg border border-black/[0.08] bg-white';

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`${card} p-4`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${tone ?? 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

// Uma linha de barra horizontal — usada nos funis e nos rankings.
function Bar({ label, value, max, prev, drop, wLabel = 'w-36', highlight }: { label: string; value: number; max: number; prev?: number; drop?: boolean; wLabel?: string; highlight?: boolean }) {
  const w = max > 0 ? Math.max(1.5, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`${wLabel} shrink-0 truncate text-right text-xs text-text-secondary`} title={label}>{label}</div>
      <div className="relative h-7 flex-1 overflow-hidden rounded bg-black/[0.05]">
        <div className={`h-full rounded ${highlight ? 'bg-success/75' : 'bg-primary/75'}`} style={{ width: `${w}%` }} />
        <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-text-primary">{nf(value)}</span>
      </div>
      <div className={`w-16 shrink-0 text-right text-xs ${drop ? 'font-semibold text-danger' : 'text-text-muted'}`}>
        {prev != null ? pct(value, prev) : ''}
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className={`${card} p-5`}>
      <h2 className="text-[15px] font-semibold text-text-primary">
        {title}{sub && <span className="ml-2 text-xs font-normal text-text-muted">{sub}</span>}
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
  const maxDia = Math.max(1, ...data.visitasPorDia.map((d) => d.count));
  const maxCta = Math.max(1, ...data.porCta.map((c) => c.count));
  const formDrop = biggestDropIndex(data.formFunnel);
  const siteTop = data.siteFunnel[0]?.count ?? 1;
  const formTop = data.formFunnel[0]?.count ?? 1;

  return (
    <div className="-mx-4 -my-6 min-h-full bg-[#F5F6F8] px-4 py-6 md:-mx-8 md:-my-8 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-text-muted">Desempenho do site · últimos 30 dias.</p>
      </header>

      {semTracking && (
        <p className="mb-6 rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-sm text-text-secondary">
          O rastreamento acabou de entrar no ar — as métricas do site começam a preencher conforme o site recebe acessos. O instantâneo do negócio (embaixo) já reflete os dados reais.
        </p>
      )}

      {/* KPIs do site */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Visitas · 30d" value={nf(data.kpis.visitas)} />
        <Kpi label="Conversão" value={pct(data.kpis.formsEnviados, data.kpis.visitas)} />
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

      {/* Onde as pessoas param no formulário */}
      <div className="mb-6">
        <Section title="Onde as pessoas param no formulário" sub="· 30 dias">
          {formTop === 0 ? (
            <p className="text-sm text-text-muted">Ninguém começou um formulário nos últimos 30 dias ainda.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2.5">
                {data.formFunnel.map((s, i) => (
                  <Bar key={s.label} label={s.label} value={s.count} max={formTop} prev={i > 0 ? data.formFunnel[i - 1].count : undefined} drop={i === formDrop} highlight={i === data.formFunnel.length - 1} />
                ))}
              </div>
              <p className="mt-3 text-[11px] text-text-muted">A maior queda (em vermelho) mostra onde ajustar o formulário.</p>
            </>
          )}
        </Section>
      </div>

      {/* Visitas por dia + Cliques por CTA */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Visitas por dia" sub="· 14 dias">
          {data.visitasPorDia.every((d) => d.count === 0) ? (
            <p className="py-6 text-center text-sm text-text-muted">Sem visitas registradas ainda.</p>
          ) : (
            <div className="flex h-32 items-end gap-1.5">
              {data.visitasPorDia.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5" title={`${d.day}: ${d.count}`}>
                  <div className="w-full rounded-t-sm bg-primary/70" style={{ height: `${Math.round((d.count / maxDia) * 100)}%`, minHeight: d.count > 0 ? '3px' : '0' }} />
                  <span className="text-[9px] text-text-muted">{d.day.slice(8)}</span>
                </div>
              ))}
            </div>
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
          <Kpi label="Atrasado" value={brl(data.negocio.atrasado)} tone={data.negocio.atrasado > 0 ? 'text-danger' : undefined} />
          <Kpi label="Clientes ativos" value={nf(data.negocio.clientesAtivos)} />
          <Kpi label="Leads (total)" value={nf(data.negocio.leadsTotal)} />
          <Kpi label="Negócios ganhos" value={nf(data.negocio.ganhos)} />
        </div>
      </Section>
    </div>
  );
}
