// Exclusão de tráfego interno por IP, usada na ingestão de analytics (/api/track)
// e de gravações (/api/rec). A navegação da própria equipe inflava as métricas e
// gravações; aqui o acesso vindo de um IP interno simplesmente não é registrado.
//
// Os IPs internos vêm da env INTERNAL_IPS (lista separada por vírgula). NÃO
// guardamos IP de ninguém — só comparamos o IP da requisição com a lista e, se
// bater, pulamos o insert. IMPORTANTE: NÃO excluir referrers de sites parceiros
// (o link da Notkode no rodapé deles é tráfego orgânico real) — isso é só IP.

const INTERNAL_IPS: Set<string> = new Set(
  (process.env.INTERNAL_IPS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

/** IP do cliente a partir dos headers do proxy (x-forwarded-for na Vercel). */
export function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || null;
}

/** true quando a requisição vem de um IP interno configurado (não deve virar métrica). */
export function isInternalRequest(req: Request): boolean {
  if (INTERNAL_IPS.size === 0) return false;
  const ip = getClientIp(req);
  return ip != null && INTERNAL_IPS.has(ip);
}
