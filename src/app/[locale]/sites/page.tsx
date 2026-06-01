import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowDown, Layout, FileText, BookOpen, Globe2, Search, PenTool, Rocket,
  Sparkles, Code2, Wand2, Gauge as GaugeIcon,
  RefreshCw, FlaskConical, ShieldCheck,
} from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProcessTimeline } from '@/components/ui/process-timeline';
import { CountUp } from '@/components/ui/count-up';
import { DotPattern } from '@/components/ui/dot-pattern';
import { TiltCard } from '@/components/ui/tilt-card';
import { ProdutosHeroBackground } from '@/components/produtos-digitais/produtos-hero-background';
import { StackedShowcase, type StackSlide } from '@/components/ui/stacked-showcase';
import { SitesPricingForm } from '@/components/sites/sites-pricing-form';
import { ProductFAQ } from '@/components/ui/product-faq';
import { BrandbookCombo } from '@/components/ui/brandbook-combo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Sites' });
  return { title: t('metaTitle'), description: t('metaDesc') };
}

const SITE_SLIDES: StackSlide[] = [
  { id: 'propay',  name: 'ProPay',              url: 'propay.com.br',           image: '/images/portfolio/propay.jpg',  segment: 'RH & folha' },
  { id: 'solojet', name: 'Solojet Aviação',     url: 'solojetaviacao.com.br',   image: '/images/portfolio/solojet.jpg', segment: 'aviação executiva' },
  { id: 'azure',   name: 'Azure Investimentos', url: 'azureinvestimentos.com',  image: '/images/portfolio/azure.jpg',   segment: 'assessoria BTG' },
  { id: 'simbos',  name: 'SimbOS',              url: 'simbos.vercel.app',       image: '/images/portfolio/simbos.jpg',  segment: 'SaaS · AI workspace' },
];

