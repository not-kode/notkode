'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

export type StackSlide = {
  id: string;
  name: string;
  /** Display URL in the address bar */
  url: string;
  /** Local image path */
  image: string;
  /** Optional segment / tag label */
  segment?: string;
};

/**
 * Diagonal stack of browser-frame mockups.
 * - Front card is the active one (full size, full opacity).
 * - Behind cards are translated/rotated and dimmed.
 * - Click a back card → it animates to the front.
 * - On mobile (<sm), only the active card renders; dots below control switching.
 */
export function StackedShowcase({ slides }: { slides: StackSlide[] }) {
  const [active, setActive] = useState(0);
  const total = slides.length;

  // Offset (in stack order): 0 = front, 1 = mid, 2 = back, etc.
  const offsetOf = (i: number) => (i - active + total) % total;

  // Visual per stack position. Capped at 3 layers visible (others hidden).
  const stackStyle = (offset: number) => {
    if (offset === 0) {
      return {
        transform: 'translate(0, 0) rotate(0deg) scale(1)',
        opacity: 1,
        zIndex: 30,
        filter: 'none',
      } as const;
    }
    if (offset === 1) {
      return {
        transform: 'translate(7%, 5%) rotate(3deg) scale(0.94)',
        opacity: 0.55,
        zIndex: 20,
        filter: 'blur(0.5px)',
      } as const;
    }
    if (offset === 2) {
      return {
        transform: 'translate(-7%, 8%) rotate(-3deg) scale(0.88)',
        opacity: 0.32,
        zIndex: 10,
        filter: 'blur(1px)',
      } as const;
    }
    // Hidden beyond third layer
    return {
      transform: 'translate(0, 14%) scale(0.82)',
      opacity: 0,
      zIndex: 0,
      filter: 'blur(2px)',
      pointerEvents: 'none' as const,
    };
  };

  const current = slides[active];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Soft glow */}
      <div
        className="absolute -inset-x-6 -inset-y-12 rounded-[48px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59,130,246,0.10) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Mobile single-card */}
      <div className="relative sm:hidden">
        <BrowserCard slide={current} />
      </div>

      {/* Desktop / tablet stack */}
      <div className="relative hidden sm:block aspect-[16/10]">
        {slides.map((s, i) => {
          const offset = offsetOf(i);
          const style = stackStyle(offset);
          const isActive = offset === 0;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => !isActive && setActive(i)}
              aria-label={isActive ? `${s.name} (em destaque)` : `Trazer ${s.name} pra frente`}
              className={`absolute inset-0 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive ? 'cursor-default' : 'cursor-pointer'
              }`}
              style={style}
            >
              <BrowserCard slide={s} />
            </button>
          );
        })}
      </div>

      {/* Slide info + dots */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-bricolage text-[15px] font-semibold text-text-primary tracking-tight">
            {current.name}
          </p>
          <p className="font-mono text-[11px] text-text-dim tracking-wide">
            {current.url}
            {current.segment ? ` · ${current.segment}` : ''}
          </p>
        </div>
        {total > 1 && (
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver ${s.name}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === active ? 26 : 7,
                  background: i === active ? '#3B82F6' : 'rgba(25,25,24,0.20)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BrowserCard({ slide }: { slide: StackSlide }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden h-full"
      style={{
        background: '#F8FAFC',
        border: '1px solid rgba(25,25,24,0.10)',
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.10), 0 30px 80px -30px rgba(59,130,246,0.20)',
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b"
        style={{
          background: 'linear-gradient(to bottom, #F1F5F9, #E2E8F0)',
          borderColor: 'rgba(25,25,24,0.08)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#FF5F57]" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.10)' }} />
          <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#FEBC2E]" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.10)' }} />
          <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#28C840]" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.10)' }} />
        </div>
        <a
          href={`https://${slide.url}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-[11px] font-mono text-slate-500 truncate hover:bg-slate-50 transition-colors group"
          style={{ background: '#FFFFFF', border: '1px solid rgba(25,25,24,0.06)' }}
        >
          <span className="text-emerald-600">🔒</span>
          <span className="truncate">{slide.url}</span>
          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors ml-auto shrink-0" strokeWidth={2} />
        </a>
      </div>

      {/* Screenshot */}
      <div className="relative aspect-[16/10] overflow-hidden bg-white">
        <Image
          src={slide.image}
          alt={slide.name}
          fill
          sizes="(max-width: 640px) 100vw, 800px"
          className="object-cover object-top"
          priority
        />
      </div>
    </div>
  );
}
