'use client';

import { useState } from 'react';

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-2.5 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
      title={url}
    >
      {copied ? '✓ copiado' : '⧉ copiar link'}
    </button>
  );
}
