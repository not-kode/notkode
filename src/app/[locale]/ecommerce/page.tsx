import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowDown, ShoppingCart, RefreshCw, Cpu, Search, PenTool, Rocket } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { CountUp } from '@/components/ui/count-up';
import { ProcessTimeline } from '@/components/ui/process-timeline';
import { TiltCard } from '@/components/ui/tilt-card';
import { DotPattern } from '@/components/ui/dot-pattern';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProdutosHeroBackground } from '@/components/produtos-digitais/produtos-hero-background';
import { StackedShowcase, type StackSlide } from '@/components/ui/stacked-showcase';
import { EcommercePricingForm } from '@/components/ecommerce/ecommerce-pricing-form';
import { PainNamingBlock } from '@/components/ui/pain-naming-block';
import { ProductFAQ } from '@/components/ui/product-faq';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Ecommerce' });
  return { title: t('metaTitle'), description: t('metaDesc') };
}

const STORE_SLIDES: StackSlide[] = [
  { id: 'noodrops', name: 'Noodrops',   url: 'noodrops.com.br',       image: '/images/portfolio/noodrops.jpg', segment: 'nootrópicos' },
  { id: 'donanha',  name: 'Dona Nhá',   url: 'donanhabrecho.com.br',  image: '/images/portfolio/donanha.jpg',  segment: 'brechó / moda' },
];

