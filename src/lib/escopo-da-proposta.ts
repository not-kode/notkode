/**
 * Tira da proposta anexada a lista do que foi vendido.
 *
 * O contrato sai com a Cláusula 1 (Objeto) genérica quando ninguém escreve o
 * escopo à mão, e aí o documento não diz o que será feito — justamente o que o
 * cliente quer ler. A proposta já tem isso escrito e aprovado; aqui a gente
 * aproveita em vez de redigitar.
 *
 * As propostas da casa são HTML, então dá para ler as listas de entregáveis. Se
 * o anexo for PDF, não há o que extrair sem interpretar o arquivo, e a resposta
 * diz isso em vez de inventar.
 */

/** Seções que costumam guardar o que será entregue. */
const TITULOS_DE_ESCOPO = /(escopo|entreg|o que (está|esta) inclu|inclui|m[óo]dulos|servi[çc]os|pacote|entregas)/i;

const semTags = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Itens de lista (<li>) que aparecem num pedaço de HTML. */
function itensDeLista(html: string): string[] {
  return [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => semTags(m[1]))
    .filter((t) => t.length > 2 && t.length < 300);
}

export type EscopoExtraido = {
  itens: string[];
  /** Como o texto ficaria na cláusula, já com marcadores de lista. */
  texto: string;
};

export function extrairEscopo(html: string): EscopoExtraido {
  // 1) Preferência: a seção cujo título fala de escopo/entregáveis. Pega o que
  //    vem depois do título até o próximo título do mesmo nível.
  const blocos = html.split(/(?=<h[1-4][^>]*>)/i);
  const daSecao: string[] = [];
  for (const bloco of blocos) {
    const titulo = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i.exec(bloco)?.[1];
    if (titulo && TITULOS_DE_ESCOPO.test(semTags(titulo))) daSecao.push(...itensDeLista(bloco));
  }

  // 2) Sem seção reconhecida, valem as listas do documento inteiro: numa
  //    proposta, lista quase sempre é entregável.
  const itens = [...new Set(daSecao.length > 0 ? daSecao : itensDeLista(html))].slice(0, 30);

  return {
    itens,
    texto: itens.length
      ? `O objeto deste contrato compreende:\n${itens.map((i) => `• ${i}`).join('\n')}`
      : '',
  };
}
