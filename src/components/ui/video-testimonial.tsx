'use client';

import Link from 'next/link';
import { ArrowUpRight, PlayCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

interface VideoTestimonialProps {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** Vimeo or YouTube embed URL (e.g. https://player.vimeo.com/video/XXXXXX, https://www.youtube.com/embed/XXXXXX). */
  embedUrl?: string;
  /** Fallback poster image if embedUrl is empty. */
  posterSrc?: string;
  author: string;
  role: string;
  caseHref?: string;
  caseLabel?: string;
  surface?: 'base' | 'elevated';
  className?: string;
}

/**
 * Beat 5 (video flavor) — proof via a customer's own voice on camera.
 * 16:9 responsive frame, centered layout, attribution under the video.
 */
export function VideoTestimonial({
  eyebrow,
  title,
  intro,
  embedUrl,
  posterSrc,
  author,
  role,
  caseHref,
  caseLabel = 'Ver case completo',
  surface = 'elevated',
  className,
}: VideoTestimonialProps) {
  return (
    <section className={cn(surface === 'elevated' ? 'bg-surface-elevated' : 'bg-surface-base', className)}>
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
            {eyebrow && (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim mb-4">
                {eyebrow}
              </p>
            )}
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em]">
              {title}
            </h2>
            {intro && (
              <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-text-secondary max-w-2xl mx-auto">
                {intro}
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-black/5 aspect-video shadow-sm">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={`Depoimento de ${author}`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    backgroundImage: posterSrc ? `url(${posterSrc})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="flex flex-col items-center gap-3 text-text-secondary">
                    <PlayCircle className="w-14 h-14 text-primary/70" strokeWidth={1.4} />
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                      Vídeo em breve
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-[14px] font-semibold text-text-primary">{author}</p>
              <p className="text-[13px] text-text-secondary">{role}</p>
              {caseHref && (
                <Link
                  href={caseHref}
                  className="inline-flex items-center gap-1.5 mt-4 text-[13px] font-semibold text-primary hover:gap-2.5 transition-all duration-200"
                >
                  {caseLabel}
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
