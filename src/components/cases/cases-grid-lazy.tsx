'use client';

import dynamic from 'next/dynamic';

export const CasesGridLazy = dynamic(
  () =>
    import('./cases-grid').then((m) => ({
      default: m.CasesGrid,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] flex items-center justify-center">
        <span className="font-mono text-[11px] text-text-dim">carregando cases…</span>
      </div>
    ),
  },
);
