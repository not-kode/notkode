import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowDown } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SistemasHeroBackground } from '@/components/sistemas-ia/sistemas-hero-background';
import { ProdutoAppPreview } from '@/components/produtos-digitais/produto-app-preview';
import { HeroMobilePhone } from '@/components/sistemas-ia/hero-mobile-phone';
import { ChaosToOrderSection } from '@/components/sistemas-ia/chaos-to-order-section';
import { SistemaSobMedida } from '@/components/sistemas-ia/sistema-sob-medida';
import { ProductShowcase } from '@/components/home/product-showcase';
import { FeaturedCase } from '@/components/home/featured-case';
import { Process } from '@/components/home/process';
import { FAQLazy as FAQ } from '@/components/sistemas-ia/faq-lazy';
import { SistemasQualificationForm } from '@/components/sistemas-ia/sistemas-qualification-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SistemasIA' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function SistemasIAPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'SistemasIA' });

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[calc(100svh-4rem)] flex items-center">
        <SistemasHeroBackground />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, transparent 40%, rgba(255,254,242,0.75) 62%, rgba(255,254,242,0.97) 85%)',
          }}
        />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 py-10 w-full">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">

            {/* LEFT — text + CTAs */}
            <Reveal className="min-w-0">
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] break-words mb-6">
                <span className="block mb-1">{t('heroTitleLine1')}</span>
                <span className="block">
                  {t('heroTitleLine2')} <span className="font-bricolage">{t('heroTitleAccent')}</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-xl mb-8">
                {t('heroDesc')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#diagnostico"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  {t('heroCtaPrimary')}
                  <ArrowDown className="w-4 h-4" />
                </a>
              </div>
            </Reveal>

            {/* RIGHT — system preview mockup (desktop) + mobile phone-only */}
            <Reveal delay={200} direction="left" distance={32} className="hidden lg:block">
              <ProdutoAppPreview />
            </Reveal>
            <div className="lg:hidden mx-auto mt-2">
              <HeroMobilePhone />
            </div>

          </div>
        </div>
      </section>

      {/* ── Beats 2 + 3: dor + virada (caos→ordem animado) ── */}
      <ChaosToOrderSection />

      {/* ── Argumento central: sob medida + IA embarcada ── */}
      <SistemaSobMedida />

      {/* ── Beat 4: solução tangível ── */}
      <span id="o-que-voce-vai-ter" />
      <ProductShowcase
        locale={locale}
        eyebrow={t('showcaseEyebrow')}
        titleMain={t('showcaseTitleMain')}
        titleAccent={t('showcaseTitleAccent')}
        markerNumber="03"
      />

      {/* ── Beat 4 (continuação): como entregamos ── */}
      <Process locale={locale} reverse />

      {/* ── Beat 5: prova social específica do ICP ── */}
      <FeaturedCase
        locale={locale}
        overrides={{
          segment: t('caseSegment'),
          problem: t('caseProblem'),
          solution: t('caseSolution'),
          metrics: [
            { value: t('caseMetric1Value'), label: t('caseMetric1Label') },
            { value: t('caseMetric2Value'), label: t('caseMetric2Label') },
            { value: t('caseMetric3Value'), label: t('caseMetric3Label') },
          ],
        }}
      />

      {/* ── Beat 6: objeções ── */}
      <FAQ />

      {/* ── Form de interesse ── */}
      <section id="diagnostico" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">{t('formTitleLine1')}</span>
                <span className="block font-bricolage">{t('formTitleAccent')}</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] text-text-secondary leading-relaxed">
                {t('formDesc')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="max-w-2xl mx-auto">
              <SistemasQualificationForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
