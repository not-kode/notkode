'use client';

import { type ReactNode } from 'react';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

export type PainItem = {
  /** Optional small label (e.g. "R$ 1.200/mês", "3h/dia", "Etapa 4"). */
  metric?: string;
  /** The pain in the customer's own words. Short, declarative. */
  text: string;
  /** Optional icon — pass a lucide icon component or any ReactNode. */
  icon?: ReactNode;
};

interface PainNamingBlockProps {
  /** Small mono eyebrow above the headline. */
  eyebrow?: string;
  /** Main headline — must speak the customer's pain in their language. */
  title: ReactNode;
  /** One supporting paragraph. Keep under 220 chars. */
  intro?: ReactNode;
  /** The pains, listed. 3–6 items works best. */
  pains: PainItem[];
  /** Visual treatment of each pain item. */
  variant?: 'list' | 'grid' | 'tally';
  /** Surface background. */
  surface?: 'base' | 'elevated';
  /** Slot rendered after the pains — e.g. a "calculator" or running total. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Beat 2 of the conversion journey — "naming the pain".
 * Layout is intentionally opinionated only in structure; each page styles
 * its content (icons, footer) to keep visual variety across the site.
 */
export function PainNamingBlock({
  eyebrow,
  title,
  intro,
  pains,
  variant = 'list',
  surface = 'base',
  footer,
  className,
}: PainNamingBlockProps) {
  return (
    <section className={cn(surface === 'elevated' ? 'bg-surface-elevated' : 'bg-surface-base', className)}>
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <div className="max-w-3xl mx-auto mb-12 lg:mb-16 text-center">
            {eyebrow && (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim mb-4">
                {eyebrow}
              </p>
            )}
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
              {title}
            </h2>
            {intro && (
              <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-text-secondary max-w-2xl mx-auto">
                {intro}
              </p>
            )}
          </div>
        </Reveal>

        {variant === 'list' && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 max-w-5xl mx-auto">
            {pains.map((p, i) => (
              <Reveal key={i} delay={i * 70}>
                <li
                  className="group relative h-full flex items-start gap-4 p-5 lg:p-6 rounded-2xl border border-black/[0.07] bg-white/40 hover:border-primary/30 hover:bg-white/60 transition-colors duration-200"
                >
                  {p.icon && (
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {p.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] lg:text-[16px] text-text-primary leading-snug">
                      {p.text}
                    </p>
                    {p.metric && (
                      <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim">
                        <span className="w-1 h-1 rounded-full bg-primary/60" />
                        {p.metric}
                      </p>
                    )}
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        )}

        {variant === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pains.map((p, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="h-full p-6 rounded-xl border border-black/[0.07] bg-white/40">
                  {p.icon && <div className="mb-4 text-primary/80">{p.icon}</div>}
                  {p.metric && (
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim mb-2">
                      {p.metric}
                    </p>
                  )}
                  <p className="text-[15px] text-text-primary leading-snug">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {variant === 'tally' && (
          <div className="max-w-2xl mx-auto">
            {pains.map((p, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="flex items-baseline justify-between gap-6 py-4 border-b border-dashed border-black/[0.12] last:border-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-text-dim">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-[15px] lg:text-[16px] text-text-primary">{p.text}</p>
                  </div>
                  {p.metric && (
                    <span className="font-mono text-[13px] text-text-secondary whitespace-nowrap">
                      {p.metric}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {footer && (
          <Reveal delay={pains.length * 50 + 100}>
            <div className="mt-10 lg:mt-14 flex justify-center">{footer}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
