// Auth for the /admin area.
// Edge-safe (Web Crypto only) so it can run in middleware AND in route/server-action runtimes.
// The session cookie is an HMAC-signed, expiring token — it never carries the raw password.
//
// Each person has their own login (see the admin_users table); the password itself
// is hashed and checked inside Postgres (bcrypt/pgcrypto, funções admin_login e
// admin_criar_usuario), para dar para criar acesso direto no SQL. ADMIN_PASSWORD still
// works as a back door so a broken user table can't lock everyone out; a session
// opened that way has no user id and shows up as "acesso geral".

export const SESSION_COOKIE = 'nk_admin';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias

/** Session id of a login made with the shared ADMIN_PASSWORD instead of a user account. */
export const SESSAO_GERAL = 'root';

const enc = new TextEncoder();

function toB64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function adminSecret(): string | null {
  const s = process.env.ADMIN_PASSWORD;
  return s && s.length > 0 ? s : null;
}

/**
 * Key that signs the session cookie. Separate from the login password so that
 * changing (or one day removing) ADMIN_PASSWORD doesn't invalidate every session
 * — set ADMIN_SESSION_SECRET and the cookies survive it.
 */
function sessionSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length > 0) return s;
  return adminSecret();
}

async function hmac(key: string, msg: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(msg));
  return toB64url(new Uint8Array(sig));
}

/** Constant-time check of a submitted password against ADMIN_PASSWORD. */
export async function verifyPassword(input: string): Promise<boolean> {
  const secret = adminSecret();
  if (!secret || !input) return false;
  // Hash both sides so the compare is constant-time regardless of length.
  const a = await hmac(secret, 'pw');
  const b = await hmac(input, 'pw');
  return timingSafeEqual(a, b);
}

// ── Sessão ─────────────────────────────────────────────────────────────────
// Formato: "<uid>.<exp>.<assinatura>". O id vai no cookie assinado para o
// middleware saber quem está logado sem uma consulta ao banco a cada rota.

/** Build a signed session token valid for SESSION_TTL_MS. */
export async function createSessionToken(now: number, uid: string = SESSAO_GERAL): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = now + SESSION_TTL_MS;
  const corpo = `${uid}.${exp}`;
  return `${corpo}.${await hmac(secret, corpo)}`;
}

/**
 * Abre o token: devolve quem está logado, ou null se estiver malformado,
 * vencido ou com assinatura que não bate.
 */
export async function lerSessao(
  token: string | undefined,
  now: number,
): Promise<{ uid: string; exp: number } | null> {
  const secret = sessionSecret();
  if (!secret || !token) return null;

  const partes = token.split('.');
  // Cookie do formato antigo ("<exp>.<assinatura>", sem usuário): continua
  // valendo até vencer, para o time não ser deslogado na virada.
  const [uid, expStr, sig] = partes.length === 2 ? [SESSAO_GERAL, partes[0], partes[1]] : partes;
  if (partes.length > 3 || !expStr || !sig) return null;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now) return null;

  const corpo = partes.length === 2 ? expStr : `${uid}.${expStr}`;
  if (!timingSafeEqual(sig, await hmac(secret, corpo))) return null;

  return { uid, exp };
}

/** Verify a session token: well-formed, not expired, signature matches. */
export async function verifySessionToken(token: string | undefined, now: number): Promise<boolean> {
  return (await lerSessao(token, now)) !== null;
}
