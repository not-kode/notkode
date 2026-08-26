'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSAO_GERAL,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  verifyPassword,
} from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type LoginState = { error: string | null };

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === 'string' ? next : '';
  // Evita open-redirect: só caminhos internos do /admin.
  return n.startsWith('/admin') && !n.startsWith('/admin/login') ? n : '/admin/leads';
}

async function abrirSessao(uid: string, next: FormDataEntryValue | null): Promise<LoginState> {
  const token = await createSessionToken(Date.now(), uid);
  if (!token) return { error: 'Login indisponível: ADMIN_PASSWORD não configurada no servidor.' };

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  redirect(safeNext(next));
}

/**
 * Entra com e-mail e senha da pessoa. Sem e-mail, cai na senha geral
 * (ADMIN_PASSWORD): é a porta dos fundos para uma tabela de usuários vazia ou
 * quebrada não trancar todo mundo do lado de fora.
 */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const senha = String(formData.get('password') ?? '');
  const next = formData.get('next');

  if (!email) {
    if (!(await verifyPassword(senha))) return { error: 'E-mail ou senha incorretos.' };
    return abrirSessao(SESSAO_GERAL, next);
  }

  const supabase = getSupabaseAdmin();
  // A senha é conferida dentro do banco (bcrypt/pgcrypto): o hash não sai de lá.
  const { data } = await supabase.rpc('admin_login', { p_email: email, p_senha: senha });

  const usuario = (data as { id: string; ativo: boolean }[] | null)?.[0] ?? null;
  if (!usuario) return { error: 'E-mail ou senha incorretos.' };
  if (!usuario.ativo) return { error: 'Este acesso foi desativado. Fale com a Camila.' };

  await supabase
    .from('admin_users')
    .update({ ultimo_acesso: new Date().toISOString() })
    .eq('id', usuario.id);

  return abrirSessao(usuario.id, next);
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/admin/login');
}
