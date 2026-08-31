// O lado OAuth do servidor MCP.
//
// O site é ao mesmo tempo o servidor de autorização e o recurso protegido. Na
// prática: a pessoa manda o endereço do MCP para o cliente dela (Claude Code e
// afins), o cliente descobre por aqui onde autenticar, o navegador abre no
// login do /admin, ela confirma numa tela e o token nasce sozinho. Ninguém
// copia segredo de um lado para o outro.
//
// É o subconjunto do OAuth 2.1 que a especificação do MCP pede: descoberta
// (RFC 9728 e RFC 8414), cadastro do cliente sem intervenção (RFC 7591), código
// de autorização com PKCE e o parâmetro "resource" (RFC 8707) para o token não
// valer em outro servidor.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SITE_URL } from '@/lib/seo';

/** O recurso protegido: o endereço que o cliente MCP realmente chama. */
export const URL_DO_MCP = `${SITE_URL}/api/mcp`;

/** A tela onde a pessoa autoriza. Fica no /admin de propósito: o middleware de lá já manda para o login quem não entrou. */
export const URL_DE_AUTORIZACAO = `${SITE_URL}/admin/autorizar`;

const URL_DO_TOKEN = `${SITE_URL}/api/oauth/token`;
const URL_DE_CADASTRO = `${SITE_URL}/api/oauth/register`;

/** Janela do código de autorização: o tempo entre a pessoa clicar e o cliente trocar. */
const VALIDADE_DO_CODIGO_MS = 5 * 60 * 1000;

// ── Descoberta ──────────────────────────────────────────────────────────────

/** RFC 9728: o que o cliente lê para saber onde fica o servidor de autorização. */
export function metadataDoRecurso() {
  return {
    resource: URL_DO_MCP,
    authorization_servers: [SITE_URL],
    bearer_methods_supported: ['header'],
    resource_name: 'Sistema Notkode',
  };
}

/** RFC 8414: os endereços e os formatos que este servidor de autorização aceita. */
export function metadataDoServidor() {
  return {
    issuer: SITE_URL,
    authorization_endpoint: URL_DE_AUTORIZACAO,
    token_endpoint: URL_DO_TOKEN,
    registration_endpoint: URL_DE_CADASTRO,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    // Só S256: PKCE simples ("plain") não protege de nada.
    code_challenge_methods_supported: ['S256'],
    // Cliente público, sem segredo para apresentar no token endpoint.
    token_endpoint_auth_methods_supported: ['none'],
  };
}

// ── Peças de criptografia ───────────────────────────────────────────────────

const paraBase64url = (bytes: Uint8Array): string => {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const aleatorio = (bytes = 32): string => paraBase64url(crypto.getRandomValues(new Uint8Array(bytes)));

const sha256 = async (texto: string): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)));

const hashHex = async (texto: string): Promise<string> =>
  Array.from(await sha256(texto), (b) => b.toString(16).padStart(2, '0')).join('');

/** O desafio do PKCE: base64url do SHA-256 do verificador que só o cliente conhece. */
const desafioDe = async (verificador: string): Promise<string> => paraBase64url(await sha256(verificador));

// ── Cadastro do cliente (RFC 7591) ──────────────────────────────────────────

export type ClienteOAuth = { clientId: string; nome: string | null; redirectUris: string[] };

/**
 * Endereço de volta aceitável: localhost (o cliente de terminal sobe um
 * servidor efêmero na máquina da pessoa) ou HTTPS. Qualquer outra coisa vira
 * porta para mandar a pessoa e o código para um site estranho.
 */
export function redirectValido(uri: string): boolean {
  try {
    const u = new URL(uri);
    if (u.hash) return false;
    if (u.protocol === 'https:') return true;
    return u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]');
  } catch {
    return false;
  }
}

