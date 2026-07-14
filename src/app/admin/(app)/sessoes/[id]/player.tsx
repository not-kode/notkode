'use client';

import { useEffect, useRef } from 'react';
import 'rrweb-player/dist/style.css';

// Player de gravação (rrweb-player). Carregado dinamicamente (só no cliente,
// dentro do /admin). Recebe os eventos já concatenados na ordem da sessão.
export function SessionPlayer({ events }: { events: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target || events.length < 2) return;

    let destroyed = false;
    let player: { $destroy?: () => void } | undefined;

    (async () => {
      try {
        const mod = await import('rrweb-player');
        if (destroyed) return;
        const RRWebPlayer = mod.default;
        target.innerHTML = '';
        player = new RRWebPlayer({
          target,
          props: {
            events: events as never,
            autoPlay: false,
            showController: true,
            mouseTail: false,
            width: Math.min(target.clientWidth || 900, 1040),
            height: 520,
          },
        }) as unknown as { $destroy?: () => void };
      } catch {
        target.innerHTML =
          '<p style="padding:1rem;font-size:13px;color:#888">Não foi possível carregar o player desta gravação.</p>';
      }
    })();

    return () => {
      destroyed = true;
      try {
        player?.$destroy?.();
      } catch {
        /* noop */
      }
      target.innerHTML = '';
    };
  }, [events]);

  return <div ref={ref} className="overflow-hidden rounded-lg border border-black/[0.08] bg-white" />;
}
