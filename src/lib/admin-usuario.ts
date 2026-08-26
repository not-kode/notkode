import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SESSAO_GERAL, SESSION_COOKIE, lerSessao } from '@/lib/admin-auth';

// Quem está logado no /admin, do lado do servidor. Só para server components e
// server actions: puxa o service-role e nunca pode ir para o cliente.

export type AdminUsuario = {
  id: string;
  nome: string;
  email: string;
  papel: 'admin' | 'equipe';
  ativo: boolean;
  ultimoAcesso: string | null;
  criadoEm: string;
};

const CAMPOS = 'id, nome, email, papel, ativo, ultimo_acesso, criado_em';

type Linha = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  ultimo_acesso: string | null;
  criado_em: string;
};

function montar(l: Linha): AdminUsuario {
  return {
    id: l.id,
    nome: l.nome,
    email: l.email,
    papel: l.papel === 'equipe' ? 'equipe' : 'admin',
    ativo: l.ativo,
    ultimoAcesso: l.ultimo_acesso,
    criadoEm: l.criado_em,
  };
}

/**
 * A pessoa logada, ou null quando a sessão veio da senha geral (ADMIN_PASSWORD)
 * ou o usuário foi desativado desde o login. Quem chama já passou pelo
 * middleware: null aqui significa "logado, mas sem nome", não "sem acesso".
 */
export async function usuarioAtual(): Promise<AdminUsuario | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sessao = await lerSessao(token, Date.now());
  if (!sessao || sessao.uid === SESSAO_GERAL) return null;

  const { data } = await getSupabaseAdmin()
    .from('admin_users')
    .select(CAMPOS)
    .eq('id', sessao.uid)
    .maybeSingle();

  const l = data as Linha | null;
  return l && l.ativo ? montar(l) : null;
}

/** Nome de quem está logado, para carimbar tarefa e comentário. */
export async function nomeDoUsuarioAtual(): Promise<string | null> {
  return (await usuarioAtual())?.nome ?? null;
}

export async function listarUsuarios(): Promise<AdminUsuario[]> {
  const { data } = await getSupabaseAdmin()
    .from('admin_users')
    .select(CAMPOS)
    .order('nome');
  return ((data ?? []) as Linha[]).map(montar);
}
