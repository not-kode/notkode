'use server';

import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/admin-usuario';
import { URL_DO_MCP, acharCliente, criarCodigo } from '@/lib/oauth';

/**
 * A pessoa clicou em liberar. Confere tudo outra vez no servidor (o formulário
 * vem do navegador, e o que vem do navegador não decide acesso), cria o código
 * de vida curta e devolve o navegador para o cliente que pediu.
 */
export async function autorizar(fd: FormData): Promise<{ erro: string } | void> {
  const campo = (nome: string) => String(fd.get(nome) ?? '').trim() || null;

  const clientId = campo('client_id');
  const redirectUri = campo('redirect_uri');
  const desafio = campo('code_challenge');
  const state = campo('state');
  const recurso = campo('resource');

  if (!clientId || !redirectUri || !desafio) return { erro: 'Pedido incompleto.' };

  const eu = await usuarioAtual();
  if (!eu) return { erro: 'Entre com o seu e-mail e senha para liberar o terminal.' };

  const cliente = await acharCliente(clientId);
  if (!cliente || !cliente.redirectUris.includes(redirectUri)) return { erro: 'Pedido inválido.' };
  if (recurso && recurso.replace(/\/$/, '') !== URL_DO_MCP) return { erro: 'Pedido inválido.' };

  const code = await criarCodigo({
    clientId,
    usuarioId: eu.id,
    redirectUri,
    codeChallenge: desafio,
    resource: recurso,
  });

  const url = new URL(redirectUri);
  url.searchParams.set('code', code);
  if (state) url.searchParams.set('state', state);
  redirect(url.toString());
}

/** Recusou: o cliente precisa saber, senão fica esperando para sempre. */
export async function recusar(fd: FormData): Promise<void> {
  const redirectUri = String(fd.get('redirect_uri') ?? '');
  const state = String(fd.get('state') ?? '');
  const clientId = String(fd.get('client_id') ?? '');

  const cliente = clientId ? await acharCliente(clientId) : null;
  if (!cliente?.redirectUris.includes(redirectUri)) redirect('/admin/usuarios');

  const url = new URL(redirectUri);
  url.searchParams.set('error', 'access_denied');
  url.searchParams.set('error_description', 'A pessoa não liberou o acesso.');
  if (state) url.searchParams.set('state', state);
  redirect(url.toString());
}
