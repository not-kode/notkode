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
        // No unload usamos sendBeacon (fetch não completa após a página fechar).
        // sendBeacon/keepalive têm limite de corpo de ~64 KB — por isso NÃO usamos
        // keepalive no flush periódico: o primeiro chunk carrega o FullSnapshot do
        // DOM inteiro (>64 KB) e seria rejeitado em silêncio, quebrando o player.
        if (useBeacon && navigator.sendBeacon?.('/api/rec', new Blob([body], { type: 'application/json' }))) return;
        void fetch('/api/rec', { method: 'POST', body, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
      } catch {
        /* noop */
      }
    };

    const startRecording = async () => {
      try {
        const rrweb = await import('rrweb');
        if (cancelled) return;
        let first = true;
        stop = rrweb.record({
          emit(event) {
            buffer.push(event);
            // Persiste o FullSnapshot inicial o quanto antes: se a sessão for
            // curta, garante que o player tenha o DOM base para reproduzir.
            if (first) {
              first = false;
              setTimeout(() => flush(false), 800);
            }
          },
          maskAllInputs: true, // não grava o que é digitado
          recordCanvas: false,
          collectFonts: false,
          sampling: { mousemove: 50, scroll: 150 },
          checkoutEveryNms: 2 * 60 * 1000, // reemite FullSnapshot a cada 2 min (retomada/SPA)
        });
        timer = setInterval(() => flush(false), 5000);
      } catch {
        /* rrweb indisponível → sem gravação, site segue normal */
      }
    };

    // Não competir com o carregamento/hidratação: só começa a gravar quando a
    // página terminou de carregar E a thread principal estiver ociosa.
    const scheduleStart = () => {
      const w = window as typeof window & { requestIdleCallback?: (cb: () => void) => void };
      if (w.requestIdleCallback) w.requestIdleCallback(() => startRecording());
      else setTimeout(startRecording, 1500);
    };
    if (document.readyState === 'complete') scheduleStart();
    else window.addEventListener('load', scheduleStart, { once: true });

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
