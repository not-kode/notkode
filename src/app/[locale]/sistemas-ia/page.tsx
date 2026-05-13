import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';
import { SistemasHeroBackground } from '@/components/sistemas-ia/sistemas-hero-background';
import { HeroSystemPreview } from '@/components/sistemas-ia/hero-system-preview';
import { ToolChaos } from '@/components/sistemas-ia/tool-chaos';
import { ROICalculator } from '@/components/sistemas-ia/roi-calculator';
import { ProductShowcase } from '@/components/home/product-showcase';
import { FeaturedCase } from '@/components/home/featured-case';
import { Process } from '@/components/home/process';
import { FAQ } from '@/components/sistemas-ia/faq';
import { FinalCTA } from '@/components/home/final-cta';

export default async function SistemasIAPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <SistemasHeroBackground />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, transparent 40%, rgba(255,254,242,0.75) 62%, rgba(255,254,242,0.97) 85%)',
          }}
        />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-32 lg:pt-40 pb-24 lg:pb-32">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">

            {/* LEFT — text + CTAs */}
            <Reveal className="min-w-0">
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] break-words mb-6">
                <span className="block mb-1">Sua operação inteira,</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">num sistema com IA.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-xl mb-8">
                Pare de adaptar seu negócio para ferramentas genéricas. A Notkode constrói um sistema feito para você — com IA que aprende com o seu negócio e código que é seu para sempre.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contato"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  {t('heroPrimaryCta')}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href="#o-que-voce-vai-ter"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  Ver como funciona
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>

            {/* RIGHT — system preview mockup */}
            <Reveal delay={200} direction="left" distance={32}>
              <HeroSystemPreview />
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── Tool Chaos — o problema ── */}
      <ToolChaos />

      {/* ── ROI Calculator ── */}
      <ROICalculator />

      {/* ── O que você vai ter — features ── */}
      <span id="o-que-voce-vai-ter" />
      <ProductShowcase
        locale={locale}
        eyebrow="O que você vai ter"
        titleMain="Tudo que você precisa,"
        titleAccent="num lugar só."
        markerNumber="03"
      />

      {/* ── Case em destaque ── */}
      <FeaturedCase locale={locale} />

      {/* ── Como trabalhamos ── */}
      <Process locale={locale} reverse />

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── CTA final ── */}
      <FinalCTA locale={locale} />
    </>
  );
}
