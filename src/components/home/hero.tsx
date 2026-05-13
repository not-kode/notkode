import { getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
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
            <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.12] tracking-[-0.025em] break-words">
              <span className="block mb-1">Tecnologia feita para</span>
              <span className="block">
                <span className="font-bricolage text-gradient">o seu negócio.</span>
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
                <Link
                  href="/contato"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  {t('heroPrimaryCta')}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/sistemas-ia"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  {t('heroSecondaryCta')}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