export default async function SitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Sites' });

  const TYPES = [
    { icon: Layout,   scenario: t('type1Scenario'), recommendation: t('type1Name'), oneLiner: t('type1OneLiner'), color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { icon: FileText, scenario: t('type2Scenario'), recommendation: t('type2Name'), oneLiner: t('type2OneLiner'), color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { icon: BookOpen, scenario: t('type3Scenario'), recommendation: t('type3Name'), oneLiner: t('type3OneLiner'), color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { icon: Globe2,   scenario: t('type4Scenario'), recommendation: t('type4Name'), oneLiner: t('type4OneLiner'), color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  ];

  const STATS = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
  ];

  const AI_PILLARS = [
    { Icon: Wand2,     label: t('aiPillar1Label'), desc: t('aiPillar1Desc'), color: '#EC4899', bg: 'rgba(236,72,153,0.10)' },
    { Icon: Code2,     label: t('aiPillar2Label'), desc: t('aiPillar2Desc'), color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' },
    { Icon: Sparkles,  label: t('aiPillar3Label'), desc: t('aiPillar3Desc'), color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
    { Icon: GaugeIcon, label: t('aiPillar4Label'), desc: t('aiPillar4Desc'), color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  ];

  const MAINTENANCE = [
    { Icon: RefreshCw,    label: t('maint1Label'), desc: t('maint1Desc'), color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' },
    { Icon: FlaskConical, label: t('maint2Label'), desc: t('maint2Desc'), color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)' },
    { Icon: ShieldCheck,  label: t('maint3Label'), desc: t('maint3Desc'), color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  ];

  const HOW = [
    { iconNode: <Search className="w-7 h-7 text-primary" strokeWidth={1.5} />,  number: '01', title: t('how1Title'), desc: t('how1Desc') },
    { iconNode: <PenTool className="w-7 h-7 text-primary" strokeWidth={1.5} />, number: '02', title: t('how2Title'), desc: t('how2Desc') },
    { iconNode: <Rocket className="w-7 h-7 text-primary" strokeWidth={1.5} />,  number: '03', title: t('how3Title'), desc: t('how3Desc') },
  ];

  const SITES_FAQS = [
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
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl mx-auto mb-8">
                {t('heroDesc')}
              </p>
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
            <StackedShowcase slides={SITE_SLIDES} />
          </Reveal>
        </div>
      </section>

      <section className="relative bg-surface-elevated overflow-hidden">
        <DotPattern />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 py-16 lg:py-20">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-3xl mx-auto">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center">
                  <div className="font-bricolage text-[2.75rem] lg:text-[3.25rem] font-bold text-primary leading-none mb-2 tracking-tight">
                    <CountUp value={s.value} />
                  </div>
                  <div className="font-mono text-[12px] text-text-muted uppercase tracking-widest leading-snug">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">{t('typesTitleLine1Pre')} <span className="font-bricolage">{t('typesTitleLine1Accent')}</span> {t('typesTitleLine1Post')}</span>
                <span className="block font-bricolage">{t('typesTitleLine2')}</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-text-secondary max-w-2xl mx-auto">{t('typesDesc')}</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {TYPES.map((tt, i) => (
              <Reveal key={tt.recommendation} delay={i * 90}>
                <TiltCard
                  className="h-full rounded-2xl border border-black/[0.08] p-6 lg:p-7"
                  style={{ background: `radial-gradient(ellipse 80% 70% at 95% 5%, ${tt.bg} 0%, transparent 65%), hsl(55 100% 97%)` }}
                  intensity={5}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tt.bg }}>
                      <tt.icon className="w-5 h-5" style={{ color: tt.color }} strokeWidth={1.7} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim">
                      {t('typesScenarioLabel')} {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="text-[16px] lg:text-[17px] font-semibold text-text-primary leading-snug mb-5">{tt.scenario}</p>

                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{t('typesDeliverLabel')}</span>
                    <span className="h-px flex-1 bg-primary/20" />
                  </div>
                  <p className="font-bricolage text-[20px] lg:text-[22px] font-semibold text-text-primary mb-2">{tt.recommendation}</p>
                  <p className="text-[13px] lg:text-[14px] text-text-secondary leading-snug">{tt.oneLiner}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-surface-elevated overflow-hidden">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block font-bricolage">{t('aiTitleAccent')}</span>
                <span className="block">{t('aiTitlePost')}</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] text-text-secondary leading-relaxed max-w-2xl mx-auto">{t('aiDesc')}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {AI_PILLARS.map(({ Icon, label, desc, color, bg }, i) => (
              <Reveal key={label} delay={i * 80}>
                <TiltCard className="h-full text-center px-5 py-7 lg:py-8 rounded-2xl border border-black/[0.08]" style={{ background: `radial-gradient(ellipse 90% 60% at 50% 0%, ${bg} 0%, transparent 70%), hsl(55 100% 97%)` }} intensity={4}>
                  <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: bg }}>
                    <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.6} />
                  </div>
                  <p className="font-bricolage text-[17px] font-semibold text-text-primary mb-2">{label}</p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400}>
            <p className="text-center text-[13px] text-text-muted max-w-xl mx-auto mt-10">{t('aiFooter')}</p>
          </Reveal>
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

      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 bg-black/[0.04] border border-black/[0.08]">
                <span className="font-mono text-[11px] text-text-secondary tracking-tight uppercase">
                  {t('maintEyebrow')}
                </span>
              </div>
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">{t('maintTitleLine1Pre')} <span className="font-bricolage">{t('maintTitleLine1Accent')}</span>{t('maintTitleLine1Post')}</span>
                <span className="block font-bricolage">{t('maintTitleLine2')}</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] text-text-secondary leading-relaxed max-w-2xl mx-auto">{t('maintDesc')}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {MAINTENANCE.map(({ Icon, label, desc, color, bg }, i) => (
              <Reveal key={label} delay={i * 90}>
                <TiltCard className="h-full p-6 lg:p-7 rounded-2xl border border-black/[0.08]" style={{ background: `radial-gradient(ellipse 80% 70% at 95% 5%, ${bg} 0%, transparent 65%), hsl(55 100% 97%)` }} intensity={4}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.7} />
                  </div>
                  <p className="font-bricolage text-[17px] font-semibold text-text-primary mb-2">{label}</p>
                  <p className="text-[14px] text-text-secondary leading-relaxed">{desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProductFAQ
        title={<><span className="block">{t('faqTitleLine1')}</span><span className="block font-bricolage">{t('faqTitleAccent')}</span></>}
        faqs={SITES_FAQS}
        surface="base"
      />

      <BrandbookCombo companion="site" surface="base" />

      <section id="orcamento" className="bg-surface-elevated">
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
            <SitesPricingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
