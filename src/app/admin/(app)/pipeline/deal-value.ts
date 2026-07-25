/**
 * Contas de valor do negócio, em módulo próprio (sem 'use client') porque rodam
 * no servidor, no topo do pipeline, e no cliente, no total de cada coluna.
 */
export type DealValue = {
  valor_pontual: number | null;
  mrr: number | null;
  repasse_valor: number | null;
  precisa_nota: boolean;
  installments: { amount: number }[];
};

/** Alíquota usada no sistema quando o cliente precisa de nota fiscal. */
const NOTA = 0.06;

/**
 * Valor cheio do negócio: com parcelas planejadas vale a soma delas — é o
 * contratado de verdade, inclusive nos recorrentes. Sem parcelas, o valor do
 * negócio. É o número de "se fechar tudo": bruto, sem descontar nada.
 */
export function dealTotal(d: DealValue): number {
  return d.installments.length > 0
    ? d.installments.reduce((s, p) => s + p.amount, 0)
    : (d.valor_pontual ?? 0) + (d.mrr ?? 0);
}

/**
 * Quanto o negócio gera por mês, bruto. Recorrente é o valor mensal; pontual
 * parcelado é o valor de uma parcela, porque ele também pinga todo mês. Pontual
 * à vista não entra: não é receita mensal.
 */
export function dealMonthly(d: DealValue): number {
  if ((d.mrr ?? 0) > 0) return d.mrr ?? 0;
  const n = d.installments.length;
  if (n > 1) return d.installments.reduce((s, p) => s + p.amount, 0) / n;
  return 0;
}

/**
 * O que sobra por mês: tira o repasse ao parceiro e a nota fiscal. No pontual
 * parcelado o repasse é rateado pelas parcelas, já que é um valor do negócio
 * inteiro, não de cada mês.
 */
export function dealMonthlyNet(d: DealValue): number {
  const base = dealMonthly(d);
  if (base <= 0) return 0;
  const n = d.installments.length;
  const recorrente = (d.mrr ?? 0) > 0;
  const repasse = recorrente ? (d.repasse_valor ?? 0) : n > 1 ? (d.repasse_valor ?? 0) / n : 0;
  const nota = d.precisa_nota ? base * NOTA : 0;
  return Math.max(0, base - repasse - nota);
}
