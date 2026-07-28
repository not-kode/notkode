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
 * negócio. Bruto, antes de repasse e nota.
 */
export function dealTotal(d: DealValue): number {
  return d.installments.length > 0
    ? d.installments.reduce((s, p) => s + p.amount, 0)
    : (d.valor_pontual ?? 0) + (d.mrr ?? 0);
}

/**
 * O que de fato entra se o negócio fechar: o valor cheio menos o repasse ao
 * parceiro e menos a nota, quando o cliente precisa dela. É este o número de
 * "se fechar tudo" — dinheiro que entra, não dinheiro que passa pela conta.
 */
export function dealTotalNet(d: DealValue): number {
  const bruto = dealTotal(d);
  if (bruto <= 0) return 0;
  const nota = d.precisa_nota ? bruto * NOTA : 0;
  return Math.max(0, bruto - (d.repasse_valor ?? 0) - nota);
}

/**
 * A parte RECORRENTE líquida do negócio: quanto ele somaria ao MRR se fechasse.
 * Negócio pontual, mesmo parcelado, não entra — parcela acaba, mensalidade não.
 */
export function dealMrrNet(d: DealValue): number {
  const mrr = d.mrr ?? 0;
  if (mrr <= 0) return 0;
  const nota = d.precisa_nota ? mrr * NOTA : 0;
  return Math.max(0, mrr - (d.repasse_valor ?? 0) - nota);
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
