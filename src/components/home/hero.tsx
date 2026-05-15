import { getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { HeroBackground } from '@/components/home/hero-background';

export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  return (
    <section className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-32 lg:pt-44 pb-28 lg:pb-36">
        <div className="grid lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] gap-14 lg:gap-20 items-center">

          {/* LEFT — headline */}
          <Reveal className="min-w-0">
            <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.15] lg:leading-[1.12] tracking-[-0.025em] break-words text-text-primary">
              <span className="lg:block">
                <span className="font-bricolage font-normal">Tecnologia</span>{' '}
                de ponta,
              </span>{' '}
              <span className="lg:block">
                entregue na{' '}
                <span className="font-bricolage font-normal">velocidade</span>
              </span>{' '}
              <span className="lg:block">
                que <span className="font-bricolage font-normal">sua empresa</span>{' '}
                precisa.
              </span>
            </h1>
          </Reveal>

          {/* RIGHT — descrição + CTAs */}
          <div className="flex flex-col gap-8 min-w-0">
            <Reveal delay={120}>
              <p className="text-[17px] text-text-secondary leading-[1.65]">
                {t('heroDescription')}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#servicos"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  {t('heroPrimaryCta')}
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="#cases"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  {t('heroSecondaryCta')}
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
