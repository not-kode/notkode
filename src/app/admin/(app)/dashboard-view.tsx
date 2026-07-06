// Visão geral do /admin — funil do site + métricas do negócio.
// Componente de apresentação (server): sem estado, recebe tudo pronto.

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : '—');

export type Funnel = { visitas: number; cliques: number; forms: number; promovidos: number; ganhos: number };
export type ServiceCount = { tag: string; label: string; count: number };
export type DayCount = { day: string; count: number };
export type DashboardData = {
  funnel: Funnel;
  porServico: ServiceCount[];
  visitasPorDia: DayCount[];
  kpis: { mrr: number; atrasado: number; clientesAtivos: number; leadsTotal: number };
  eventosTotais: number;
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border border-black/[0.06] bg-white p-4">
      <p className="font-label text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone ?? 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

// Passo do funil: barra proporcional ao topo + taxa de conversão vs. passo anterior.
function FunnelRow({ label, value, max, prev, tone }: { label: string; value: number; max: number; prev?: number; tone: string }) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 shrink-0 text-right font-label text-[11px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-black/[0.03]">
        <div className={`h-full rounded-md ${tone}`} style={{ width: `${w}%` }} />
        <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-text-primary">{value.toLocaleString('pt-BR')}</span>
      </div>
      <div className="w-16 shrink-0 font-label text-[11px] text-text-muted">{prev != null ? pct(value, prev) : ''}</div>
    </div>
  );
}

export function DashboardView({ data }: { data: DashboardData }) {
  const f = data.funnel;
  const maxServico = Math.max(1, ...data.porServico.map((s) => s.count));
  const maxDia = Math.max(1, ...data.visitasPorDia.map((d) => d.count));

  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Visão geral</h1>
        <p className="mt-1 text-sm text-text-muted">Funil do site e saúde do negócio · últimos 30 dias.</p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="MRR ativo" value={brl(data.kpis.mrr)} tone="text-primary" />
        <Kpi label="Atrasado" value={brl(data.kpis.atrasado)} tone={data.kpis.atrasado > 0 ? 'text-danger' : undefined} />
        <Kpi label="Clientes ativos" value={String(data.kpis.clientesAtivos)} />
        <Kpi label="Leads (total)" value={String(data.kpis.leadsTotal)} />
      </div>

      <section className="mb-8 rounded-lg border border-black/[0.06] bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Funil de conversão <span className="font-label text-[11px] font-normal uppercase tracking-wider text-text-muted">· 30 dias</span></h2>
        {data.eventosTotais === 0 ? (
          <p className="rounded-md border border-warning/20 bg-warning/[0.05] px-4 py-3 text-sm text-text-secondary">
            O rastreamento acabou de entrar no ar — o topo do funil (visitas e cliques) começa a preencher conforme o site recebe acessos. Leads, promoções e negócios já refletem os dados reais.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <FunnelRow label="Visitas" value={f.visitas} max={f.visitas} tone="bg-primary/70" />
            <FunnelRow label="Cliques no CTA" value={f.cliques} max={f.visitas} prev={f.visitas} tone="bg-primary/55" />
            <FunnelRow label="Formulários" value={f.forms} max={f.visitas} prev={f.cliques} tone="bg-primary/45" />
            <FunnelRow label="Leads promovidos" value={f.promovidos} max={f.visitas} prev={f.forms} tone="bg-success/60" />
            <FunnelRow label="Negócios ganhos" value={f.ganhos} max={f.visitas} prev={f.promovidos} tone="bg-success/80" />
          </div>
        )}
        <p className="mt-3 font-label text-[10px] text-text-muted/70">A % à direita é a conversão sobre o passo anterior.</p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-black/[0.06] bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Visitas por dia <span className="font-label text-[11px] font-normal uppercase tracking-wider text-text-muted">· 14 dias</span></h2>
          {data.visitasPorDia.every((d) => d.count === 0) ? (
            <p className="py-8 text-center text-sm text-text-muted">Sem visitas registradas ainda.</p>
          ) : (
            <div className="flex h-32 items-end gap-1">
              {data.visitasPorDia.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.count}`}>
                  <div className="w-full rounded-t bg-primary/60" style={{ height: `${Math.round((d.count / maxDia) * 100)}%`, minHeight: d.count > 0 ? '3px' : '0' }} />
                  <span className="font-label text-[8px] text-text-muted/70">{d.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-black/[0.06] bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Leads por serviço</h2>
          {data.porServico.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Nenhum lead ainda.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.porServico.map((s) => (
                <div key={s.tag} className="flex items-center gap-3">
                  <div className="w-40 shrink-0 truncate text-xs text-text-secondary" title={s.label}>{s.label}</div>
                  <div className="relative h-6 flex-1 overflow-hidden rounded bg-black/[0.03]">
                    <div className="h-full rounded bg-primary/50" style={{ width: `${Math.round((s.count / maxServico) * 100)}%` }} />
                  </div>
                  <div className="w-8 shrink-0 text-right text-xs font-medium text-text-primary">{s.count}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
