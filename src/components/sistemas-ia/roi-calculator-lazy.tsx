'use client';

import dynamic from 'next/dynamic';

export const ROICalculatorLazy = dynamic(
  () => import('./roi-calculator').then((m) => ({ default: m.ROICalculator })),
  {
    ssr: false,
    loading: () => (
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32 flex items-center justify-center">
          <span className="font-mono text-[11px] text-text-dim">carregando calculadora…</span>
        </div>
      </section>
    ),
  },
);
