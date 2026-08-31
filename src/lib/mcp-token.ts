// Tokens do servidor MCP, um por pessoa.
//
// O token nasce aqui, é mostrado uma vez para quem gerou e depois só existe em
// hash no banco (tabela mcp_tokens). Quem chama /api/mcp manda o valor no
// Authorization: o servidor calcula o hash, acha o dono e daí em diante sabe em
// nome de quem está trabalhando: tarefa e comentário criados pelo terminal saem
// com o nome certo, em vez do responsável padrão da casa.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

/** Prefixo para o token ser reconhecível quando aparece solto num arquivo de config. */
const PREFIXO = 'nkmcp_';

export type DonoDoToken = {
  usuarioId: string;
  /** Nome de quem chamou, para carimbar o que for criado. */
  nome: string;
};

/** Token novo: prefixo + 32 bytes aleatórios em hex. */
export function gerarToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${PREFIXO}${hex}`;
}

/** SHA-256 em hex. Web Crypto para valer tanto no Node quanto no Edge. */
export async function hashDoToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * De quem é este token? Devolve null quando não existe, foi revogado ou o
 * acesso da pessoa foi desativado no /admin: desligar alguém do CRM desliga
 * junto o terminal dela, sem ninguém precisar lembrar de revogar à mão.
 */
export async function donoDoToken(token: string): Promise<DonoDoToken | null> {
  if (!token.startsWith(PREFIXO)) return null;

  const db = getSupabaseAdmin();
  const { data } = await db
    .from('mcp_tokens')
    .select('id, admin_user_id, admin_users(nome, ativo)')
    .eq('token_hash', await hashDoToken(token))
    .is('revogado_em', null)
    .maybeSingle();

  const linha = data as unknown as {
    id: string;
    admin_user_id: string;
    admin_users: { nome: string; ativo: boolean } | null;
  } | null;

  if (!linha?.admin_users?.ativo) return null;

  // Carimba o uso. Serve só para a tela de acessos mostrar quem está mesmo
  // usando o terminal; espera o banco porque, sem await, a função serverless
  // pode encerrar antes de a escrita sair.
  await db.from('mcp_tokens').update({ ultimo_uso: new Date().toISOString() }).eq('id', linha.id);

  return { usuarioId: linha.admin_user_id, nome: linha.admin_users.nome };
}

export type Origem = 'manual' | 'oauth';

/**
 * Cria o token da pessoa e devolve o valor em texto, que não volta nunca mais.
 *
 * O token gerado na tela ("manual") revoga o anterior: é um por pessoa, para
 * não sobrar valor esquecido num arquivo de configuração. O emitido pelo OAuth
 * não revoga nada, porque cada aparelho que a pessoa autoriza tem o seu.
 */
export async function criarTokenPara(
  usuarioId: string,
  opcoes: { apelido?: string | null; origem?: Origem; clientId?: string | null } = {},
): Promise<string> {
  const db = getSupabaseAdmin();
  const origem: Origem = opcoes.origem ?? 'manual';
  if (origem === 'manual') await revogarTokenDe(usuarioId, 'manual');

  const token = gerarToken();
  const { error } = await db.from('mcp_tokens').insert({
    admin_user_id: usuarioId,
    token_hash: await hashDoToken(token),
    apelido: opcoes.apelido?.trim() || null,
    origem,
    client_id: opcoes.clientId ?? null,
  });
  if (error) throw new Error(error.message);

  return token;
}

/** Revoga os tokens ativos de alguém. Sem origem, revoga todos. */
export async function revogarTokenDe(usuarioId: string, origem?: Origem): Promise<void> {
  let q = getSupabaseAdmin()
    .from('mcp_tokens')
    .update({ revogado_em: new Date().toISOString() })
    .eq('admin_user_id', usuarioId)
    .is('revogado_em', null);
  if (origem) q = q.eq('origem', origem);
  await q;
}

/** Revoga um token específico, o que a pessoa faz quando perde um aparelho. */
export async function revogarToken(id: string): Promise<void> {
  await getSupabaseAdmin()
    .from('mcp_tokens')
    .update({ revogado_em: new Date().toISOString() })
    .eq('id', id)
    .is('revogado_em', null);
}

export type TokenDaPessoa = {
  id: string;
  origem: Origem;
  /** Nome do cliente que pediu o acesso, quando veio pelo OAuth. */
  cliente: string | null;
  criadoEm: string;
  ultimoUso: string | null;
};

/** Os tokens ativos de cada pessoa, por id de usuário, para a tela de acessos. */
export async function tokensAtivos(): Promise<Record<string, TokenDaPessoa[]>> {
  const { data } = await getSupabaseAdmin()
    .from('mcp_tokens')
    .select('id, admin_user_id, origem, criado_em, ultimo_uso, oauth_clients(nome)')
    .is('revogado_em', null)
    .order('criado_em');

  const linhas = (data ?? []) as unknown as {
    id: string; admin_user_id: string; origem: string; criado_em: string;
    ultimo_uso: string | null; oauth_clients: { nome: string | null } | null;
  }[];

  const porPessoa: Record<string, TokenDaPessoa[]> = {};
  for (const l of linhas) {
    (porPessoa[l.admin_user_id] ??= []).push({
      id: l.id,
      origem: l.origem === 'oauth' ? 'oauth' : 'manual',
      cliente: l.oauth_clients?.nome ?? null,
      criadoEm: l.criado_em,
      ultimoUso: l.ultimo_uso,
    });
  }
  return porPessoa;
}
