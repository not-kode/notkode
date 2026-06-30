'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/pipeline', label: 'Pipeline' },
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/financeiro', label: 'Financeiro' },
];

export function AdminNav() {
  const path = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = path === item.href || path.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-primary/10 font-semibold text-primary'
                : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary',
            ].join(' ')}
          >
            <span
              className={[
                'h-1.5 w-1.5 rounded-full transition-colors',
                active ? 'bg-primary' : 'bg-text-muted/30 group-hover:bg-text-muted/60',
              ].join(' ')}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
