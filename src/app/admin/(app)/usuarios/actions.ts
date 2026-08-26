'use server';

import { revalidatePath } from 'next/cache';
import { usuarioAtual } from '@/lib/admin-usuario';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SENHA_MINIMA } from './regras';

type Resultado = { ok: boolean; erro?: string };

function texto(fd: FormData, campo: string, max = 160): string {
  return String(fd.get(campo) ?? '').trim().slice(0, max);
}

function papelValido(v: string): 'admin' | 'equipe' {
  return v === 'equipe' ? 'equipe' : 'admin';
}

/** E-mail duplicado sobe do índice único como 23505; o resto é erro de verdade. */
function traduzir(erro: { code?: string; message: string }): string {
  return erro.code === '23505' ? 'Já existe alguém com esse e-mail.' : erro.message;
}

export async function criarUsuario(fd: FormData): Promise<Resultado> {
  const nome = texto(fd, 'nome', 120);
  const email = texto(fd, 'email').toLowerCase();
  const senha = String(fd.get('senha') ?? '');

  if (!nome) return { ok: false, erro: 'Falta o nome.' };
  if (!email.includes('@')) return { ok: false, erro: 'E-mail inválido.' };
  if (senha.length < SENHA_MINIMA) {
    return { ok: false, erro: `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.` };
  }

  // Quem cifra a senha é o banco (bcrypt/pgcrypto). É a mesma função que a
  // Camila chama no SQL quando prefere criar o acesso por lá.
  const { error } = await getSupabaseAdmin().rpc('admin_criar_usuario', {
    p_nome: nome,
    p_email: email,
    p_senha: senha,
    p_papel: papelValido(texto(fd, 'papel', 20)),
  });
  if (error) return { ok: false, erro: traduzir(error) };

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function atualizarUsuario(fd: FormData): Promise<Resultado> {
  const id = texto(fd, 'id', 40);
  const nome = texto(fd, 'nome', 120);
  const email = texto(fd, 'email').toLowerCase();
  if (!id || !nome || !email.includes('@')) return { ok: false, erro: 'Nome e e-mail são obrigatórios.' };

  const { error } = await getSupabaseAdmin()
    .from('admin_users')
    .update({ nome, email, papel: papelValido(texto(fd, 'papel', 20)) })
    .eq('id', id);
  if (error) return { ok: false, erro: traduzir(error) };

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function definirSenha(fd: FormData): Promise<Resultado> {
  const id = texto(fd, 'id', 40);
  const senha = String(fd.get('senha') ?? '');
  if (!id) return { ok: false, erro: 'Usuário não encontrado.' };
  if (senha.length < SENHA_MINIMA) {
    return { ok: false, erro: `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.` };
  }

  const { error } = await getSupabaseAdmin().rpc('admin_trocar_senha', { p_quem: id, p_senha: senha });
  if (error) return { ok: false, erro: error.message };

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function alternarAtivo(fd: FormData): Promise<Resultado> {
  const id = texto(fd, 'id', 40);
  const ativo = String(fd.get('ativo') ?? '') === '1';
  if (!id) return { ok: false, erro: 'Usuário não encontrado.' };

  // Desativar a si mesmo derrubaria o próprio acesso na próxima página.
  const eu = await usuarioAtual();
  if (!ativo && eu?.id === id) return { ok: false, erro: 'Você não pode desativar o seu próprio acesso.' };

  const { error } = await getSupabaseAdmin().from('admin_users').update({ ativo }).eq('id', id);
  if (error) return { ok: false, erro: error.message };

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function excluirUsuario(fd: FormData): Promise<Resultado> {
  const id = texto(fd, 'id', 40);
  if (!id) return { ok: false, erro: 'Usuário não encontrado.' };

  const eu = await usuarioAtual();
  if (eu?.id === id) return { ok: false, erro: 'Você não pode excluir o seu próprio acesso.' };

  const { error } = await getSupabaseAdmin().from('admin_users').delete().eq('id', id);
  if (error) return { ok: false, erro: error.message };

  revalidatePath('/admin/usuarios');
  return { ok: true };
}
