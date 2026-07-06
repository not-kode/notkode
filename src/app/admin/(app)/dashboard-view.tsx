// Visão geral do /admin — desempenho do SITE (tracking) separado do NEGÓCIO (CRM).
// Componente de apresentação (server): sem estado, recebe tudo pronto.

import type { ReactNode } from 'react';

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

const ACCENT: Record<string, string> = {
  primary: 'border-l-primary', success: 'border-l-success', danger: 'border-l-danger', neutral: 'border-l-black/15',
};

function Kpi({ label, value, tone, accent = 'neutral' }: { label: string; value: string; tone?: string; accent?: 'primary' | 'success' | 'danger' | 'neutral' }) {
  return (
    <div className={`rounded-xl border border-black/[0.07] border-l-[3px] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,18,0.05)] ${ACCENT[accent]}`}>
      <p className="font-label text-[10.5px] uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <p className={`mt-1.5 text-[22px] font-bold leading-none tracking-tight ${tone ?? 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

// Título de seção com barra de acento (dá estrutura e contraste).
function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
      <span className="h-4 w-1 shrink-0 rounded-full bg-primary" />
      <span>{children}{sub && <span className="ml-2 font-label text-[10.5px] font-normal uppercase tracking-wider text-text-muted">{sub}</span>}</span>
    </h2>
  );
}