export async function registrarCliente(nome: string | null, redirectUris: string[]): Promise<ClienteOAuth> {
  const clientId = `nkc_${aleatorio(16)}`;
  const { error } = await getSupabaseAdmin().from('oauth_clients').insert({
    client_id: clientId,
    nome: nome?.slice(0, 120) ?? null,
    redirect_uris: redirectUris,
  });
  if (error) throw new Error(error.message);
  return { clientId, nome: nome ?? null, redirectUris };
}

export async function acharCliente(clientId: string): Promise<ClienteOAuth | null> {
  const { data } = await getSupabaseAdmin()
    .from('oauth_clients')
    .select('client_id, nome, redirect_uris')
    .eq('client_id', clientId)
    .maybeSingle();

  const l = data as { client_id: string; nome: string | null; redirect_uris: string[] } | null;
  return l ? { clientId: l.client_id, nome: l.nome, redirectUris: l.redirect_uris ?? [] } : null;
}

// ── Código de autorização ───────────────────────────────────────────────────

export type PedidoDeAutorizacao = {
  clientId: string;
  usuarioId: string;
  redirectUri: string;
  codeChallenge: string;
  resource: string | null;
};

/** Cria o código que a tela de consentimento devolve ao cliente. Vale uma vez, por poucos minutos. */
export async function criarCodigo(pedido: PedidoDeAutorizacao): Promise<string> {
  const code = aleatorio(32);
  const { error } = await getSupabaseAdmin().from('oauth_codes').insert({
    code_hash: await hashHex(code),
    client_id: pedido.clientId,
    admin_user_id: pedido.usuarioId,
    redirect_uri: pedido.redirectUri,
    code_challenge: pedido.codeChallenge,
    resource: pedido.resource,
    expira_em: new Date(Date.now() + VALIDADE_DO_CODIGO_MS).toISOString(),
  });
  if (error) throw new Error(error.message);
  return code;
}

export type ErroOAuth = { erro: string; descricao: string };

/**
 * Troca o código pelo dono dele, conferindo tudo o que precisa bater: cliente,
 * endereço de volta, validade, PKCE e o servidor a que o token se destina.
 * O código é queimado na primeira troca, mesmo que algo dê errado depois.
 */
export async function resgatarCodigo(entrada: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  resource: string | null;
}): Promise<{ usuarioId: string } | ErroOAuth> {
  const db = getSupabaseAdmin();
  const hash = await hashHex(entrada.code);

  const { data } = await db
    .from('oauth_codes')
    .select('code_hash, client_id, admin_user_id, redirect_uri, code_challenge, resource, expira_em, usado_em')
    .eq('code_hash', hash)
    .maybeSingle();

  const codigo = data as {
    client_id: string; admin_user_id: string; redirect_uri: string;
    code_challenge: string; resource: string | null; expira_em: string; usado_em: string | null;
  } | null;

  const invalido: ErroOAuth = { erro: 'invalid_grant', descricao: 'Código inválido, vencido ou já usado.' };
  if (!codigo || codigo.usado_em || Date.parse(codigo.expira_em) < Date.now()) return invalido;

  // Queima antes de conferir o resto: um código que chegou aqui não pode ser
  // tentado de novo, nem por quem errou o verificador na primeira tentativa.
  await db.from('oauth_codes').update({ usado_em: new Date().toISOString() }).eq('code_hash', hash);

  if (codigo.client_id !== entrada.clientId) return invalido;
  if (codigo.redirect_uri !== entrada.redirectUri) return invalido;
  if (codigo.code_challenge !== (await desafioDe(entrada.codeVerifier))) {
    return { erro: 'invalid_grant', descricao: 'O verificador do PKCE não confere.' };
  }
  if (entrada.resource && codigo.resource && entrada.resource !== codigo.resource) {
    return { erro: 'invalid_target', descricao: 'O "resource" pedido não é o mesmo da autorização.' };
  }

  return { usuarioId: codigo.admin_user_id };
}

/** Códigos vencidos não servem para nada; some com eles de vez em quando. */
export async function limparCodigosVelhos(): Promise<void> {
  await getSupabaseAdmin()
    .from('oauth_codes')
    .delete()
    .lt('expira_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
}
