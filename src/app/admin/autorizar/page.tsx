// A tela em que a pessoa libera o terminal dela a acessar o CRM.
//
// É para onde o cliente MCP manda o navegador. Fica dentro do /admin de
// propósito: quem ainda não entrou é levado ao login pelo middleware e volta
// para cá com o pedido intacto. Quem já está logado só confirma, e o cliente
// recebe o código de autorização no endereço de volta dele.

import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/admin-usuario';
import { URL_DO_MCP, acharCliente } from '@/lib/oauth';
import { AutorizarForm } from './autorizar-form';

export const dynamic = 'force-dynamic';

type Params = Promise<Record<string, string | string[] | undefined>>;

const um = (v: string | string[] | undefined): string | null =>
  (Array.isArray(v) ? v[0] : v)?.trim() || null;

/** Devolve o erro pelo endereço de volta, que é onde o cliente está esperando. */
function voltarComErro(redirectUri: string, state: string | null, erro: string, descricao: string): never {
  const url = new URL(redirectUri);
  url.searchParams.set('error', erro);
  url.searchParams.set('error_description', descricao);
  if (state) url.searchParams.set('state', state);
  redirect(url.toString());
}

function Recusa({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-5">
      <div className="w-full max-w-sm rounded-xl border border-border-subtle/20 bg-surface-elevated p-8 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">notkode · crm</p>
        <h1 className="mt-1 text-xl font-semibold text-text-primary">{titulo}</h1>
        <p className="mt-2 text-sm text-text-muted">{texto}</p>
      </div>
    </main>
  );
}

export default async function AutorizarPage({ searchParams }: { searchParams: Params }) {
  const p = await searchParams;
  const clientId = um(p.client_id);
  const redirectUri = um(p.redirect_uri);
  const state = um(p.state);
  const desafio = um(p.code_challenge);
  const metodo = um(p.code_challenge_method);
  const recurso = um(p.resource);

  // Sem cliente ou sem endereço de volta confiável, o erro morre aqui: mandar a
  // pessoa para um endereço não conferido é exatamente o ataque que se evita.
  if (!clientId || !redirectUri) {
    return <Recusa titulo="Pedido incompleto" texto="Faltou o cliente ou o endereço de retorno. Tente de novo pelo seu terminal." />;
  }

  const cliente = await acharCliente(clientId);
  if (!cliente) {
    return <Recusa titulo="Aplicativo desconhecido" texto="Este cliente não está cadastrado. Tente de novo pelo seu terminal." />;
  }
  if (!cliente.redirectUris.includes(redirectUri)) {
    return <Recusa titulo="Endereço de retorno não confere" texto="O endereço para onde este pedido quer voltar não é um dos cadastrados." />;
  }

  // Daqui para baixo o endereço de volta é de confiança: o erro pode ir por ele.
  if (um(p.response_type) !== 'code') {
    voltarComErro(redirectUri, state, 'unsupported_response_type', 'Só "code" é aceito.');
  }
  if (!desafio || metodo !== 'S256') {
    voltarComErro(redirectUri, state, 'invalid_request', 'É obrigatório o PKCE com code_challenge_method=S256.');
  }
  if (recurso && recurso.replace(/\/$/, '') !== URL_DO_MCP) {
    voltarComErro(redirectUri, state, 'invalid_target', 'Este servidor só emite acesso para o MCP da Notkode.');
  }

  // Quem entrou pela senha geral não tem nome no sistema, e o token precisa de
  // dono para carimbar o que for criado pelo terminal.
  const eu = await usuarioAtual();
  if (!eu) {
    return (
      <Recusa
        titulo="Entre com o seu acesso"
        texto="Você está na senha geral do time, que não tem nome atrelado. Saia e entre com o seu e-mail e senha para liberar o terminal no seu nome."
      />
    );
  }

  return (
    <AutorizarForm
      nomeDoCliente={cliente.nome ?? 'Um aplicativo'}
      nomeDaPessoa={eu.nome}
      pedido={{ clientId, redirectUri, state, desafio: desafio!, recurso }}
    />
  );
}
