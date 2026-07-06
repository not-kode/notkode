import 'server-only';
import { getSupabaseAdmin } from './supabase-admin';

export type BriefingRow = {
  id: string;
  cliente: string;
  produto: string;
  escopo: string;
  status: 'rascunho' | 'enviado';
  respostas: Record<string, string | string[]>;
};

/** Lê um briefing pelo token público (server-only, service-role). */
export async function getBriefingByToken(token: string): Promise<BriefingRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('onboarding_briefings')
    .select('id, product_name, scope, status, respostas, organizations(name)')
    .eq('token', token)
    .maybeSingle();

  if (error || !data) return null;

  const org = data.organizations as { name?: string } | { name?: string }[] | null;
  const cliente = Array.isArray(org) ? org[0]?.name : org?.name;

  return {
    id: data.id as string,
    cliente: cliente ?? 'Cliente',
    produto: (data.product_name as string) ?? '',
    escopo: (data.scope as string) ?? '',
    status: (data.status as 'rascunho' | 'enviado') ?? 'rascunho',
    respostas: (data.respostas as Record<string, string | string[]>) ?? {},
  };
}
