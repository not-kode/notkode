'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionMarker } from '@/components/ui/section-marker';

const TIMELINE = [
  {
    year: '2020',
    label: 'Fundação',
    description: 'Nasce a Notkode em São Paulo. Foco em design digital e desenvolvimento web.',
  },
  {
    year: '2021',
    label: 'No-Code',
    description: 'Descoberta do movimento No-Code — território ainda inexplorado no Brasil.',
  },
  {
    year: '2022',
    label: 'IA antes do hype',
    description: 'Acesso antecipado ao ChatGPT. Aposta em IA aplicada a negócios.',
  },
  {
    year: '2023',
    label: 'Pivô IA + Tech',
    description: 'Avanço de 100% em tecnologia e IA. Arsenal completo de ferramentas, integrações e modelos.',
    highlight: true,
  },
  {
    year: '2023',
    label: 'Internacional',
    description: 'Primeiros projetos para clientes nos EUA, Canadá e Inglaterra.',
  },
  {
    year: '2024',
    label: 'Era dos Agentes',
    description: 'Consolidação em desenvolvimento pautado por IA e agentes inteligentes.',
  },
  {
    year: '2025',
    label: 'Sistemas com IA',
    description: 'Lançamento do produto âncora: sistemas internos personalizados com IA nativa.',
  },
  {
    year: '2026',
    label: 'Hoje',
    description: '50+ projetos entregues. 4 países atendidos. Tecnologia sob medida com IA dentro.',
  },
];

export function TimelineHorizontal() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const track   = trackRef.current;
      if (!section || !track) return;

      const rect    = section.getBoundingClientRect();
      const total   = section.offsetHeight - window.innerHeight;
      // 0 when section top hits viewport top, 1 when bottom hits viewport bottom
      const raw     = -rect.top / total;
      const clamped = Math.max(0, Math.min(1, raw));
      setProgress(clamped);

      // translate the horizontal track
      const trackWidth   = track.scrollWidth;
      const viewportW    = window.innerWidth;
      const maxTranslate = trackWidth - viewportW;
      if (maxTranslate > 0) {
        track.style.transform = `translateX(-${(clamped * maxTranslate).toFixed(1)}px)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface-base"
      style={{ height: `${TIMELINE.length * 55}vh` }}
    >
      {/* Sticky stage */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div className="container mx-auto px-5 lg:px-8 mb-12 lg:mb-16">
          <SectionMarker number="02" label="Nossa história" />
          <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 max-w-2xl">
            Cinco anos construindo{' '}
            <span className="font-bricolage">tecnologia sob medida.</span>
          </h2>
        </div>

        {/* Horizontal track */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex items-start gap-6 lg:gap-8 px-5 lg:px-8 will-change-transform"
            style={{ transition: 'transform 50ms linear' }}
          >
            {TIMELINE.map((item) => (
              <div
                key={`${item.year}-${item.label}`}
                className="shrink-0 w-[320px] lg:w-[360px]"
              >
                {/* Dot row with connecting line */}
                <div className="relative flex items-center mb-5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 shrink-0 relative z-10"
                    style={{
                      background: item.highlight ? '#3B82F6' : 'hsl(55 100% 97%)',
                      borderColor: item.highlight ? '#3B82F6' : 'rgba(59,130,246,0.55)',
                      boxShadow: item.highlight
                        ? '0 0 0 4px rgba(59,130,246,0.18)'
                        : '0 0 0 3px rgba(59,130,246,0.08)',
                    }}
                  />
                  {/* Horizontal line from this dot extending right */}
                  <div className="flex-1 h-px bg-black/[0.08]" />
                  <span className="font-mono text-[12px] font-bold text-primary tracking-wider ml-3">
                    {item.year}
                  </span>
                </div>

                {/* Card */}
                <div
                  className="rounded-2xl p-6 lg:p-7 transition-all duration-300"
                  style={{
                    background: item.highlight ? 'rgba(59,130,246,0.05)' : 'hsl(55 100% 97%)',
                    border: item.highlight
                      ? '1px solid rgba(59,130,246,0.25)'
                      : '1px solid rgba(25,25,24,0.08)',
                  }}
                >
                  <h3 className="text-[18px] lg:text-[20px] font-semibold tracking-tight text-text-primary mb-3">
                    {item.label}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                  {item.highlight && (
                    <div className="mt-4 pt-3 border-t border-primary/15">
                      <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
                        marco decisivo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="container mx-auto px-5 lg:px-8 mt-10 lg:mt-12">
          <div className="flex items-center gap-4 max-w-md">
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest shrink-0">
              {String(Math.round(progress * (TIMELINE.length - 1)) + 1).padStart(2, '0')} / {String(TIMELINE.length).padStart(2, '0')}
            </span>
            <div className="flex-1 h-px bg-black/[0.08] relative">
              <div
                className="absolute top-0 left-0 h-px bg-primary transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-text-dim hidden lg:inline">
              continue rolando ↓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
