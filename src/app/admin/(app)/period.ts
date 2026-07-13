// Resolução do período do dashboard — compartilhado entre o filtro (client) e a
// página (server). Presets rápidos + intervalo personalizado (de/até).

export type RangeKey = '7d' | '30d' | '90d' | 'month' | 'lastmonth' | 'year';

export const PRESETS: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'lastmonth', label: 'Mês passado' },
  { key: 'year', label: 'Este ano' },
];

const DEFAULT_KEY: RangeKey = 'month';
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dmy = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

export type ResolvedRange = {
  key: RangeKey | 'custom';
  fromISO: string;
  toISO: string;
  fromDate: Date;
  toDate: Date;
  days: number;
  label: string;
};

// Aceita ?from=YYYY-MM-DD&to=YYYY-MM-DD (custom) ou ?range=<preset>. Default 30 dias.
export function resolveRange(sp: { range?: string; from?: string; to?: string }): ResolvedRange {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const daysAgo = (n: number) => startOfDay(new Date(now.getTime() - n * 86_400_000));

  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (sp.from && sp.to && iso.test(sp.from) && iso.test(sp.to)) {
    const fromDate = startOfDay(new Date(`${sp.from}T00:00:00`));
    const toDate = endOfDay(new Date(`${sp.to}T00:00:00`));
    return pack('custom', fromDate, toDate, `${dmy(fromDate)} – ${dmy(toDate)}`);
  }

  const key = (PRESETS.find((p) => p.key === sp.range)?.key ?? DEFAULT_KEY) as RangeKey;
  const to = endOfDay(now);
  switch (key) {
    case '7d': return pack(key, daysAgo(6), to, 'Últimos 7 dias');
    case '90d': return pack(key, daysAgo(89), to, 'Últimos 90 dias');
    case 'month': return pack(key, new Date(y, m, 1), to, `${MONTHS[m]}/${y}`);
    case 'lastmonth': {
      const from = new Date(y, m - 1, 1);
      return pack(key, from, endOfDay(new Date(y, m, 0)), `${MONTHS[from.getMonth()]}/${from.getFullYear()}`);
    }
    case 'year': return pack(key, new Date(y, 0, 1), to, `${y}`);
    case '30d':
    default: return pack('30d', daysAgo(29), to, 'Últimos 30 dias');
  }

  function pack(k: RangeKey | 'custom', fromDate: Date, toDate: Date, label: string): ResolvedRange {
    return {
      key: k, fromDate, toDate,
      fromISO: fromDate.toISOString(), toISO: toDate.toISOString(),
      days: Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1),
      label,
    };
  }
}
