import 'server-only';
import { getSupabaseAdmin } from './supabase-admin';

export type BriefingRow = {
  id: string;
  cliente: string;
  produto: string;
  escopo: string;
  template: string;
  status: 'rascunho' | 'enviado';
  respostas: Record<string, string | string[]>;
};

/**
 * Lê um briefing pelo token público (server-only, service-role).
 *
 * `carimbarAbertura` grava quando o cliente abriu o link: é a diferença entre
 * "ele nunca abriu" e "abriu e travou em alguma pergunta". Quando nós mesmos
 * abrimos o link pelo admin, para ver o briefing como o cliente vê, a abertura
 * não é carimbada.
 */
export async function getBriefingByToken(
  token: string,
  carimbarAbertura = false,
): Promise<BriefingRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('onboarding_briefings')
    .select('id, product_name, scope, status, respostas, template_key, first_opened_at, organizations(name)')
    .eq('token', token)
    .maybeSingle();

  if (error || !data) return null;

  if (carimbarAbertura) {
    const agora = new Date().toISOString();
    const { error: erro } = await supabase
      .from('onboarding_briefings')
      .update({
        last_opened_at: agora,
        ...(data.first_opened_at ? {} : { first_opened_at: agora }),
      })
      .eq('id', data.id);
    if (erro) console.error('[onboarding] carimbo de abertura:', erro.message);
  }

  const org = data.organizations as { name?: string } | { name?: string }[] | null;
  const cliente = Array.isArray(org) ? org[0]?.name : org?.name;

  return {
    id: data.id as string,
    cliente: cliente ?? 'Cliente',
    produto: (data.product_name as string) ?? '',
    escopo: (data.scope as string) ?? '',
    template: (data.template_key as string) ?? 'produto',
    status: (data.status as 'rascunho' | 'enviado') ?? 'rascunho',
    respostas: (data.respostas as Record<string, string | string[]>) ?? {},
  };
}
