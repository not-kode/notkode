'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, Building2, CheckSquare, GitBranch, Inbox, LayoutDashboard, Wallet,
  type LucideIcon,
} from 'lucide-react';

const NAV: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: '/admin',            label: 'Visão geral',   icon: LayoutDashboard, exact: true },
  { href: '/admin/pipeline',   label: 'Pipeline',      icon: GitBranch },
  { href: '/admin/leads',      label: 'Leads',         icon: Inbox },
  { href: '/admin/financeiro', label: 'Financeiro',    icon: Wallet },
  { href: '/admin/clientes',   label: 'Clientes',      icon: Building2 },
  { href: '/admin/entregas',   label: 'Tasks',         icon: CheckSquare },
  { href: '/admin/sessoes',    label: 'Comportamento', icon: Activity },
];

/**
 * Balãozinho com o nome do item, ao lado do ícone. Aparece no hover do elemento
 * pai (que precisa ser `group relative`).
 */
export function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-[0_4px_12px_rgba(16,24,40,0.18)] transition-opacity duration-100 group-hover:opacity-100"
    >
      {children}
    </span>
  );
}

/** compacto: só os ícones, para o quadro de tarefas ganhar a largura da tela. */
export function AdminNav({ compacto = false }: { compacto?: boolean }) {
  const path = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/');
        const Icone = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'group relative flex items-center rounded-md text-sm transition-colors',
              compacto ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2',
              active
                ? 'bg-primary/10 font-semibold text-primary'
                : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary',
            ].join(' ')}
          >
            <Icone
              className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
            />
            {!compacto && item.label}
            {/* Menu fechado: o nome aparece ao lado no hover. Ícone sozinho não
                se reconhece, e abrir o menu só para conferir é pior. */}
            {compacto && <Tooltip>{item.label}</Tooltip>}
          </Link>
        );
      })}
    </nav>
  );
}
