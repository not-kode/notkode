/**
 * Valor do negócio, em módulo próprio (sem 'use client') porque a conta roda no
 * servidor, no topo do pipeline, e no cliente, no total de cada coluna.
 *
 * Com parcelas planejadas vale a soma delas — é o contratado de verdade,
 * inclusive nos recorrentes. Sem parcelas, o valor cheio do negócio.
 */
export type DealValue = {
  valor_pontual: number | null;
  mrr: number | null;
  installments: { amount: number }[];
};

export function dealTotal(d: DealValue): number {
  return d.installments.length > 0
    ? d.installments.reduce((s, p) => s + p.amount, 0)
    : (d.valor_pontual ?? 0) + (d.mrr ?? 0);
}
