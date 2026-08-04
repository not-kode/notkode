// Exclusão de tráfego interno por IP, usada na ingestão de analytics (/api/track)
// e de gravações (/api/rec). A navegação da própria equipe inflava as métricas e
// gravações; aqui o acesso vindo de um IP interno simplesmente não é registrado.
//
// Os IPs internos vêm da env INTERNAL_IPS (lista separada por vírgula). NÃO
// guardamos IP de ninguém — só comparamos o IP da requisição com a lista e, se
// bater, pulamos o insert. IMPORTANTE: NÃO excluir referrers de sites parceiros
// (o link da Notkode no rodapé deles é tráfego orgânico real) — isso é só IP.
//
// Uma entrada terminada em ':' ou '.' vale como PREFIXO. Serve para o IPv6 de
// casa: o provedor mantém o bloco (2804:7f0:b781:863b:) e o aparelho troca o
// final sozinho, então casar o endereço inteiro nunca daria certo.
//
// Isto é só a rede de segurança. A exclusão que realmente segura é o modo interno
// por aparelho (?nk=interno, em components/analytics.tsx), porque IP residencial
// muda quando a operadora quer e celular em rede móvel nunca bate com a lista.

const entradas = (process.env.INTERNAL_IPS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const INTERNAL_IPS = new Set(entradas.filter((e) => !e.endsWith(':') && !e.endsWith('.')));
const INTERNAL_PREFIXES = entradas.filter((e) => e.endsWith(':') || e.endsWith('.'));

/** IP do cliente a partir dos headers do proxy (x-forwarded-for na Vercel). */
export function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || null;
}

/** true quando a requisição vem de um IP interno configurado (não deve virar métrica). */
export function isInternalRequest(req: Request): boolean {
  if (INTERNAL_IPS.size === 0 && INTERNAL_PREFIXES.length === 0) return false;
  const ip = getClientIp(req);
  if (ip == null) return false;
  if (INTERNAL_IPS.has(ip)) return true;
  const alvo = ip.toLowerCase();
  return INTERNAL_PREFIXES.some((p) => alvo.startsWith(p.toLowerCase()));
}
