import Link from 'next/link';
import { logoutAction } from '../actions';

const NAV = [
  { href: '/admin/leads', label: 'Leads', enabled: true },
  { href: '/admin/pipeline', label: 'Pipeline', enabled: true },
  { href: '/admin/clientes', label: 'Clientes', enabled: false },
  { href: '/admin/financeiro', label: 'Financeiro', enabled: true },
];

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-base text-text-primary">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border-subtle/15 bg-surface-elevated px-4 py-6">
        <div className="px-2">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">notkode</p>
          <p className="text-sm font-semibold">CRM interno</p>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) =>
            item.enabled ? (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-base hover:text-text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-text-muted/60"
              >
                {item.label}
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted/50">em breve</span>
              </span>
            )
          )}
        </nav>

        <form action={logoutAction} className="mt-auto">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-text-muted transition hover:bg-surface-base hover:text-danger"
          >
            Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-x-auto px-8 py-8">{children}</main>
    </div>
  );
}
