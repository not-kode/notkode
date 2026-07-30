// Cliente do SimbOS. O SimbOS não expõe REST: a porta de entrada é o servidor
// MCP dele, que é JSON-RPC sobre HTTP e responde em text/event-stream. Aqui a
// gente fala esse protocolo direto, sem SDK, porque é uma chamada só.
//
// A ligação é de mão dupla, mas por caminhos diferentes:
//   sistema → SimbOS   na hora, dentro da própria server action
//   SimbOS → sistema   por sincronização periódica (/api/sync/simbos), porque
//                      o SimbOS não tem webhook de mudança de tarefa
//
// Sem as variáveis de ambiente configuradas, tudo aqui vira no-op: o sistema
// continua funcionando sozinho, só não espelha.

const URL_MCP = process.env.SIMBOS_MCP_URL ?? '';
const TOKEN = process.env.SIMBOS_TOKEN ?? '';
export const SIMBOS_WORKSPACE = process.env.SIMBOS_WORKSPACE ?? 'notkode';

export const simbosAtivo = () => Boolean(URL_MCP && TOKEN);

/** Extrai o JSON de dentro do event-stream do MCP. */
function parseSse(texto: string): unknown {
  for (const linha of texto.split('\n')) {
    if (linha.startsWith('data:')) {
      try {
        return JSON.parse(linha.slice(5).trim());
      } catch {
        /* linha de keep-alive, segue */
      }
    }
  }
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

type Resposta = {
  result?: { content?: { type: string; text?: string }[]; isError?: boolean };
  error?: { message?: string };
};

/**
 * Chama uma ferramenta do SimbOS. Devolve o conteúdo já desembrulhado (o MCP
 * responde com texto dentro de content[], e as ferramentas do SimbOS mandam
 * JSON nesse texto).
 *
 * Nunca lança: espelhar é conveniência, e uma falha lá não pode derrubar a
 * ação que o usuário fez aqui.
 */
export async function simbosCall(tool: string, args: Record<string, unknown>): Promise<unknown> {
  if (!simbosAtivo()) return null;

  try {
    const res = await fetch(URL_MCP, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: tool, arguments: args },
      }),
      // O SimbOS é dependência externa: não vale travar a tela esperando.
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.error(`[simbos] ${tool} respondeu ${res.status}`);
      return null;
    }

    const corpo = parseSse(await res.text()) as Resposta | null;
    if (corpo?.error) {
      console.error(`[simbos] ${tool}: ${corpo.error.message}`);
      return null;
    }

    const texto = corpo?.result?.content?.find((c) => c.type === 'text')?.text;
    if (!texto) return null;
    if (corpo?.result?.isError) {
      console.error(`[simbos] ${tool}: ${texto.slice(0, 200)}`);
      return null;
    }
    try {
      return JSON.parse(texto);
    } catch {
      return texto;
    }
  } catch (e) {
    console.error(`[simbos] ${tool} falhou:`, e instanceof Error ? e.message : e);
    return null;
  }
}

// ── Tradução dos dois vocabulários ───────────────────────────────────────────
//
// O sistema tem uma coluna a menos e nomes em português; o SimbOS usa inglês.

export const STATUS_PARA_SIMBOS: Record<string, string> = {
  backlog: 'backlog',
  a_fazer: 'todo',
  fazendo: 'in_progress',
  revisao: 'review',
  feito: 'done',
};

export const STATUS_DO_SIMBOS: Record<string, string> = {
  backlog: 'backlog',
  todo: 'a_fazer',
  in_progress: 'fazendo',
  review: 'revisao',
  done: 'feito',
};

export const PRIORIDADE_PARA_SIMBOS: Record<string, string> = {
  baixa: 'low',
  media: 'medium',
  alta: 'high',
  urgente: 'urgent',
};

export const PRIORIDADE_DO_SIMBOS: Record<string, string> = {
  low: 'baixa',
  medium: 'media',
  high: 'alta',
  urgent: 'urgente',
};
