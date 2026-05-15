'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

export type ICPMetric = { value: string; label: string };

interface ICPTestimonialProps {
  /** Optional mono eyebrow above the quote. */
  eyebrow?: string;
  /** The quote itself — the voice of someone matching this page's ICP. */
  quote: string;
  /** Person attribution. */
  author: string;
  /** Role + company. */
  role: string;
  /** Optional company logo path (in /public). */
  logoSrc?: string;
  /** Up to 3 outcome metrics that anchor the quote. */
  metrics?: ICPMetric[];
  /** Link to the related case study. */
  caseHref?: string;
  caseLabel?: string;
  surface?: 'base' | 'elevated';
  className?: string;
}

/**
 * Beat 5 of the conversion journey — proof from someone matching the page's ICP.
 * Not the generic carousel. One voice, specific to the page, with outcome metrics.
 */
export function ICPTestimonial({
  eyebrow,
  quote,
  author,
  role,
  logoSrc,
  metrics,
  caseHref,
  caseLabel = 'Ver case completo',
  surface = 'elevated',
  className,
}: ICPTestimonialProps) {
  return (
    <section className={cn(surface === 'elevated' ? 'bg-surface-elevated' : 'bg-surface-base', className)}>
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-start max-w-6xl">
          <Reveal>
            <div>
              {eyebrow && (
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim mb-5">
                  {eyebrow}
                </p>
              )}
              <blockquote className="text-[1.5rem] md:text-[1.85rem] lg:text-[2.1rem] font-semibold leading-[1.18] tracking-[-0.015em] text-text-primary">
                <span className="font-bricolage text-primary/70 mr-1">&ldquo;</span>
                {quote}
                <span className="font-bricolage text-primary/70 ml-1">&rdquo;</span>
              </blockquote>

              <div className="mt-8 flex items-center gap-4">
                {logoSrc && (
                  <div className="shrink-0 w-12 h-12 rounded-full bg-white border border-black/[0.06] overflow-hidden flex items-center justify-center">
                    <Image src={logoSrc} alt={author} width={48} height={48} className="object-contain" />
                  </div>
                )}
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">{author}</p>
                  <p className="text-[13px] text-text-secondary">{role}</p>
                </div>
              </div>

              {caseHref && (
                <Link
                  href={caseHref}
                  className="inline-flex items-center gap-1.5 mt-8 text-[13px] font-semibold text-primary hover:gap-2.5 transition-all duration-200"
                >
                  {caseLabel}
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                </Link>
              )}
            </div>
          </Reveal>

          {metrics && metrics.length > 0 && (
            <Reveal delay={120}>
              <div className="grid grid-cols-1 divide-y divide-black/[0.07] border-y border-black/[0.07] lg:border lg:border-black/[0.07] lg:rounded-2xl lg:divide-y lg:divide-black/[0.07] bg-white/40">
                {metrics.slice(0, 3).map((m, i) => (
                  <div key={i} className="px-6 py-6">
                    <p className="font-bricolage text-[2rem] lg:text-[2.4rem] leading-none tracking-[-0.02em] text-text-primary">
                      {m.value}
                    </p>
                    <p className="mt-2 text-[13px] text-text-secondary leading-snug">{m.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
