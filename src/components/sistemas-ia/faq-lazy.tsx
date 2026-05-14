'use client';

import dynamic from 'next/dynamic';

export const FAQLazy = dynamic(
  () => import('./faq').then((m) => ({ default: m.FAQ })),
  {
    ssr: false,
    loading: () => (
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32 flex items-center justify-center">
          <span className="font-mono text-[11px] text-text-dim">carregando FAQ…</span>
        </div>
      </section>
    ),
  },
);
