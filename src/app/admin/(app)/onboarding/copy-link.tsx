'use client';

import { useState } from 'react';

/**
 * Copia o link do briefing para mandar ao cliente. Com `destaque`, vira botão
 * cheio: é a ação principal enquanto o briefing está aguardando resposta, e
 * antes ela só existia escondida dentro do briefing aberto.
 */
export function CopyLink({ url, destaque = false }: { url: string; destaque?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        // A linha inteira costuma ser clicável: copiar não pode abrir o briefing.
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
      className={[
        'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-xs transition-colors',
        destaque && !copied
          ? 'bg-primary text-white hover:bg-primary/90'
          : copied
            ? 'border border-success/40 text-success'
            : 'border border-border-subtle text-text-secondary hover:border-primary hover:text-primary',
      ].join(' ')}
      title={url}
    >
      {copied ? '✓ link copiado' : '⧉ copiar link do cliente'}
    </button>
  );
}
