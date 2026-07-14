'use client';

import { useEffect } from 'react';
import { getSessionId } from '@/components/analytics';

// Gravação de sessão first-party com rrweb. Roda SÓ no site público (montado no
// layout [locale]). Inputs mascarados (não grava texto digitado). À prova de
// falhas: dynamic import, qualquer erro é engolido e nunca afeta a navegação.

type RRWebEvent = unknown;

export function SessionRecorder() {
  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    let buffer: RRWebEvent[] = [];
    const sid = getSessionId();

    const flush = (useBeacon = false) => {
      if (buffer.length === 0) return;
      const chunk = buffer;
      buffer = [];
      const body = JSON.stringify({ session_id: sid, page: location.pathname, events: chunk });
      try {
        if (useBeacon && navigator.sendBeacon?.('/api/rec', new Blob([body], { type: 'application/json' }))) return;
        void fetch('/api/rec', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      } catch {
        /* noop */
      }
    };

    (async () => {
      try {
        const rrweb = await import('rrweb');
        if (cancelled) return;
        stop = rrweb.record({
          emit(event) {
            buffer.push(event);
          },
          maskAllInputs: true, // não grava o que é digitado
          recordCanvas: false,
          collectFonts: false,
          sampling: { mousemove: 50, scroll: 150 },
        });
        timer = setInterval(() => flush(false), 5000);
      } catch {
        /* rrweb indisponível → sem gravação, site segue normal */
      }
    })();

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };
    const onPageHide = () => flush(true);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      flush(true);
      try {
        stop?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  return null;
}
