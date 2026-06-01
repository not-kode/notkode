import type React from 'react';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { HeroBackground } from '@/components/home/hero-background';
import { TypewriterLine } from '@/components/home/typewriter-line';

export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  // `p` = destaque na fonte especial (Parabole), sem cor
  const tags = {
    p: (chunks: React.ReactNode) => <span className="font-bricolage font-normal">{chunks}</span>,
  };

  return (
    <section className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-32 lg:pt-44 pb-28 lg:pb-36">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

          {/* headline */}
          <Reveal className="min-w-0">
            <h1 className="text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-semibold leading-[1.12] lg:leading-[1.08] tracking-[-0.03em] break-words text-text-primary">
              <span className="lg:block">{t.rich('homeHeroLine1', tags)}</span>{' '}
              <span className="lg:block">{t.rich('homeHeroLine2', tags)}</span>
              <span className="lg:block lg:mt-6 mt-2 inline-block">
                <TypewriterLine
                  className="font-medium text-[1.375rem] md:text-[2.375rem] lg:text-[3.125rem]"
                  segments={[
                    { text: t('homeHeroLine3a') },
                    { text: t('homeHeroLine3b'), className: 'font-bricolage font-normal text-primary' },
                  ]}
                />
              </span>
            </h1>
          </Reveal>

          {/* CTA */}
          <Reveal delay={240} className="mt-12">
            <a
              href="#servicos"
              className="font-bricolage inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
            >
              {t('heroPrimaryCta')}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
