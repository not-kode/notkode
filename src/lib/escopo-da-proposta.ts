/**
 * Tira da proposta anexada a lista do que foi vendido.
 *
 * O contrato sai com a Cláusula 1 (Objeto) genérica quando ninguém escreve o
 * escopo à mão, e aí o documento não diz o que será feito — justamente o que o
 * cliente quer ler. A proposta já tem isso escrito e aprovado; aqui a gente
 * aproveita em vez de redigitar.
 *
 * As propostas da casa são HTML, então dá para ler o que foi vendido. Só que
 * elas não usam <ul>/<li>: o template do design system monta os entregáveis em
 * <div> com classe (o card de investimento, o terminal de módulos). A leitura
 * abaixo entende esse formato e mantém o <li> como retaguarda, para proposta
 * escrita fora do template. Se o anexo for PDF, não há o que extrair sem
 * interpretar o arquivo, e a resposta diz isso em vez de inventar.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

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

const util = (t: string) => t.length > 2 && t.length < 300;

/**
 * O conteúdo de cada elemento que tem a classe pedida. Vai contando abertura e
 * fechamento da mesma tag para não parar no primeiro `</div>` de um filho —
 * blocos do template têm elementos aninhados dentro.
 */
function blocosPorClasse(html: string, classe: string): string[] {
  const aberturas = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*class="[^"]*\\b${classe}\\b[^"]*"[^>]*>`, 'gi');
  const blocos: string[] = [];

  for (const abre of html.matchAll(aberturas)) {
    const tag = abre[1].toLowerCase();
    const inicio = (abre.index ?? 0) + abre[0].length;
    const limites = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    limites.lastIndex = inicio;

    let nivel = 1;
    let fim = html.length;
    let limite: RegExpExecArray | null;
    while ((limite = limites.exec(html)) !== null) {
      nivel += limite[1] ? -1 : 1;
      if (nivel === 0) { fim = limite.index; break; }
    }
    blocos.push(html.slice(inicio, fim));
  }
  return blocos;
}

const textosPorClasse = (html: string, classe: string): string[] =>
  blocosPorClasse(html, classe).map(semTags).filter(util);

/** Itens de lista (<li>) que aparecem num pedaço de HTML. */
function itensDeLista(html: string): string[] {
  return [...html.matchAll(/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/gi)].map((m) => semTags(m[1])).filter(util);
}

/** Os <li> da seção cujo título fala de escopo; sem ela, os do documento todo. */
function listasDoDocumento(html: string): string[] {
  const daSecao: string[] = [];
  for (const bloco of html.split(/(?=<h[1-4][^>]*>)/i)) {
    const titulo = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i.exec(bloco)?.[1];
    if (titulo && TITULOS_DE_ESCOPO.test(semTags(titulo))) daSecao.push(...itensDeLista(bloco));
  }
  return daSecao.length > 0 ? daSecao : itensDeLista(html);
}

/**
 * Os módulos do terminal ("01 pagina-principal/" + o que ele entrega). Vale o
 * resumo, que é a frase escrita para o cliente ler; o nome do módulo é um slug
 * de arquivo e só entra quando não há resumo.
 */
function modulos(html: string): string[] {
  return blocosPorClasse(html, 'term-row')
    .map((bloco) => {
      const resumo = semTags(/<h[3-5](?:\s[^>]*)?>([\s\S]*?)<\/h[3-5]>/i.exec(bloco)?.[1] ?? '');
      if (resumo) return resumo;
      return semTags(blocosPorClasse(bloco, 'mod-name')[0] ?? '')
        .replace(/^[\da-z]{1,2}\s+/i, '')
        .replace(/\/$/, '');
    })
    .filter(util);
}

/** O título da oferta escolhida, para abrir a cláusula dizendo o que foi vendido. */
function tituloDaOferta(html: string): string {
  const card = blocosPorClasse(html, 'invest-card-header')[0];
  return semTags(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i.exec(card ?? '')?.[1] ?? '');
}

/**
 * O "o que esta proposta não inclui". Num contrato isso vale tanto quanto a
 * lista do que entra: é o limite do escopo, escrito antes de assinar.
 *
 * A caixa de aviso do template serve para mais de uma coisa (às vezes é só um
 * destaque sobre o foco do trabalho), então só conta a que se anuncia como
 * exclusão — senão o contrato sairia dizendo que não inclui algo que inclui.
 */
const AVISO_DE_EXCLUSAO = /(n[ãa]o inclu|fora do escopo|n[ãa]o entra|n[ãa]o est[ãa]o inclu)/i;

function foraDoEscopo(html: string): string {
  for (const bloco of blocosPorClasse(html, 'nao-incluso')) {
    const etiqueta = semTags(blocosPorClasse(bloco, 'tag-warn')[0] ?? '');
    const titulo = semTags(/<h[2-5](?:\s[^>]*)?>([\s\S]*?)<\/h[2-5]>/i.exec(bloco)?.[1] ?? '');
    if (!AVISO_DE_EXCLUSAO.test(`${etiqueta} ${titulo}`)) continue;
    // `<p\s|>` e não `<p[^>]*>`: sem isso o <path> do ícone entra como parágrafo.
    const texto = semTags(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i.exec(bloco)?.[1] ?? '');
    if (texto) return texto;
  }
  return '';
}

export type EscopoExtraido = {
  itens: string[];
  /** Como o texto ficaria na cláusula, já com marcadores de lista. */
  texto: string;
};

export function extrairEscopo(html: string): EscopoExtraido {
  // Uma fonte só, a mais específica que existir no documento: as features do
  // card de investimento são a lista canônica do que está incluso; os módulos
  // dizem a mesma coisa em outra altura. Somar as duas só repetiria o escopo.
  let itens: string[] = [];
  for (const fonte of [
    () => textosPorClasse(html, 'invest-feature'),
    () => modulos(html),
    () => listasDoDocumento(html),
  ]) {
    if (itens.length > 0) break;
    itens = [...new Set(fonte())].slice(0, 30);
  }

  if (itens.length === 0) return { itens: [], texto: '' };

  const oferta = tituloDaOferta(html).replace(/\s*\.$/, '');
  const fora = foraDoEscopo(html);

  const linhas = [
    oferta ? `O objeto deste contrato é: ${oferta}.` : null,
    'O escopo contratado compreende:',
    ...itens.map((i) => `• ${i}`),
    fora ? `Não estão inclusos nos serviços contratados: ${fora}` : null,
  ].filter(Boolean);

  return { itens, texto: linhas.join('\n') };
}

/**
 * Lê a proposta guardada no storage e devolve o escopo. Usado pela tela de
 * contratos (botão "puxar da proposta") e pelo ganho do negócio, para os dois
 * chegarem exatamente no mesmo texto.
 */
export async function escopoDoArquivo(
  db: SupabaseClient,
  caminho: string | null | undefined,
): Promise<{ texto: string; aviso?: string }> {
  if (!caminho) return { texto: '', aviso: 'Este contrato não tem proposta anexada.' };
  if (!/\.html?$/i.test(caminho)) {
    return { texto: '', aviso: 'A proposta anexada é um PDF: só consigo ler os entregáveis de proposta em HTML.' };
  }

  const { data, error } = await db.storage.from('propostas').download(caminho);
  if (error || !data) return { texto: '', aviso: 'Não consegui abrir o arquivo da proposta.' };

  const { texto, itens } = extrairEscopo(await data.text());
  if (itens.length === 0) {
    return { texto: '', aviso: 'Não achei uma lista de entregáveis nessa proposta. Escreva o escopo à mão.' };
  }
  return { texto };
}
