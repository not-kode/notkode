'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, Building2, CheckSquare, GitBranch, Inbox, LayoutDashboard, Wallet,
  type LucideIcon,
} from 'lucide-react';

// Rótulos em inglês: são nomes curtos de ferramenta, iguais aos que a gente já
// usa falando ("o pipeline", "os leads"). O conteúdo das telas segue em português.
const NAV: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: '/admin',            label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pipeline',   label: 'Pipeline',  icon: GitBranch },
  { href: '/admin/leads',      label: 'Leads',     icon: Inbox },
  { href: '/admin/financeiro', label: 'Finance',   icon: Wallet },
  { href: '/admin/clientes',   label: 'Clients',   icon: Building2 },
  { href: '/admin/entregas',   label: 'Tasks',     icon: CheckSquare },
  { href: '/admin/sessoes',    label: 'Analytics', icon: Activity },
];

/**
 * A navegação do CRM. Em pé (`empilhado`) só no menu do celular; no computador
 * ela é uma fileira na barra de cima, para as telas largas — o quadro de
 * tarefas, o pipeline — ficarem com a largura inteira da janela.
 */
export function AdminNav({ empilhado = false, onNavegar }: {
  empilhado?: boolean;
  onNavegar?: () => void;
}) {
  const path = usePathname();

  return (
    <nav className={empilhado ? 'flex flex-col gap-0.5' : 'flex items-center gap-0.5'}>
      {NAV.map((item) => {
        const active = item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/');
        const Icone = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavegar}
            className={[
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              empilhado ? '' : 'whitespace-nowrap',
              active
                ? 'bg-primary/10 font-semibold text-primary'
                : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary',
            ].join(' ')}
          >
            <Icone
              className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-text-muted'}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
