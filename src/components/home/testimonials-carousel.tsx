'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export function TestimonialsCarousel({ items, titleMain, titleAccent }: { items: Testimonial[]; titleMain: string; titleAccent: string }) {
  const [active, setActive] = useState(0);
  const total = items.length;

  const prev = () => setActive((i) => (i - 1 + total) % total);
  const next = () => setActive((i) => (i + 1) % total);

  const t = items[active];

  return (
    <div className="flex flex-col h-full">
      {/* Header row: title + arrows */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em]">
          {titleMain}{' '}
          <span className="font-bricolage">{titleAccent}</span>
        </h2>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <span className="font-mono text-[11px] text-text-dim mr-1">
            {String(active + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
          <button
            onClick={prev}
            aria-label="Depoimento anterior"
            className="w-8 h-8 rounded-full border border-black/[0.12] flex items-center justify-center hover:bg-black/[0.04] hover:border-black/[0.2] transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={next}
            aria-label="Próximo depoimento"
            className="w-8 h-8 rounded-full border border-black/[0.12] flex items-center justify-center hover:bg-black/[0.04] hover:border-black/[0.2] transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Quote */}
      <div className="flex-1 flex flex-col justify-between">
        <div
          key={active}
          style={{ animation: 'testimonial-in 0.35s ease both' }}
        >
          <p className="text-[17px] lg:text-[19px] text-text-primary leading-[1.65] tracking-tight mb-8">
            &ldquo;{t.quote}&rdquo;
          </p>

          <footer className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0"
            >
              <span className="text-white font-bold text-[13px]">
                {t.author.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div>
              <div className="font-semibold text-[14px] text-text-primary">{t.author}</div>
              <div className="font-mono text-[11px] text-text-muted">{t.role}</div>
            </div>
          </footer>
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 mt-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ir para depoimento ${i + 1}`}
              className="focus:outline-none transition-all duration-300"
            >
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: active === i ? '20px' : '6px',
                  background: active === i ? '#3B82F6' : 'rgba(0,0,0,0.15)',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
