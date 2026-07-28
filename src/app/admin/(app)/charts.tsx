'use client';

// Gráficos do /admin com Recharts, no tema Notkode (tinta sobre creme, azul como
// acento). Paleta categórica do donut validada para daltonismo/contraste sobre o creme.
import { useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, Cell, LabelList, Pie, PieChart,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { DayCount } from './dashboard-view';

const INK = '#191918';
const ACCENT = '#3B82F6';
// Fundo do card (surface-base): usado como fresta entre segmentos empilhados.
const SURFACE = '#FFFEF2';

// Paleta categórica (validada: lightness/chroma/CVD/contraste OK sobre creme).
const CAT = ['#2F6BEA', '#A87400', '#0E9E8B', '#CE4C6E', '#6E5AD0', '#3E8E3E'];
// Cor fixa por origem conhecida — a cor segue a entidade, nunca o rank.
const SOURCE_COLORS: Record<string, string> = {
  Direto: '#8a897f',
  Google: '#2F6BEA',
  Instagram: '#CE4C6E',
  Facebook: '#6E5AD0',
  LinkedIn: '#0E9E8B',
  WhatsApp: '#3E8E3E',
  'X (Twitter)': '#191918',
  YouTube: '#A87400',
  Bing: '#0E9E8B',
  DuckDuckGo: '#A87400',
};
const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
const colorFor = (label: string) => SOURCE_COLORS[label] ?? CAT[hash(label) % CAT.length];

// ─────────────────────────────────────────── Visitas por dia (área) ──
const fmtDayFull = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

function AreaTooltip({ active, payload }: { active?: boolean; payload?: { payload: DayCount }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-[#191918]/[0.12] bg-surface-base px-2.5 py-1.5 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{fmtDayFull(p.day)}</p>
      <p className="font-mono text-sm font-medium text-text-primary">{p.count} {p.count === 1 ? 'visita' : 'visitas'}</p>
    </div>
  );
}

export function VisitsChart({ data }: { data: DayCount[] }) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tickFormatter={(iso: string) => iso.slice(8)}
            tick={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', fill: INK, fillOpacity: 0.5 }}
            axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={12}
          />
          <YAxis allowDecimals={false} width={28}
            tick={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', fill: INK, fillOpacity: 0.4 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<AreaTooltip />} cursor={{ stroke: INK, strokeOpacity: 0.15 }} />
          <Area type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} fill="url(#visitsFill)" dot={false} activeDot={{ r: 3, fill: ACCENT }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────── Receita por mês: realizado + projeção ──
const brl0 = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
type MonthProjection = { key: string; mes: string; recebido: number; aReceber: number; pipeline: number; atual: boolean };

// Cores das três séries (validadas: banda de luminosidade, croma, separação para
// daltonismo e contraste sobre o creme). A cor segue a série, nunca o rank.
const SERIES = [
  { key: 'recebido', label: 'Recebido', color: '#2F6BEA' },
  { key: 'aReceber', label: 'A receber', color: '#0E9E8B' },
  { key: 'pipeline', label: 'Pipeline', color: '#A87400' },
] as const;

function ProjectionTooltip({ active, payload }: { active?: boolean; payload?: { payload: MonthProjection }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const total = p.recebido + p.aReceber + p.pipeline;
  return (
    <div className="rounded-md border border-[#191918]/[0.12] bg-surface-base px-2.5 py-2 shadow-sm">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{p.mes}</p>
      {SERIES.map((s) =>
        p[s.key] > 0 ? (
          <p key={s.key} className="flex items-center gap-1.5 font-mono text-xs text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: s.color }} />
            {s.label} <span className="ml-auto pl-3 font-medium text-text-primary">{brl0(p[s.key])}</span>
          </p>
        ) : null,
      )}
      {total > 0 && (
        <p className="mt-1 border-t border-[#191918]/[0.08] pt-1 font-mono text-xs font-medium text-text-primary">
          Total <span className="pl-2">{brl0(total)}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Barras empilhadas por mês: o que já entrou, o que está contratado e o que ainda
 * depende de fechar negócio. Uma linha marca o mês corrente, separando o que é
 * histórico do que é projeção.
 *
 * A janela vem do servidor de janeiro do ano corrente até 12 meses à frente; o
 * botão aqui escolhe o recorte, porque "o ano fechado" e "o que vem pela frente"
 * respondem perguntas diferentes.
 */
export function RevenueProjection({ data }: { data: MonthProjection[] }) {
  const [janela, setJanela] = useState<'ano' | 'frente'>('ano');
  const ano = data.find((d) => d.atual)?.key.slice(0, 4) ?? String(new Date().getFullYear());
  const idxAtual = data.findIndex((d) => d.atual);

  const meses = janela === 'ano'
    ? data.filter((d) => d.key.startsWith(ano))
    : data.slice(Math.max(0, idxAtual), Math.max(0, idxAtual) + 12);

  const atual = meses.find((d) => d.atual)?.mes;
  const total = meses.reduce((s, m) => s + m.recebido + m.aReceber + m.pipeline, 0);
  const realizado = meses.reduce((s, m) => s + m.recebido, 0);

  const tab = (ativo: boolean) =>
    `rounded px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
      ativo ? 'bg-[#191918]/[0.07] text-text-primary' : 'text-text-muted hover:text-text-secondary'
    }`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-md border border-[#191918]/[0.08] p-0.5">
          <button type="button" onClick={() => setJanela('ano')} className={tab(janela === 'ano')}>{ano}</button>
          <button type="button" onClick={() => setJanela('frente')} className={tab(janela === 'frente')}>12 meses à frente</button>
        </div>
      </div>

      {/* Total da janela: o número que o gráfico inteiro representa. */}
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[22px] font-medium leading-none tracking-tight text-text-primary">{brl0(total)}</span>
        <span className="font-mono text-[11px] text-text-muted">
          {janela === 'ano' ? `no ano · ${brl0(realizado)} já recebido` : 'previsto nos próximos 12 meses'}
        </span>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={meses} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <XAxis dataKey="mes" tick={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', fill: INK, fillOpacity: 0.5 }} axisLine={false} tickLine={false} interval={0} />
            <YAxis width={44} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} tick={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', fill: INK, fillOpacity: 0.4 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ProjectionTooltip />} cursor={{ fill: INK, fillOpacity: 0.04 }} />
            {atual && <ReferenceLine x={atual} stroke={INK} strokeOpacity={0.18} strokeDasharray="3 3" />}
            {SERIES.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="receita"
                fill={s.color}
                stroke={SURFACE} /* frestinha da cor do card entre os segmentos */
                strokeWidth={2}
                radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : undefined}
                maxBarSize={34}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────── Origem das visitas (donut) ──
type Slice = { label: string; count: number };

function DonutTooltip({ active, payload, total }: { active?: boolean; payload?: { payload: Slice }[]; total: number }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-[#191918]/[0.12] bg-surface-base px-2.5 py-1.5 shadow-sm">
      <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-text-primary">
        <span className="inline-block h-2 w-2 rounded-sm" style={{ background: colorFor(p.label) }} />
        {p.label}
      </p>
      <p className="font-mono text-xs text-text-secondary">{p.count} · {Math.round((p.count / total) * 100)}%</p>
    </div>
  );
}

export function SourceDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius={52} outerRadius={76} paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
              {data.map((d) => <Cell key={d.label} fill={colorFor(d.label)} />)}
            </Pie>
            <Tooltip content={<DonutTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-medium leading-none text-text-primary">{total}</span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">visitas</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: colorFor(d.label) }} />
            <span className="flex-1 truncate text-sm text-text-secondary" title={d.label}>{d.label}</span>
            <span className="font-mono text-xs font-medium text-text-primary">{d.count}</span>
            <span className="w-9 text-right font-mono text-[11px] text-text-muted">{total > 0 ? Math.round((d.count / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ──────────────────────────────────── Ranking horizontal (barras Recharts) ──
type RankItem = { label: string; count: number };

function RankTooltip({ active, payload }: { active?: boolean; payload?: { payload: RankItem }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-[#191918]/[0.12] bg-surface-base px-2.5 py-1.5 shadow-sm">
      <p className="font-mono text-[11px] font-medium text-text-primary">{p.label}</p>
      <p className="font-mono text-xs text-text-secondary">{p.count}</p>
    </div>
  );
}

export function RankBars({ data, labelWidth = 132 }: { data: RankItem[]; labelWidth?: number }) {
  const height = data.length * 34 + 8;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap={10}>
          <XAxis type="number" domain={[0, 'dataMax']} hide />
          <YAxis
            type="category" dataKey="label" width={labelWidth}
            tick={{ fontSize: 12, fill: INK, fillOpacity: 0.75 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<RankTooltip />} cursor={{ fill: INK, fillOpacity: 0.04 }} />
          <Bar dataKey="count" fill={INK} fillOpacity={0.85} radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
            <LabelList dataKey="count" position="right" offset={8} style={{ fill: INK, fontSize: 11, fontFamily: 'var(--font-mono, monospace)', fontWeight: 500 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
