/**
 * Régua das mensalidades recorrentes — usada no servidor (para gerar as parcelas)
 * e no cliente (para saber quantas faltam no mês). Funções puras, sem Supabase.
 */

export type RecurringEng = {
  id: string;
  type: string;
  lifecycle: string;
  mrr: number | null;
  start_date: string | null;
  end_date: string | null;
};

/**
 * Contrato que gera mensalidade: recorrente, ATIVO e com MRR definido. Pausado
 * fica de fora de propósito — pausar existe justamente para parar de cobrar, e é
 * a mesma régua do MRR na Visão geral.
 */
export function isRecurring(e: RecurringEng): boolean {
  return e.type === 'recorrente' && e.lifecycle === 'ativo' && (e.mrr ?? 0) > 0;
}

const lastDayOf = (year: number, month1: number) => new Date(Date.UTC(year, month1, 0)).getUTCDate();

/**
 * Dia de vencimento habitual do contrato: o da última parcela já lançada antes do
 * mês alvo (respeita o histórico real) ou, na falta dela, o do início da vigência.
 */
export function dueDayFor(eng: RecurringEng, dueDates: string[], month: string): number {
  const firstOfMonth = `${month}-01`;
  const anteriores = dueDates.filter((d) => d < firstOfMonth).sort();
  const ref = anteriores[anteriores.length - 1] ?? dueDates.slice().sort()[0] ?? eng.start_date;
  const day = Number((ref ?? '').slice(8, 10));
  return day >= 1 && day <= 31 ? day : 1;
}

/**
 * Vencimento da mensalidade daquele mês (YYYY-MM), ou null se cai fora da
 * vigência do contrato. Dia maior que o mês (ex.: 31 em fevereiro) encosta no
 * último dia.
 */
export function monthlyDueDate(eng: RecurringEng, month: string, dueDates: string[]): string | null {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return null;
  const day = Math.min(dueDayFor(eng, dueDates, month), lastDayOf(y, m));
  const due = `${month}-${String(day).padStart(2, '0')}`;
  if (eng.start_date && due < eng.start_date) return null;
  if (eng.end_date && due > eng.end_date) return null;
  return due;
}

/** Descrição padrão da mensalidade, no mesmo formato do que já existe no banco. */
export function monthlyDescription(month: string): string {
  const [y, m] = month.split('-');
  return `Mensalidade ${m}/${y}`;
}

/**
 * Mensalidades que ainda faltam lançar no mês: um contrato só entra se estiver
 * dentro da vigência e não tiver NENHUMA parcela naquele mês.
 */
export function pendingMonthly<T extends RecurringEng>(
  engagements: T[],
  dueDatesByEngagement: Map<string, string[]>,
  month: string,
): { eng: T; due_date: string }[] {
  const out: { eng: T; due_date: string }[] = [];
  for (const eng of engagements) {
    if (!isRecurring(eng)) continue;
    const dues = dueDatesByEngagement.get(eng.id) ?? [];
    if (dues.some((d) => d.slice(0, 7) === month)) continue;
    const due_date = monthlyDueDate(eng, month, dues);
    if (due_date) out.push({ eng, due_date });
  }
  return out;
}
