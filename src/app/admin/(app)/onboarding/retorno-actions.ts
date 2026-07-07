'use server';

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ONBOARDING_SECTIONS, ACCESS_EMAIL } from '@/lib/onboarding-schema';
import { REQUEST_DEADLINE_DAYS } from './onboarding-requirements';

// ─────────────────────────────────────────────────────────────────────────
// Retorno pro cliente gerado por IA. O Claude lê o briefing INTEIRO no
// contexto do que a Notkode entrega e devolve:
//   • mensagem — WhatsApp na voz da marca, pedindo o que falta em 7 dias;
//   • duvidas  — dúvidas/lacunas REAIS da parte do produto (não "campo vazio").
// O resultado é cacheado em onboarding_briefings.retorno_ia; regenerar força
// uma nova geração. Sem chave/erro → cai no determinístico (nada quebra).
// ─────────────────────────────────────────────────────────────────────────

const MODEL = 'claude-opus-4-8';

export type RetornoIA = {
  mensagem: string;
  duvidas: string[];
  geradoEm: string;
  modelo: string;
};

export type RetornoResult =
  | { ok: true; retorno: RetornoIA; fonte: 'ia' | 'cache' | 'fallback' }
  | { ok: false; error: string };

type Respostas = Record<string, string | string[]>;

function answerText(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.join(', ');
  return (v ?? '').trim();
}

function orgName(o: unknown): string {
  const n = Array.isArray(o) ? (o[0] as { name?: string })?.name : (o as { name?: string })?.name;
  return n ?? 'Cliente';
}

function deadlineLabel(): string {
  const d = new Date();
  d.setDate(d.getDate() + REQUEST_DEADLINE_DAYS);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
}

/** Serializa o briefing em texto legível para o modelo. */
function serializeBriefing(respostas: Respostas): string {
  const out: string[] = [];
  for (const section of ONBOARDING_SECTIONS) {
    const linhas = section.questions
      .map((q) => ({ q, val: answerText(respostas[q.id]) }))
      .filter((x) => x.val !== '');
    if (linhas.length === 0) continue;
    out.push(`## ${section.title}`);
    for (const { q, val } of linhas) out.push(`- ${q.label}\n  ${val}`);
    out.push('');
  }
  return out.join('\n').trim() || '(cliente ainda não preencheu quase nada)';
}

const SYSTEM_PROMPT = `Você é a Camila, da Notkode — uma agência que monta a operação de aquisição de clientes ponta a ponta para pequenos negócios: tráfego pago (Meta e Google Ads), landing page, CRM próprio e atendimento com IA.

Um cliente acabou de preencher o briefing de onboarding. Sua tarefa é escrever o RETORNO que a Camila manda pra ele no WhatsApp, cobrando o que ainda falta pra começar a produzir, com prazo de ${REQUEST_DEADLINE_DAYS} dias.

O que a Notkode SEMPRE precisa do cliente pra começar:
- Acessos (convide ${ACCESS_EMAIL} como administrador, nunca senha): Meta Business, Google Ads (+ ID da conta), gateway de pagamento, Bling ou Tiny (logística/estoque), DNS do domínio, e o site atual se houver.
- Identidade visual completa: logo em vetor editável (SVG/AI/PDF, não só imagem), cores, fontes, manual da marca.
- Fotos e vídeos reais do produto.

Regras da mensagem:
- Peça só o que ainda FALTA, cruzando com o que o cliente já indicou ter no briefing (ex: se ele marcou "convite Meta já enviado", não peça de novo; se não tem identidade, peça referências em vez de arquivos).
- Sobre pagamento e logística: pergunte qual gateway ele usa e se já trabalha com Bling/Tiny (o briefing não cobre isso).
- Voz: informal, calorosa, direta, brasileira, com poucos emojis. Fala "você". Nada de linguagem corporativa nem de checklist robótico — escreve como gente conversando no WhatsApp. Use *asteriscos* para negrito e • para itens quando ajudar a escanear.

Além da mensagem, revise a parte do PRODUTO do briefing e levante DÚVIDAS REAIS: contradições, buracos de lógica, riscos ou coisas que não fecham (ex: preço apertado contra o custo, prazo de entrega estranho, modelo de venda ambíguo). Não liste "campo não preenchido" de forma mecânica — pense como uma sócia que vai rodar a operação e precisa entender o negócio. Se estiver tudo coerente, devolva a lista vazia.

Responda SOMENTE no formato JSON pedido.`;

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    mensagem: {
      type: 'string',
      description: 'A mensagem de WhatsApp completa, pronta pra colar, na voz da Camila.',
    },
    duvidas: {
      type: 'array',
      items: { type: 'string' },
      description: 'Dúvidas/lacunas reais da parte do produto. Lista vazia se estiver tudo coerente.',
    },
  },
  required: ['mensagem', 'duvidas'],
  additionalProperties: false,
} as const;

