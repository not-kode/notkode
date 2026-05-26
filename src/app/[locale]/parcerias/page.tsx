import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, ArrowDown, TrendingUp, Users, Zap, Shield, Code2, Sparkles, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ParceriasHeroBackground } from '@/components/parcerias/parcerias-hero-background';
import { PartnershipIllustration } from '@/components/parcerias/partnership-illustration';
import { AgencyBanner } from '@/components/home/agency-banner';
import { FinalCTA } from '@/components/home/final-cta';
import { ParceriasQualificationForm } from '@/components/parcerias/parcerias-qualification-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Parcerias' });
  return { title: t('metaTitle'), description: t('metaDesc') };
}

function HighlightCard({
  icon: Icon,
  value,
  topLabel,
  desc,
  accent = false,
}: {
  icon: LucideIcon;
  value: string;
  topLabel: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <article
      className="rounded-2xl p-6 lg:p-7 h-full transition-all duration-300 hover:-translate-y-1"
      style={{
        background: accent ? 'rgba(59,130,246,0.05)' : 'hsl(55 100% 97%)',
        border: accent
          ? '1px solid rgba(59,130,246,0.25)'
          : '1px solid rgba(25,25,24,0.08)',
        boxShadow: accent
          ? '0 12px 32px -16px rgba(59,130,246,0.25)'
          : '0 6px 20px -10px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: accent ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.10)',
          }}
        >
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
        </div>
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
          {topLabel}
        </span>
      </div>
      <div className="font-bricolage text-[1.75rem] lg:text-[2rem] font-bold text-primary leading-none mb-3 tracking-tight">
        {value}
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">{desc}</p>
    </article>
  );
}

export default async function ParceriasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Parcerias' });

  const BENEFITS = [
    { icon: TrendingUp, title: t('benefit1Title'), desc: t('benefit1Desc') },
    { icon: Users,      title: t('benefit2Title'), desc: t('benefit2Desc') },
    { icon: Zap,        title: t('benefit3Title'), desc: t('benefit3Desc') },
    { icon: Shield,     title: t('benefit4Title'), desc: t('benefit4Desc') },
  ];

  const OFFERINGS = [
    { icon: Code2,     title: t('offering1Title'), desc: t('offering1Desc') },
    { icon: Sparkles,  title: t('offering2Title'), desc: t('offering2Desc') },
    { icon: Code2,     title: t('offering3Title'), desc: t('offering3Desc') },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-surface-base">
        <ParceriasHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-16 lg:pb-20">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-center mb-12 lg:mb-14">
            <Reveal direction="right">
              <PartnershipIllustration />
            </Reveal>

            <Reveal delay={150} className="min-w-0">
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-5 break-words">
                <span className="block mb-1">{t('heroTitleLine1')}</span>
                <span className="block">
                  {t('heroTitleLine2')} <span className="font-bricolage">{t('heroTitleAccent')}</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-7">
                {t('heroDesc')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#parceria"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  {t('heroCtaPrimary')}
                  <ArrowDown className="w-4 h-4" />
                </a>
                <a
                  href="#como-funciona"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  {t('heroCtaSecondary')}
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
            <Reveal delay={250}>
              <HighlightCard icon={TrendingUp} value={t('highlight1Value')} topLabel={t('highlight1Label')} desc={t('highlight1Desc')} />
            </Reveal>
            <Reveal delay={320}>
              <HighlightCard icon={Shield} value={t('highlight2Value')} topLabel={t('highlight2Label')} desc={t('highlight2Desc')} accent />
            </Reveal>
            <Reveal delay={390}>
              <HighlightCard icon={Zap} value={t('highlight3Value')} topLabel={t('highlight3Label')} desc={t('highlight3Desc')} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="01" label={t('benefitsEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              {t('benefitsTitlePre')}{' '}
              {t('benefitsTitleMid')} <span className="font-bricolage">{t('benefitsTitleAccent')}</span> {t('benefitsTitlePost')}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <b.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">{b.title}</h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">{b.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <span id="como-funciona" />
      <AgencyBanner locale={locale} />

      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="03" label={t('offeringsEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              {t('offeringsTitlePre')}{' '}
              {t('offeringsTitleMid')} <span className="font-bricolage">{t('offeringsTitleAccent')}</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {OFFERINGS.map((o, i) => (
              <Reveal key={o.title} delay={i * 100}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <o.icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[16px] lg:text-[17px] font-semibold tracking-tight text-text-primary mb-2">{o.title}</h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{o.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="parceria" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <Reveal>
              <SectionMarker number="05" label={t('formEyebrow')} />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-6">
                {t('formTitlePre')}{' '}
                {t('formTitleMid')} <span className="font-bricolage">{t('formTitleAccent')}</span>
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed">{t('formDesc')}</p>
            </Reveal>

            <Reveal delay={120}>
              <ParceriasQualificationForm />
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA locale={locale} ctaHref="#parceria" />
    </>
  );
}
