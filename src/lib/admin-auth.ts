// Shared-secret auth for the /admin area.
// Edge-safe (Web Crypto only) so it can run in middleware AND in route/server-action runtimes.
// The session cookie is an HMAC-signed, expiring token — it never carries the raw password.

export const SESSION_COOKIE = 'nk_admin';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias

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

/** Build a signed session token valid for SESSION_TTL_MS. */
export async function createSessionToken(now: number): Promise<string | null> {
  const secret = adminSecret();
  if (!secret) return null;
  const exp = now + SESSION_TTL_MS;
  const sig = await hmac(secret, String(exp));
  return `${exp}.${sig}`;
}

/** Verify a session token: well-formed, not expired, signature matches. */
export async function verifySessionToken(token: string | undefined, now: number): Promise<boolean> {
  const secret = adminSecret();
  if (!secret || !token) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = await hmac(secret, expStr);
  return timingSafeEqual(sig, expected);
}