// Passo de funil: barra proporcional ao topo + conversão vs. passo anterior.
// `drop` destaca em vermelho a maior queda do funil.
function FunnelRow({ label, value, max, prev, tone, drop }: { label: string; value: number; max: number; prev?: number; tone: string; drop?: boolean }) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 shrink-0 text-right font-label text-[11px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-black/[0.055]">
        <div className={`h-full rounded-md ${tone}`} style={{ width: `${w}%` }} />
        <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-text-primary">{nf(value)}</span>
      </div>
      <div className={`w-24 shrink-0 font-label text-[11px] ${drop ? 'font-semibold text-danger' : 'text-text-muted'}`}>
        {prev != null ? <>{pct(value, prev)}{drop ? ' ↓ maior queda' : ''}</> : ''}
      </div>
    </div>
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

  return (
    <div className="-mx-4 -my-6 min-h-full bg-[#F4F5F7] px-4 py-6 md:-mx-8 md:-my-8 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-text-muted">Desempenho do site · últimos 30 dias.</p>
      </header>

      {semTracking && (
        <p className="mb-6 rounded-lg border border-warning/25 bg-warning/[0.07] px-4 py-3 text-sm text-text-secondary">
          O rastreamento acabou de entrar no ar — as métricas do site começam a preencher conforme o site recebe acessos. O instantâneo do negócio (embaixo) já reflete os dados reais.
        </p>
      )}

      {/* KPIs do SITE */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Visitas · 30d" value={nf(data.kpis.visitas)} tone="text-primary" accent="primary" />
        <Kpi label="Conversão (visita→envio)" value={pct(data.kpis.formsEnviados, data.kpis.visitas)} accent="neutral" />
        <Kpi label="Formulários enviados" value={nf(data.kpis.formsEnviados)} tone="text-success" accent="success" />
        <Kpi label="Cliques em CTA" value={nf(data.kpis.cliquesCta)} accent="neutral" />
      </div>

      {/* Funil do SITE — só tracking, mesma janela */}
      <section className="mb-6 rounded-xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(20,20,18,0.05)]">
        <SectionTitle sub="· 30 dias">Funil do site</SectionTitle>
        <div className="mt-4 flex flex-col gap-2.5">
          <FunnelRow label="Visitas" value={data.siteFunnel[0]?.count ?? 0} max={data.siteFunnel[0]?.count ?? 1} tone="bg-primary/70" />
          {data.siteFunnel.slice(1).map((s, i) => (
            <FunnelRow key={s.label} label={s.label} value={s.count} max={data.siteFunnel[0]?.count ?? 1} prev={data.siteFunnel[i].count} tone={i === data.siteFunnel.length - 2 ? 'bg-success/70' : 'bg-primary/50'} />
          ))}
        </div>
        <p className="mt-3 font-label text-[10px] text-text-muted/70">A % à direita é a conversão sobre o passo anterior.</p>
      </section>

      {/* Onde as pessoas param no formulário — o gráfico de desistência */}
      <section className="mb-6 rounded-xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(20,20,18,0.05)]">
        <SectionTitle sub="· 30 dias">Onde as pessoas param no formulário</SectionTitle>
        <p className="mb-4 mt-1.5 text-xs text-text-muted">Cada passo é uma sessão distinta. A maior queda mostra onde ajustar o formulário.</p>
        {(data.formFunnel[0]?.count ?? 0) === 0 ? (
          <p className="rounded-md border border-black/[0.05] bg-black/[0.02] px-4 py-3 text-sm text-text-muted">Ninguém começou um formulário nos últimos 30 dias ainda.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data.formFunnel.map((s, i) => (
              <FunnelRow
                key={s.label}
                label={s.label}
                value={s.count}
                max={data.formFunnel[0]?.count ?? 1}
                prev={i > 0 ? data.formFunnel[i - 1].count : undefined}
                tone={i === data.formFunnel.length - 1 ? 'bg-success/70' : 'bg-primary/50'}
                drop={i === formDrop}
              />
            ))}
          </div>
        )}
      </section>

      {/* Visitas por dia + Cliques por CTA */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(20,20,18,0.05)]">
          <SectionTitle sub="· 14 dias">Visitas por dia</SectionTitle>
          <div className="mt-4" />
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

        <section className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(20,20,18,0.05)]">
          <SectionTitle>Cliques por CTA</SectionTitle>
          <div className="mt-4" />
          {data.porCta.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Nenhum clique registrado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.porCta.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className="w-40 shrink-0 truncate text-xs text-text-secondary" title={c.label}>{c.label}</div>
                  <div className="relative h-6 flex-1 overflow-hidden rounded bg-black/[0.05]">
                    <div className="h-full rounded bg-primary/50" style={{ width: `${Math.round((c.count / maxCta) * 100)}%` }} />
                  </div>
                  <div className="w-8 shrink-0 text-right text-xs font-medium text-text-primary">{c.count}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Leads por serviço */}
      <section className="mb-6 rounded-xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(20,20,18,0.05)]">
        <SectionTitle>Leads por serviço</SectionTitle>
        <div className="mt-4" />
        {data.porServico.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">Nenhum lead ainda.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data.porServico.map((s) => (
              <div key={s.tag} className="flex items-center gap-3">
                <div className="w-40 shrink-0 truncate text-xs text-text-secondary" title={s.label}>{s.label}</div>
                <div className="relative h-6 flex-1 overflow-hidden rounded bg-black/[0.05]">
                  <div className="h-full rounded bg-primary/50" style={{ width: `${Math.round((s.count / maxServico) * 100)}%` }} />
                </div>
                <div className="w-8 shrink-0 text-right text-xs font-medium text-text-primary">{s.count}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Instantâneo do NEGÓCIO (CRM) — separado do site */}
      <section className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(20,20,18,0.05)]">
        <SectionTitle>Instantâneo do negócio</SectionTitle>
        <p className="mb-4 mt-1.5 text-xs text-text-muted">Dados do CRM — independentes do tráfego do site.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi label="MRR ativo" value={brl(data.negocio.mrr)} tone="text-primary" accent="primary" />
          <Kpi label="Atrasado" value={brl(data.negocio.atrasado)} tone={data.negocio.atrasado > 0 ? 'text-danger' : undefined} accent={data.negocio.atrasado > 0 ? 'danger' : 'neutral'} />
          <Kpi label="Clientes ativos" value={nf(data.negocio.clientesAtivos)} accent="neutral" />
          <Kpi label="Leads (total)" value={nf(data.negocio.leadsTotal)} accent="neutral" />
          <Kpi label="Negócios ganhos" value={nf(data.negocio.ganhos)} tone="text-success" accent="success" />
        </div>
      </section>
    </div>
  );
}