export default async function EcommercePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Ecommerce' });

  const FRANKENSTEIN_LINES = [
    { text: t('painLine1Text'), metric: t('painLine1Metric') },
    { text: t('painLine2Text'), metric: t('painLine2Metric') },
    { text: t('painLine3Text'), metric: t('painLine3Metric') },
    { text: t('painLine4Text'), metric: t('painLine4Metric') },
    { text: t('painLine5Text'), metric: t('painLine5Metric') },
    { text: t('painLine6Text'), metric: t('painLine6Metric') },
  ];

  const RESULTS = [
    { value: t('result1Value'), label: t('result1Label') },
    { value: t('result2Value'), label: t('result2Label') },
    { value: t('result3Value'), label: t('result3Label') },
  ];

  const SCENARIOS = [
    { icon: Cpu,          title: t('sc1Title'), desc: t('sc1Desc'), flagship: true },
    { icon: ShoppingCart, title: t('sc2Title'), desc: t('sc2Desc') },
    { icon: RefreshCw,    title: t('sc3Title'), desc: t('sc3Desc') },
  ];

  const PLATFORMS = [
    { name: 'WooCommerce', initial: 'Woo', color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', use: t('p1Use') },
    { name: 'Shopify',     initial: 'Sh',  color: '#16A34A', bg: 'rgba(22,163,74,0.10)',  use: t('p2Use') },
    { name: 'Nuvemshop',   initial: 'Nu',  color: '#2563EB', bg: 'rgba(37,99,235,0.10)',  use: t('p3Use') },
  ];

  const HOW = [
    { iconNode: <Search className="w-7 h-7 text-primary" strokeWidth={1.5} />,  number: '01', title: t('how1Title'), desc: t('how1Desc') },
    { iconNode: <PenTool className="w-7 h-7 text-primary" strokeWidth={1.5} />, number: '02', title: t('how2Title'), desc: t('how2Desc') },
    { iconNode: <Rocket className="w-7 h-7 text-primary" strokeWidth={1.5} />,  number: '03', title: t('how3Title'), desc: t('how3Desc') },
  ];

  const ECOMMERCE_FAQS = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-surface-base">
        <ProdutosHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-20 lg:pb-28">
          <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.5rem] font-bold leading-[1.06] tracking-[-0.03em] mb-6">
                <span className="block mb-1">{t('heroTitleLine1')}</span>
                <span className="block">
                  {t('heroTitleLine2')} <span className="font-bricolage">{t('heroTitleAccent')}</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl mx-auto mb-8">{t('heroDesc')}</p>
            </Reveal>

            <Reveal delay={150}>
              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                {t('heroCta')}
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>
          </div>

          <Reveal delay={280} distance={32}>
            <StackedShowcase slides={STORE_SLIDES} />
          </Reveal>
        </div>
      </section>

      <div className="relative">
        <div
          className="absolute top-0 inset-x-0 h-[3px]"
          style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.0) 0%, rgba(59,130,246,0.35) 30%, rgba(59,130,246,0.35) 70%, rgba(59,130,246,0.0) 100%)' }}
        />
        <PainNamingBlock
          eyebrow={t('painEyebrow')}
          title={<><span className="block">{t('painTitleLine1')}</span><span className="block font-bricolage">{t('painTitleAccent')}</span></>}
          intro={t('painIntro')}
          variant="tally"
          surface="elevated"
          pains={FRANKENSTEIN_LINES}
          footer={
            <div className="max-w-2xl rounded-2xl border border-black/[0.08] bg-white/40 px-6 py-5 lg:px-8 lg:py-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim mb-2">{t('painFooterLabel')}</p>
              <p className="text-[15px] lg:text-[16px] text-text-primary leading-snug">
                <span className="font-semibold">{t('painFooterBold1')}</span>{t('painFooterMid')}
                <span className="font-semibold">{t('painFooterBold2')}</span>{t('painFooterEnd')}
              </p>
            </div>
          }
        />
      </div>

      <section className="relative bg-surface-elevated overflow-hidden">
        <DotPattern />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 py-16 lg:py-20">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-3xl mx-auto">
            {RESULTS.map((r, i) => (
              <Reveal key={r.label} delay={i * 100}>
                <div className="text-center">
                  <div className="font-bricolage text-[2.75rem] lg:text-[3.25rem] font-bold text-primary leading-none mb-2 tracking-tight">
                    <CountUp value={r.value} />
                  </div>
                  <div className="font-mono text-[12px] text-text-muted uppercase tracking-widest leading-snug">{r.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="01" label={t('scenariosEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              {t('scenariosTitlePre')} <span className="font-bricolage">{t('scenariosTitleAccent')}</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {SCENARIOS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <TiltCard
                  className="relative rounded-2xl p-6 lg:p-7 h-full"
                  style={{
                    background: s.flagship
                      ? 'linear-gradient(180deg, rgba(59,130,246,0.06) 0%, hsl(55 100% 97%) 70%)'
                      : 'hsl(55 100% 97%)',
                    border: s.flagship ? '1.5px solid rgba(59,130,246,0.35)' : '1px solid rgba(25,25,24,0.08)',
                  }}
                  intensity={5}
                >
                  {s.flagship && (
                    <span className="absolute top-4 right-4 font-mono text-[9px] text-primary uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)' }}>
                      {t('defaultPathBadge')}
                    </span>
                  )}
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <s.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">{s.title}</h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">{s.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="02" label={t('platformsEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4 max-w-2xl">
              {t('platformsTitlePre')} <span className="font-bricolage">{t('platformsTitleAccent')}</span>
            </h2>
            <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mb-12">{t('platformsDesc')}</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
            {PLATFORMS.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <TiltCard
                  className="rounded-xl border border-black/[0.07] p-5 lg:p-6 h-full"
                  style={{ background: `radial-gradient(ellipse 80% 70% at 90% 10%, ${p.bg.replace('0.10', '0.13')} 0%, transparent 65%), hsl(55 100% 97%)` }}
                  intensity={4}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.bg }}>
                      <span className="font-bricolage font-bold text-[11px]" style={{ color: p.color }}>{p.initial}</span>
                    </div>
                    <p className="font-bricolage text-[16px] font-semibold text-text-primary">{p.name}</p>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{p.use}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="03" label={t('howEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              {t('howTitlePre')} <span className="font-bricolage">{t('howTitleAccent')}</span>
            </h2>
          </Reveal>

          <ProcessTimeline steps={HOW} />
        </div>
      </section>

      <ProductFAQ
        title={<><span className="block">{t('faqTitleLine1')}</span><span className="block font-bricolage">{t('faqTitleAccent')}</span></>}
        faqs={ECOMMERCE_FAQS}
        surface="elevated"
      />

      <section id="orcamento" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">{t('pricingTitleLine1')}</span>
                <span className="block font-bricolage">{t('pricingTitleAccent')}</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">{t('pricingDesc')}</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <EcommercePricingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
