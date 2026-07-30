// Servidor MCP do sistema da Notkode.
//
// É por aqui que o terminal (Claude Code, ou qualquer cliente MCP) fala com o
// CRM: consultar projetos, criar tarefa, mexer no cronograma, ver o financeiro,
// ler briefing. O sistema é a fonte da verdade; nada disso passa por fora.
//
// Protocolo: JSON-RPC 2.0 sobre HTTP, resposta em JSON puro (o transporte
// "streamable http" aceita isso, e sem stream o servidor fica trivial).
// Autenticação: Bearer com o MCP_TOKEN do ambiente. Sem token configurado, a
// rota se recusa a responder, para não expor o CRM por acidente.

import { NextResponse } from 'next/server';
import { ErroDeUso } from '@/lib/mcp/nucleo';
import { acharFerramenta, todas } from '@/lib/mcp';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const VERSAO_PROTOCOLO = '2025-06-18';

type Pedido = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const resposta = (id: Pedido['id'], resultado: unknown) =>
  NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result: resultado });

const erro = (id: Pedido['id'], codigo: number, mensagem: string) =>
  NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code: codigo, message: mensagem } });

function autorizado(req: Request): boolean {
  const esperado = process.env.MCP_TOKEN;
  if (!esperado) return false;
  const cabecalho = req.headers.get('authorization') ?? '';
  const enviado = cabecalho.replace(/^Bearer\s+/i, '').trim();
  return !!enviado && enviado === esperado;
}

export async function POST(req: Request) {
  if (!autorizado(req)) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Token inválido ou ausente.' } },
      { status: 401 },
    );
  }

  let corpo: Pedido;
  try {
    corpo = (await req.json()) as Pedido;
  } catch {
    return erro(null, -32700, 'JSON inválido.');
  }

  const { id, method, params } = corpo;

  // Notificações (initialized, cancelled) não têm resposta.
  if (method?.startsWith('notifications/')) return new Response(null, { status: 202 });

  switch (method) {
    case 'initialize':
      return resposta(id, {
        protocolVersion: VERSAO_PROTOCOLO,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'notkode', title: 'Sistema Notkode', version: '1.0.0' },
        instructions:
          'CRM e entregas da Notkode. Antes de criar ou consultar tarefa a partir de um repositório, chame ' +
          '"projeto_daqui" com o diretório atual: ele diz de qual cliente é aquela pasta, e assim a tarefa não vai ' +
          'parar no projeto errado. Quase tudo aceita o nome do cliente no lugar de id, e o campo "projeto" também ' +
          'aceita o caminho da pasta direto. Comece por "panorama" para se situar, ou "detalhar_projeto" para ' +
          'mergulhar num cliente. Tarefa criada aqui aparece na hora em notkode.com.br/admin/entregas.',
      });

    case 'ping':
      return resposta(id, {});

    case 'tools/list':
      return resposta(id, {
        tools: todas.map((f) => ({ name: f.nome, description: f.descricao, inputSchema: f.entrada })),
      });

    case 'tools/call': {
      const nome = String(params?.name ?? '');
      const ferramenta = acharFerramenta(nome);
      if (!ferramenta) return erro(id, -32602, `Ferramenta desconhecida: ${nome}`);

      const args = (params?.arguments ?? {}) as Record<string, unknown>;
      try {
        const saida = await ferramenta.executar(args);
        return resposta(id, {
          content: [{ type: 'text', text: JSON.stringify(saida, null, 2) }],
          isError: false,
        });
      } catch (e) {
        // Erro de uso volta como conteúdo (o modelo lê e corrige a chamada);
        // erro inesperado vira erro de protocolo, que é problema nosso.
        if (e instanceof ErroDeUso) {
          return resposta(id, { content: [{ type: 'text', text: e.message }], isError: true });
        }
        console.error(`[mcp] ${nome} quebrou:`, e);
        return erro(id, -32603, e instanceof Error ? e.message : 'Erro interno.');
      }
    }

    default:
      return erro(id, -32601, `Método não suportado: ${method}`);
  }
}

/** GET só para conferir que o servidor está de pé (e que o token confere). */
export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ ok: false, motivo: 'token' }, { status: 401 });
  return NextResponse.json({ ok: true, servidor: 'notkode', ferramentas: todas.length, protocolo: VERSAO_PROTOCOLO });
}
