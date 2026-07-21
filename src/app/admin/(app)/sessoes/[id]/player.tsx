'use client';

import { useEffect, useRef, useState } from 'react';
import type { Replayer } from 'rrweb';
import 'rrweb/dist/style.css';

// Player próprio em cima do Replayer do rrweb. O pacote rrweb-player (2.1.0)
// foi publicado com o build quebrado no npm (a variável replayer nunca é
// instanciada em nenhum bundle do dist), então a moldura montava em branco.
// Aqui a reprodução e os controles são nossos.

const SPEEDS = [1, 2, 4, 8] as const;

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function SessionPlayer({ events }: { events: unknown[] }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<Replayer | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || events.length < 2) return;

    let destroyed = false;
    let clock: ReturnType<typeof setInterval> | undefined;

    (async () => {
      try {
        const rrweb = await import('rrweb');
        if (destroyed) return;
        frame.innerHTML = '';
        const rep = new rrweb.Replayer(events as never, {
          root: frame,
          mouseTail: false,
          skipInactive: true,
          speed: 1,
        });
        replayerRef.current = rep;
        setTotal(rep.getMetaData().totalTime);
        rep.on('finish', () => setPlaying(false));

        // Escala a tela gravada (viewport do visitante) pra caber no quadro.
        const scale = () => {
          const iw = rep.iframe.offsetWidth || 1024;
          const ih = rep.iframe.offsetHeight || 576;
          const s = Math.min(frame.clientWidth / iw, frame.clientHeight / ih, 1);
          rep.wrapper.style.transform = `scale(${s}) translate(-50%, -50%)`;
        };
        rep.on('resize', scale);
        scale();
        window.addEventListener('resize', scale);

        // Relógio do progresso (getCurrentTime respeita pausa e velocidade).
        clock = setInterval(() => {
          const r = replayerRef.current;
          if (!r) return;
          const t = r.getMetaData().totalTime;
          setCurrent(Math.min(r.getCurrentTime(), t));
        }, 100);
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      destroyed = true;
      if (clock) clearInterval(clock);
      try {
        replayerRef.current?.destroy();
      } catch {
        /* noop */
      }
      replayerRef.current = null;
      frame.innerHTML = '';
    };
  }, [events]);

  const toggle = () => {
    const rep = replayerRef.current;
    if (!rep) return;
    if (playing) {
      rep.pause();
      setPlaying(false);
    } else {
      // Terminou? Recomeça do zero.
      rep.play(current >= total ? 0 : current);
      setPlaying(true);
    }
  };

  const seek = (t: number) => {
    const rep = replayerRef.current;
    if (!rep) return;
    setCurrent(t);
    if (playing) rep.play(t);
    else rep.pause(t);
  };

  const changeSpeed = (s: (typeof SPEEDS)[number]) => {
    const rep = replayerRef.current;
    if (!rep) return;
    setSpeed(s);
    rep.setConfig({ speed: s });
    // Reaplica o estado atual pra velocidade valer imediatamente.
    if (playing) rep.play(current);
  };

  if (failed) {
    return (
      <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
        Não foi possível carregar o player desta gravação.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-white">
      {/* Posicionamento do DOM que o rrweb injeta (iframe da reprodução). */}
      <style>{`
        .nk-rec-frame { position: relative; overflow: hidden; height: 520px; background: #fff; }
        .nk-rec-frame .replayer-wrapper { position: absolute; left: 50%; top: 50%; transform-origin: top left; float: none; }
        .nk-rec-frame iframe { border: none; background: #fff; pointer-events: none; }
      `}</style>

      <div ref={frameRef} className="nk-rec-frame w-full" />

      {/* Controles */}
      <div className="flex items-center gap-3 border-t border-black/[0.06] bg-white px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90"
        >
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4h4v16H7zM13 4h4v16h-4z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4l14 8-14 8z" />
            </svg>
          )}
        </button>

        <span className="shrink-0 font-label text-[11px] tabular-nums text-text-secondary">
          {fmt(current)} / {fmt(total)}
        </span>

        <input
          type="range"
          min={0}
          max={Math.max(total, 1)}
          value={Math.min(current, total)}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer accent-primary"
          aria-label="Posição da gravação"
        />

        <div className="flex shrink-0 items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeSpeed(s)}
              className={`rounded px-1.5 py-0.5 font-label text-[10px] transition-colors ${
                speed === s ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
