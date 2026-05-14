'use client';

import dynamic from 'next/dynamic';

export const BrandbookPreviewLazy = dynamic(
  () =>
    import('./brandbook-preview').then((m) => ({
      default: m.BrandbookPreview,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl border border-black/[0.08] flex items-center justify-center"
        style={{ background: 'hsl(55 100% 97%)', aspectRatio: '4 / 3' }}
      >
        <span className="font-mono text-[11px] text-text-dim">carregando preview…</span>
      </div>
    ),
  },
);
