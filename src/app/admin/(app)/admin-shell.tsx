'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { AdminNav } from './admin-nav';
import { logoutAction } from '../actions';

// Shell do /admin: a navegação mora na barra de cima, não numa coluna lateral.
// As telas do CRM são largas (o quadro de tarefas, o pipeline, as tabelas do
// financeiro) e uma faixa de 15rem à esquerda saía justamente da largura que
// elas precisam — a barra horizontal ocupa a altura, que sobra.
//
// No celular a mesma navegação abre num painel embaixo da barra.
export function AdminShell({
  children,
  usuario,
}: {
  children: React.ReactNode;
  /** Quem está logado. null quando a sessão veio da senha geral. */
  usuario: { nome: string } | null;
}) {
  const [menu, setMenu] = useState(false);
  const path = usePathname();
  const naConta = path.startsWith('/admin/usuarios');

  return (
    <div className="flex min-h-screen flex-col bg-white text-text-primary">
      <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-white">
        <div className="flex items-center gap-4 px-4 py-2.5 md:px-6">
          <Link href="/admin" className="shrink-0" title="Dashboard">
            <Logo variant="horizontal-dark" width={104} />
          </Link>

          <div className="hidden min-w-0 flex-1 overflow-x-auto md:block">
            <AdminNav />
          </div>

          {/* Conta e saída ficam na ponta oposta da navegação: é ajuste de
              acesso, não uma área do CRM. */}
          <div className="ml-auto hidden items-center gap-1 md:flex">
            <Link
              href="/admin/usuarios"
              title={usuario ? `${usuario.nome} · acessos` : 'Acessos'}
              className={`flex max-w-[12rem] items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                naConta
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary'
              }`}
            >
              <UserRound className={`h-4 w-4 shrink-0 ${naConta ? 'text-primary' : 'text-text-muted'}`} />
              <span className="truncate">{usuario?.nome ?? 'Acesso geral'}</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-black/[0.04] hover:text-danger"
              >
                Sair
              </button>
            </form>
          </div>

          <button
            type="button"
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenu((v) => !v)}
            className="ml-auto rounded-md p-1.5 text-text-secondary transition-colors hover:bg-black/[0.05] hover:text-text-primary md:hidden"
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menu && (
          <div className="border-t border-black/[0.07] px-4 py-2 md:hidden">
            <AdminNav empilhado onNavegar={() => setMenu(false)} />
            <div className="mt-2 flex items-center justify-between border-t border-black/[0.07] pt-2">
              <Link
                href="/admin/usuarios"
                onClick={() => setMenu(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary"
              >
                <UserRound className="h-4 w-4 shrink-0 text-text-muted" />
                {usuario?.nome ?? 'Acesso geral'}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-black/[0.04] hover:text-danger"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1 overflow-x-auto bg-white px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
