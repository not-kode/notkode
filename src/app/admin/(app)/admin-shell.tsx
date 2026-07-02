'use client';

import { useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { AdminNav } from './admin-nav';
import { logoutAction } from '../actions';

// Shell do /admin com sidebar responsiva: fixa no desktop, off-canvas no mobile
// (abre por um botão hambúrguer na barra superior).
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

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
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-black/[0.07] bg-[#F4F5F7] px-4 py-6 transition-transform duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-2">
          <Logo variant="horizontal-dark" width={118} />
          <p className="eyebrow mt-3">
            <span className="status-dot" />
            CRM interno
          </p>
        </div>

        <p className="eyebrow mt-8 mb-2 px-3 text-[10px]">Navegação</p>
        {/* Fecha o menu ao navegar (mobile) */}
        <div onClick={() => setOpen(false)}>
          <AdminNav />
        </div>

        <form action={logoutAction} className="mt-auto border-t border-black/[0.07] pt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-black/[0.04] hover:text-danger"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted/30" />
            Sair
          </button>
        </form>
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
