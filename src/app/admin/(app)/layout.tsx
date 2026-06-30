import { Logo } from '@/components/brand/logo';
import { logoutAction } from '../actions';
import { AdminNav } from './admin-nav';

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-base text-text-primary">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-black/[0.07] bg-surface-elevated/60 px-4 py-6">
        <div className="px-2">
          <Logo variant="horizontal-dark" width={118} />
          <p className="eyebrow mt-3">
            <span className="status-dot" />
            CRM interno
          </p>
        </div>

        <p className="eyebrow mt-8 mb-2 px-3 text-[10px]">Navegação</p>
        <AdminNav />

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

      <main className="flex-1 overflow-x-auto bg-surface-base px-8 py-8">{children}</main>
    </div>
  );
}