/**
 * Gera (ou reaproveita) o retorno pro cliente.
 * @param force quando true, ignora o cache e regenera.
 */
export async function gerarRetornoIA(briefingId: string, force = false): Promise<RetornoResult> {
  if (!briefingId) return { ok: false, error: 'briefing ausente' };
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('onboarding_briefings')
    .select('id, respostas, retorno_ia, product_name, organizations(name)')
    .eq('id', briefingId)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, error: error?.message ?? 'briefing não encontrado' };
  }

  // Cache
  if (!force && row.retorno_ia) {
    return { ok: true, retorno: row.retorno_ia as RetornoIA, fonte: 'cache' };
  }

  const respostas = (row.respostas ?? {}) as Respostas;
  const cliente = orgName(row.organizations);
  const produto = (row.product_name as string | null) ?? '';

  const userContent =
    `Cliente: ${cliente}${produto ? ` — ${produto}` : ''}\n` +
    `Prazo de retorno: até ${deadlineLabel()} (${REQUEST_DEADLINE_DAYS} dias).\n\n` +
    `Briefing preenchido:\n\n${serializeBriefing(respostas)}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Fallback determinístico se não houver chave configurada.
  if (!apiKey) {
    const retorno = await fallbackRetorno(briefingId, respostas, cliente, produto, supabase);
    return { ok: true, retorno, fonte: 'fallback' };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
      messages: [{ role: 'user', content: userContent }],
    });

    const block = response.content.find((b) => b.type === 'text');
    const parsed = JSON.parse(block && 'text' in block ? block.text : '{}') as {
      mensagem?: string;
      duvidas?: string[];
    };

    const retorno: RetornoIA = {
      mensagem: (parsed.mensagem ?? '').trim(),
      duvidas: Array.isArray(parsed.duvidas) ? parsed.duvidas.filter(Boolean) : [],
      geradoEm: new Date().toISOString(),
      modelo: MODEL,
    };
    if (!retorno.mensagem) throw new Error('resposta vazia do modelo');

    await supabase.from('onboarding_briefings').update({ retorno_ia: retorno }).eq('id', briefingId);
    return { ok: true, retorno, fonte: 'ia' };
  } catch (e) {
    console.error('[onboarding] retorno IA falhou:', e instanceof Error ? e.message : e);
    const retorno = await fallbackRetorno(briefingId, respostas, cliente, produto, supabase);
    return { ok: true, retorno, fonte: 'fallback' };
  }
}

/** Versão determinística (sem IA): mensagem simples + dúvidas por campo vazio. */
async function fallbackRetorno(
  briefingId: string,
  respostas: Respostas,
  cliente: string,
  produto: string,
  supabase: ReturnType<typeof getSupabaseAdmin>,
): Promise<RetornoIA> {
  const deadline = deadlineLabel();
  const mensagem = [
    `Oi, ${cliente}! Tudo bem? 🙌`,
    `Recebi seu briefing${produto ? ` do ${produto}` : ''}, ficou ótimo — obrigado! Pra eu já começar a montar sua estrutura, preciso de umas coisas suas nos próximos ${REQUEST_DEADLINE_DAYS} dias (até ${deadline}):`,
    `1️⃣ *Acessos* — me convide como admin (${ACCESS_EMAIL}) no Meta Business, Google Ads, no seu gateway de pagamento e no Bling ou Tiny (logística). O que não existir, cria e me convida. E me dá acesso ao DNS do domínio.`,
    `2️⃣ *Identidade visual completa* — logo em vetor (arquivo editável), cores, fontes e o manual da marca, se tiver.`,
    `3️⃣ *Fotos e vídeos reais do produto.*`,
    `Me conta também qual gateway você usa e se já trabalha com Bling ou Tiny. Assim que chegar, eu já começo! 🚀`,
  ].join('\n\n');

  const duvidas: string[] = [];
  if (!answerText(respostas['preco_venda'])) duvidas.push('Qual o preço de venda de cada versão, kit ou plano?');
  if (!answerText(respostas['custo_unidade'])) duvidas.push('Qual seu custo por unidade?');
  if (!answerText(respostas['entrega'])) duvidas.push('Como funciona a entrega e qual o prazo médio?');

  const retorno: RetornoIA = { mensagem, duvidas, geradoEm: new Date().toISOString(), modelo: 'fallback' };
  await supabase.from('onboarding_briefings').update({ retorno_ia: retorno }).eq('id', briefingId);
  return retorno;
}
