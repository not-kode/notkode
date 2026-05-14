'use client';

import dynamic from 'next/dynamic';

export const TimelineHorizontalLazy = dynamic(
  () =>
    import('./timeline-horizontal').then((m) => ({
      default: m.TimelineHorizontal,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <span className="font-mono text-[11px] text-text-dim">carregando timeline…</span>
      </div>
    ),
  },
);
