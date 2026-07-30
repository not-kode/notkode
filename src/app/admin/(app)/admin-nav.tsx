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
            title={compacto ? item.label : undefined}
            className={[
              'group flex items-center rounded-md text-sm transition-colors',
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
          </Link>
        );
      })}
    </nav>
  );
}
