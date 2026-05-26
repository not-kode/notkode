import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';
import { CasesGridLazy as CasesGrid } from '@/components/cases/cases-grid-lazy';
import { CasesHeroBackground } from '@/components/cases/cases-hero-background';
import { TrustBand } from '@/components/home/trust-band';
import { Testimonials } from '@/components/home/testimonials';
import { FinalCTA } from '@/components/home/final-cta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Cases' });
  return { title: t('metaTitle'), description: t('metaDesc') };
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-bricolage text-[1.5rem] lg:text-[1.75rem] font-bold text-text-primary leading-none mb-1">{value}</div>
      <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Divider() {
  return <span className="hidden sm:inline-block w-px h-8 bg-black/[0.08]" aria-hidden />;
}

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Cases' });

  return (
    <>
      <section className="relative overflow-hidden bg-surface-base">
        <CasesHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-32 lg:pt-40 pb-12 lg:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.5rem] font-bold leading-[1.06] tracking-[-0.03em] mb-6">
                <span className="block mb-1">{t('heroTitleLine1')}</span>
                <span className="block">
                  <span className="font-bricolage">{t('heroTitleAccent')}</span> {t('heroTitlePost')}
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] mx-auto max-w-2xl mb-10">{t('heroDesc')}</p>
            </Reveal>

            <Reveal delay={120}>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-10 pb-10 border-b border-black/[0.08] max-w-2xl mx-auto">
                <Stat value={t('stat1Value')} label={t('stat1Label')} />
                <Divider />
                <Stat value={t('stat2Value')} label={t('stat2Label')} />
                <Divider />
                <Stat value={t('stat3Value')} label={t('stat3Label')} />
                <Divider />
                <Stat value={t('stat4Value')} label={t('stat4Label')} />
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={{ pathname: '/sistemas-ia', hash: 'diagnostico' }}
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  {t('ctaPrimary')}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href="#grid"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  {t('ctaSecondary')}
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <TrustBand locale={locale} />

      <section id="grid" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <CasesGrid />
        </div>
      </section>

      <Testimonials locale={locale} />
      <FinalCTA locale={locale} />
    </>
  );
}
