'use client';

// Gráfico de visitas por dia com Recharts (área + eixo + tooltip), no tema Notkode:
// tinta (#191918) sobre creme, azul (#3B82F6) só como acento do traço/preenchimento.
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayCount } from './dashboard-view';

const INK = '#191918';
const ACCENT = '#3B82F6';

const fmtDay = (iso: string) => iso.slice(8); // DD
const fmtFull = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: DayCount }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-[#191918]/[0.12] bg-surface-base px-2.5 py-1.5 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{fmtFull(p.day)}</p>
      <p className="font-mono text-sm font-medium text-text-primary">
        {p.count} {p.count === 1 ? 'visita' : 'visitas'}
      </p>
    </div>
  );
}

export function VisitsChart({ data }: { data: DayCount[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={INK} strokeOpacity={0.06} vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={fmtDay}
            tick={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', fill: INK, fillOpacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tick={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', fill: INK, fillOpacity: 0.4 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: INK, strokeOpacity: 0.15 }} />
          <Area type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} fill="url(#visitsFill)" dot={false} activeDot={{ r: 3, fill: ACCENT }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
