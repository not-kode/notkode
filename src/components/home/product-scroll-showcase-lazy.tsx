'use client';

import dynamic from 'next/dynamic';

export const ProductScrollShowcaseLazy = dynamic(
  () =>
    import('./product-scroll-showcase').then((m) => ({
      default: m.ProductScrollShowcase,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="font-mono text-[11px] text-text-dim">carregando…</span>
      </div>
    ),
  },
);
