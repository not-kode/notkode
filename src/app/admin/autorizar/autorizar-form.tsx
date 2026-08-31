'use client';

import { useState, useTransition } from 'react';
import { autorizar, recusar } from './actions';

type Pedido = {
  clientId: string;
  redirectUri: string;
  state: string | null;
  desafio: string;
  recurso: string | null;
};

/** O host do endereço de volta, que é o que a pessoa consegue reconhecer ("localhost"). */
function ondeVolta(uri: string): string {
  try {
    return new URL(uri).host;
  } catch {
    return uri;
  }
}

export function AutorizarForm({
  nomeDoCliente, nomeDaPessoa, pedido,
}: {
  nomeDoCliente: string;
  nomeDaPessoa: string;
  pedido: Pedido;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar(acao: (fd: FormData) => Promise<{ erro: string } | void>) {
    const fd = new FormData();
    fd.set('client_id', pedido.clientId);
    fd.set('redirect_uri', pedido.redirectUri);
    fd.set('code_challenge', pedido.desafio);
    if (pedido.state) fd.set('state', pedido.state);
    if (pedido.recurso) fd.set('resource', pedido.recurso);

    setErro(null);
    iniciar(async () => {
      const r = await acao(fd);
      if (r?.erro) setErro(r.erro);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-5">
      <div className="w-full max-w-sm rounded-xl border border-border-subtle/20 bg-surface-elevated p-8 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">notkode · crm</p>
        <h1 className="mt-1 text-xl font-semibold text-text-primary">Liberar o terminal?</h1>

        <p className="mt-3 text-sm text-text-muted">
          <span className="text-text-primary">{nomeDoCliente}</span> está pedindo acesso ao sistema no nome de{' '}
          <span className="text-text-primary">{nomeDaPessoa}</span>. Liberando, esse aplicativo passa a ler e mexer no
          CRM inteiro: tarefas, projetos, contratos e financeiro. O que ele criar sai no seu nome.
        </p>

        <p className="mt-2 font-mono text-[11px] text-text-muted">volta para {ondeVolta(pedido.redirectUri)}</p>

        {erro && <p className="mt-3 text-sm text-danger">{erro}</p>}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            disabled={pendente}
            onClick={() => enviar(autorizar)}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:opacity-60"
          >
            {pendente ? 'Liberando…' : 'Liberar acesso'}
          </button>
          <button
            type="button"
            disabled={pendente}
            onClick={() => enviar(recusar)}
            className="text-sm text-text-muted transition hover:text-text-primary disabled:opacity-60"
          >
            Agora não
          </button>
        </div>

        <p className="mt-6 text-[11px] text-text-muted">
          Depois dá para cortar este acesso em Acessos, no menu do CRM, sem mexer na sua senha.
        </p>
      </div>
    </main>
  );
}
