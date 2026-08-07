/**
 * O que é nosso de verdade dentro de um valor cobrado.
 *
 * Duas coisas passam pela conta sem serem receita: o repasse ao parceiro que
 * trouxe o cliente e a nota fiscal, quando o cliente precisa dela. O funil já
 * descontava as duas; o financeiro mostrava o bruto, e os dois números nunca
 * batiam. A régua agora é uma só, e mora aqui.
 *
 * O valor da parcela continua bruto onde ele é bruto: é o que o cliente paga e o
 * que vai na cobrança. O líquido é uma leitura em cima dele.
 */

/** Alíquota usada no sistema quando o cliente precisa de nota fiscal. */
export const ALIQUOTA_NOTA = 0.06;

/** O que um contrato precisa dizer para a conta sair. */
export type ContratoLiquido = {
  /** 'recorrente' ou 'pontual': muda como o repasse é distribuído. */
  type: string;
  repasse_valor: number | null;
  precisa_nota: boolean;
};

/**
 * Quanto de uma parcela fica com a gente.
 *
 * O repasse do contrato RECORRENTE é mensal, então pesa inteiro em cada
 * mensalidade. O do contrato PONTUAL é do trabalho inteiro, então se divide
 * entre as parcelas dele, senão a primeira cobrança levaria o repasse todo.
 *
 * Parcela sem contrato (lançamento avulso) não tem de quem herdar a régua: vale
 * o valor cheio, que é melhor do que inventar um desconto.
 */
export function liquidoDaParcela(
  valor: number,
  contrato: ContratoLiquido | null | undefined,
  parcelasDoContrato = 1,
): number {
  if (!contrato || valor <= 0) return Math.max(0, valor);
  const nota = contrato.precisa_nota ? valor * ALIQUOTA_NOTA : 0;
  const total = contrato.repasse_valor ?? 0;
  const repasse =
    contrato.type === 'recorrente' || parcelasDoContrato <= 1 ? total : total / parcelasDoContrato;
  return Math.max(0, valor - nota - repasse);
}

/** A mensalidade líquida de um contrato recorrente: o que ele soma ao MRR. */
export function mrrLiquido(contrato: ContratoLiquido & { mrr: number | null }): number {
  return liquidoDaParcela(contrato.mrr ?? 0, contrato);
}

/**
 * O que comeu a diferença entre o valor cobrado e o que sobra, para a tela
 * dizer o porquê em vez de mostrar dois números e deixar a conta com quem lê.
 * Devolve null quando nada foi descontado.
 */
export function motivoDoDesconto(cobrado: number, liquido: number, nota: number): string | null {
  const tirado = cobrado - liquido;
  if (tirado <= 0.005) return null;
  const temNota = nota > 0.005;
  const temRepasse = tirado - nota > 0.005;
  if (temNota && temRepasse) return 'depois da nota e do repasse';
  return temNota ? 'depois da nota' : 'depois do repasse';
}

/**
 * Quantas parcelas cada contrato tem, para ratear o repasse do pontual. Conta as
 * cobranças já lançadas, que é a melhor medida disponível do parcelamento.
 */
export function parcelasPorContrato(recebiveis: { engagement_id: string | null }[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const r of recebiveis) {
    if (!r.engagement_id) continue;
    mapa.set(r.engagement_id, (mapa.get(r.engagement_id) ?? 0) + 1);
  }
  return mapa;
}

/**
 * Soma o líquido de uma lista de parcelas. `valorDe` existe porque nem sempre o
 * que conta é o `amount`: no que já foi recebido vale o que entrou de verdade.
 */
export function somarLiquido<T extends { engagement_id: string | null; amount: number }>(
  parcelas: T[],
  contratos: Map<string, ContratoLiquido>,
  parcelas_por_contrato: Map<string, number>,
  valorDe: (r: T) => number = (r) => r.amount,
): number {
  return parcelas.reduce((soma, r) => {
    const contrato = r.engagement_id ? contratos.get(r.engagement_id) : null;
    const n = r.engagement_id ? parcelas_por_contrato.get(r.engagement_id) ?? 1 : 1;
    return soma + liquidoDaParcela(valorDe(r), contrato, n);
  }, 0);
}
