import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/** Teto de linhas que o PostgREST devolve por requisição, quando não paginamos. */
const PAGINA = 1000;

/**
 * Server-only Supabase client using the service_role key.
 * Never import this from client components.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  }

  cached = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * Lê TODAS as linhas de uma consulta, em páginas de 1000.
 *
 * O PostgREST corta a resposta em 1000 linhas por padrão, em silêncio. Quem lê
 * eventos e gravações (que passam de mil rapidinho) recebia só o primeiro pedaço
 * — e, com a ordem ascendente, esse pedaço era o mais ANTIGO: a tela de
 * Comportamento parou de mostrar gravação nova a partir do dia em que o total
 * passou de mil, sem nenhum erro aparecer.
 *
 * `montar` recebe a faixa de linhas e devolve a consulta já com o range aplicado.
 * O teto existe para uma consulta mal filtrada não varrer a tabela inteira.
 */
export async function lerTudo<T>(
  montar: (de: number, ate: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  teto = 50_000,
): Promise<{ data: T[]; error: string | null }> {
  const todas: T[] = [];
  for (let de = 0; de < teto; de += PAGINA) {
    const { data, error } = await montar(de, de + PAGINA - 1);
    if (error) return { data: todas, error: error.message };
    const pagina = data ?? [];
    todas.push(...pagina);
    if (pagina.length < PAGINA) break;
  }
  return { data: todas, error: null };
}
