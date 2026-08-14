/**
 * "Nenhuma dessas" nas perguntas de múltipla escolha do orçamento.
 *
 * Essas perguntas aceitavam avançar sem nenhuma marcação, e eram o último ponto do
 * formulário onde dava para passar sem responder. Obrigar a marcar alguma sem oferecer
 * saída faria quem não quer nada marcar qualquer coisa, inflando a estimativa e o
 * briefing. Então a resposta "não quero nada disso" virou uma opção explícita, que não
 * soma valor nenhum e desmarca as outras.
 */

export const VALOR_NENHUMA = 'nenhuma';

export const OPCAO_NENHUMA = { value: VALOR_NENHUMA, label: 'Nenhuma dessas' };

/** Tira o "Nenhuma dessas" antes de contar ou precificar as escolhas. */
export function escolhasReais(valor: string | string[] | undefined): string[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((v) => v !== VALOR_NENHUMA);
}

/**
 * Marca ou desmarca respeitando a exclusividade: escolher "Nenhuma dessas" limpa o resto,
 * e escolher qualquer outra tira o "Nenhuma dessas".
 */
export function alternarEscolha(atuais: string[], valor: string): string[] {
  if (valor === VALOR_NENHUMA) {
    return atuais.includes(VALOR_NENHUMA) ? [] : [VALOR_NENHUMA];
  }
  const semNenhuma = atuais.filter((v) => v !== VALOR_NENHUMA);
  return semNenhuma.includes(valor)
    ? semNenhuma.filter((v) => v !== valor)
    : [...semNenhuma, valor];
}
