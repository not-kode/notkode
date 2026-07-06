import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { CircuitBg } from '@/components/ui/circuit-bg';

interface FinalCTAProps {
  locale: string;
  /** Where the CTA points. In-page anchor like "#diagnostico" or path with anchor like "/pt/sistemas-ia#diagnostico". */
  ctaHref?: string;
}

export async function FinalCTA({ locale, ctaHref }: FinalCTAProps) {
  const t = await getTranslations({ locale, namespace: 'Home' });
  // Default: take the user to the services grid on the home (locale-aware)
  const href = ctaHref ?? `/${locale}#servicos`;

  return (
    <section className="relative overflow-hidden bg-surface-elevated border-t border-black/[0.07] py-28 lg:py-36">
      <CircuitBg variant="section" />

      <div className="container mx-auto px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 bg-black/[0.04] border border-black/[0.08]"
            >
              <span className="status-dot" />
              <span className="font-mono text-[11px] text-text-secondary tracking-tight">
                <span className="text-text-dim">{'❯ '}</span>
                {t('finalCtaEyebrow')}
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-5 text-text-primary">
              {t('finalCtaTitle')}
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
              {t('finalCtaDesc')}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <a
              href={href}
              data-cta="final-cta"
              className="font-bricolage group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold text-base uppercase tracking-wide hover:-translate-y-0.5 hover:shadow-glow hover:bg-primary/90 transition-all duration-300"
            >
              {t('finalCtaButton')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
