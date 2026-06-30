'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  verifyPassword,
} from '@/lib/admin-auth';

type LoginState = { error: string | null };

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === 'string' ? next : '';
  // Evita open-redirect: só caminhos internos do /admin.
  return n.startsWith('/admin') && !n.startsWith('/admin/login') ? n : '/admin/leads';
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '');
  const ok = await verifyPassword(password);
  if (!ok) return { error: 'Senha incorreta.' };

  const token = await createSessionToken(Date.now());
  if (!token) return { error: 'Login indisponível: ADMIN_PASSWORD não configurada no servidor.' };

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  redirect(safeNext(formData.get('next')));
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/admin/login');
}
