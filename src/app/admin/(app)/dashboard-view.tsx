// Dashboard do /admin — NEGÓCIO (faturamento/CRM) primeiro, SITE (tracking) depois.
// Tudo obedece ao filtro de período no topo. Componente de apresentação (server).
// Identidade Notkode: creme quente + tinta (#191918/navy), azul só como acento.
import { Suspense } from 'react';
import { PeriodFilter } from './period-filter';
import { VisitsChart, SourceDonut, RankBars, RevenueProjection } from './charts';
import { motivoDoDesconto } from './_shared/liquido';

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
    /** O período inteiro: o que entrou mais o que ainda vem. */
    total: number;
    faturamento: number;
    aReceber: number;
    emAtraso: number;
    mrr: number;
    /** O que sobra de cada número depois do repasse ao parceiro e da nota. */
    liquidos: { total: number; faturamento: number; aReceber: number; emAtraso: number; mrr: number };
    /** A parte de nota dentro de cada um deles, para o cartão dizer o porquê. */
    notas: { total: number; faturamento: number; aReceber: number; emAtraso: number; mrr: number };
    /** Quanto do faturamento do período vira nota fiscal. */
    nota: number;
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

// Mesma pele do resto do admin: página branca, painel cinza-claro — igual às
// colunas do pipeline. O dashboard era a única tela em creme.
const card = 'rounded-md border border-black/[0.06] bg-[#F4F5F7]';

/**
 * O valor grande é sempre o COBRADO, o mesmo do contrato. `sobra` aparece só
 * quando repasse ou nota comem alguma coisa dele: quem negociou o preço precisa
 * reconhecer o número, e o que fica depois do imposto é outra informação, não
 * uma correção da primeira.
 */
function Kpi({ label, value, tone, hint, sobra }: { label: string; value: string; tone?: 'accent' | 'danger' | 'warning'; hint?: string; sobra?: string }) {
  const valueTone = tone === 'accent' ? 'text-primary' : tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-text-primary';
  return (
    <div className={`${card} p-4`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className={`mt-2 font-mono text-[26px] font-medium leading-none tracking-tight ${valueTone}`}>{value}</p>
      {(hint || sobra) && (
        <p className="mt-1.5 text-[10px] text-text-muted">
          {hint}
          {hint && sobra && ' · '}
          {sobra && <span className="text-text-muted/70">{sobra}</span>}
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
      <span className="h-px flex-1 bg-black/[0.06]" />
    </div>
  );
}

/** "R$ 36.582 depois da nota e do repasse" — vazio quando nada foi descontado. */
const soSobra = (liquido: number, cobrado: number, nota: number) => {
  const motivo = motivoDoDesconto(cobrado, liquido, nota);
  return motivo ? `${brl(liquido)} ${motivo}` : undefined;
};

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="py-8 text-center text-sm text-text-muted">{children}</p>
);

export function DashboardView({ data }: { data: DashboardData }) {
  const { negocio: n, site: s, rangeLabel } = data;
  const semVisitas = s.visitasPorDia.every((d) => d.count === 0);
  const temReceita = n.receitaPorMes.some((m) => m.recebido + m.aReceber + m.pipeline > 0);

  return (
    <div>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-mono text-xl font-medium tracking-tight text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">Negócio e site num lugar só.</p>
        </div>
        <Suspense fallback={null}><PeriodFilter /></Suspense>
      </header>

      {/* ════════════════ NEGÓCIO — o que importa primeiro ════════════════ */}
      <GroupLabel>Negócio · {rangeLabel}</GroupLabel>

      {/* Quatro por linha: com oito cartões, espremer tudo numa fileira só deixa
          o valor menor que o rótulo. */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {/* O total vem primeiro: é a resposta de "de quanto é este período".
            O que já entrou e o que ainda vem são as duas metades dele. */}
        <Kpi label={`Total · ${rangeLabel}`} value={brl(n.total)} hint={`${brl(n.aReceber)} ainda a receber`} sobra={soSobra(n.liquidos.total, n.total, n.notas.total)} />
        <Kpi label="Faturamento" value={brl(n.faturamento)} tone="accent" hint={`já recebido · ${rangeLabel}`} sobra={soSobra(n.liquidos.faturamento, n.faturamento, n.notas.faturamento)} />
        <Kpi label="A receber" value={brl(n.aReceber)} hint={`no prazo · ${rangeLabel}`} sobra={soSobra(n.liquidos.aReceber, n.aReceber, n.notas.aReceber)} />
        <Kpi label="Em atraso" value={brl(n.emAtraso)} tone={n.emAtraso > 0 ? 'danger' : undefined} hint="vencido · total" sobra={soSobra(n.liquidos.emAtraso, n.emAtraso, n.notas.emAtraso)} />
        <Kpi label="MRR ativo" value={brl(n.mrr)} hint="recorrente/mês · hoje" sobra={soSobra(n.liquidos.mrr, n.mrr, n.notas.mrr)} />
        {/* Imposto tem cartão próprio: sai do lucro, não do valor do contrato. */}
        {n.nota > 0 && <Kpi label="Nota fiscal" value={`− ${brl(n.nota)}`} tone="warning" hint={`6% do faturado · ${rangeLabel}`} />}
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
