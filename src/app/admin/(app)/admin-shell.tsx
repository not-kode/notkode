'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen, UserRound } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { AdminNav, Tooltip } from './admin-nav';
import { logoutAction } from '../actions';

const PREF_COMPACTO = 'notkode.admin.menu-compacto';

// Shell do /admin com sidebar responsiva: fixa no desktop, off-canvas no mobile
// (abre por um botão hambúrguer na barra superior). No desktop ela encolhe para
// uma faixa de ícones: telas largas como o quadro de tarefas precisam da largura
// inteira, e obrigar a rolar para o lado para ver as colunas é o pior dos mundos.
export function AdminShell({
  children,
  usuario,
}: {
  children: React.ReactNode;
  /** Quem está logado. null quando a sessão veio da senha geral. */
  usuario: { nome: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [compacto, setCompacto] = useState(false);

  // Preferência de trabalho, não do dado: fica no navegador.
  useEffect(() => {
    setCompacto(localStorage.getItem(PREF_COMPACTO) === '1');
  }, []);
  const alternar = () => {
    setCompacto((c) => {
      localStorage.setItem(PREF_COMPACTO, c ? '0' : '1');
      return !c;
    });
  };

  return (
    <div className="flex min-h-screen bg-white text-text-primary">
      {/* Backdrop (só mobile, quando aberto) */}
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-black/[0.07] bg-[#F4F5F7] py-6 transition-[transform,width] duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${compacto ? 'px-2 md:w-16' : 'px-4'}`}
      >
        <div className={compacto ? 'flex justify-center' : 'px-2'}>
          {compacto ? (
            <Logo variant="vertical-dark" width={34} />
          ) : (
            <>
              <Logo variant="horizontal-dark" width={118} />
              <p className="eyebrow mt-3">
                <span className="status-dot" />
                CRM interno
              </p>
            </>
          )}
        </div>

        {!compacto && <p className="eyebrow mt-8 mb-2 px-3 text-[10px]">Navegação</p>}
        {/* Fecha o menu ao navegar (mobile) */}
        <div onClick={() => setOpen(false)} className={compacto ? 'mt-6' : ''}>
          <AdminNav compacto={compacto} />
        </div>

        {/* Encolher/expandir: só faz sentido no desktop, onde a sidebar é fixa. */}
        <button
          type="button"
          onClick={alternar}
          title={compacto ? 'Expandir menu' : 'Encolher menu'}
          aria-label={compacto ? 'Expandir menu' : 'Encolher menu'}
          className={`group relative mt-auto hidden items-center gap-2.5 rounded-md py-2 text-sm text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary md:flex ${
            compacto ? 'justify-center px-2' : 'px-3'
          }`}
        >
          {compacto ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!compacto && 'Encolher menu'}
          {compacto && <Tooltip>Expandir menu</Tooltip>}
        </button>

        <div className={`border-t border-black/[0.07] pt-3 md:mt-2 ${compacto ? '' : 'mt-auto md:mt-2'}`}>
          {/* Quem está logado, e por onde se mexe nos acessos. Fica aqui embaixo
              de propósito: é ajuste de conta, não uma área do CRM. */}
          <Link
            href="/admin/usuarios"
            onClick={() => setOpen(false)}
            title={usuario ? `${usuario.nome} · acessos` : 'Acessos'}
            className={`group relative flex items-center rounded-md py-2 text-sm text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary ${
              compacto ? 'justify-center px-2' : 'gap-2.5 px-3'
            }`}
          >
            <UserRound className="h-4 w-4 shrink-0 text-text-muted group-hover:text-text-secondary" />
            {!compacto && <span className="truncate">{usuario?.nome ?? 'Acesso geral'}</span>}
            {compacto && <Tooltip>{usuario?.nome ?? 'Acesso geral'}</Tooltip>}
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair"
              className={`group relative flex w-full items-center rounded-md py-2 text-left text-sm text-text-muted transition-colors hover:bg-black/[0.04] hover:text-danger ${
                compacto ? 'justify-center px-2' : 'gap-2.5 px-3'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted/30" />
              {!compacto && 'Sair'}
              {compacto && <Tooltip>Sair</Tooltip>}
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior mobile com hambúrguer */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.07] bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-black/[0.05] hover:text-text-primary"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo variant="horizontal-dark" width={96} />
        </header>

        <main className="min-w-0 flex-1 overflow-x-auto bg-white px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
