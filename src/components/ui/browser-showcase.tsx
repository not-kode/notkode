'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCw, ArrowLeft, ArrowRight as ArrowRightIcon, ExternalLink } from 'lucide-react';

const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 900;

export type ShowcaseSlide = {
  id: string;
  name: string;
  /** Display URL in the address bar */
  url: string;
  /** Full URL to embed (with protocol). If omitted, falls back to https://<url> */
  embedUrl?: string;
  /** If true, render the embedded site in an iframe. If false/undefined, render fallback. */
  live?: boolean;
  /** Fallback gradient colors when live is false */
  from?: string;
  to?: string;
  /** Optional subtitle / tag below the name in fallback */
  tag?: string;
};

export function BrowserShowcase({
  slides,
  /** Auto-cycle in ms. Set 0 to disable (good when most slides are live iframes). */
  intervalMs = 0,
}: {
  slides: ShowcaseSlide[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const slideAreaRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Track which slides have ever been mounted — so loaded iframes stay cached when user clicks back
  const [mountedIframes, setMountedIframes] = useState<Set<number>>(() => new Set([0]));
  // Add to mountedIframes when idx changes
  useEffect(() => {
    setMountedIframes((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, [idx]);

  // Observe slide area width → compute exact scale so the 1440px-wide iframe fits
  useEffect(() => {
    const el = slideAreaRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / IFRAME_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (slides.length < 2 || intervalMs <= 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  const current = slides[idx];
  const liveHref = current.embedUrl ?? `https://${current.url}`;

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Layered soft glow behind */}
      <div
        className="absolute -inset-x-6 -inset-y-10 rounded-[48px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59,130,246,0.14) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Browser window */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#F8FAFC',
          border: '1px solid rgba(25,25,24,0.10)',
          boxShadow:
            '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.10), 0 30px 80px -30px rgba(59,130,246,0.25)',
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{
            background: 'linear-gradient(to bottom, #F1F5F9, #E2E8F0)',
            borderColor: 'rgba(25,25,24,0.08)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.10)' }} />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.10)' }} />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.10)' }} />
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.2} />
            <ArrowRightIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
            <RotateCw className="w-3 h-3 ml-0.5" strokeWidth={2.2} />
          </div>
          <a
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono text-slate-500 truncate hover:bg-slate-50 transition-colors group"
            style={{ background: '#FFFFFF', border: '1px solid rgba(25,25,24,0.06)' }}
          >
            <span className="text-emerald-600">🔒</span>
            <span className="truncate">{current.url}</span>
            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors ml-auto shrink-0" strokeWidth={2} />
          </a>
        </div>

        {/* Slide area — scale is computed in JS so the 1440px iframe always fits exactly */}
        <div
          ref={slideAreaRef}
          className="relative aspect-[16/10] overflow-hidden bg-white"
        >
          {slides.map((s, i) => {
            const href = s.embedUrl ?? `https://${s.url}`;
            const shouldMountIframe = s.live && mountedIframes.has(i);
            return (
              <div
                key={s.id}
                className="absolute inset-0 overflow-hidden transition-opacity duration-500 ease-out"
                style={{
                  opacity: i === idx ? 1 : 0,
                  pointerEvents: i === idx ? 'auto' : 'none',
                }}
                aria-hidden={i !== idx}
              >
                {shouldMountIframe ? (
                  <iframe
                    src={href}
                    title={s.name}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    referrerPolicy="no-referrer-when-downgrade"
                    /* Renders at 1440×900 desktop viewport; JS-computed scale fits the container exactly */
                    style={{
                      width: `${IFRAME_WIDTH}px`,
                      height: `${IFRAME_HEIGHT}px`,
                      border: 0,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  />
                ) : (
                  <SlideFallback name={s.name} tag={s.tag} from={s.from} to={s.to} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide info + dots */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-bricolage text-[15px] font-semibold text-text-primary tracking-tight">
            {current.name}
          </p>
          <p className="font-mono text-[11px] text-text-dim tracking-wide">{current.url}</p>
        </div>
        {slides.length > 1 && (
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Ver ${s.name}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? 26 : 7,
                  background: i === idx ? '#3B82F6' : 'rgba(25,25,24,0.18)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SlideFallback({
  name, tag, from = '#3B82F6', to = '#1D4ED8',
}: {
  name: string;
  tag?: string;
  from?: string;
  to?: string;
}) {
  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.10) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow */}
      <div
        className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full"
        style={{ background: 'rgba(255,255,255,0.18)', filter: 'blur(60px)' }}
      />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
        <p className="font-bricolage text-white text-[1.75rem] lg:text-[2.25rem] font-bold tracking-tight leading-tight">
          {name}
        </p>
        {tag && (
          <p className="font-mono text-white/75 text-[11px] uppercase tracking-[0.2em] mt-3">
            {tag}
          </p>
        )}
      </div>
    </div>
  );
}
