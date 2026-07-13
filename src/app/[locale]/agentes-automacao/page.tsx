import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowDown, Bot, Workflow, MessageSquare, Zap, Search, PenTool, Rocket, Sparkles, FileSpreadsheet, Database } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { ProcessTimeline } from '@/components/ui/process-timeline';
import { CountUp } from '@/components/ui/count-up';
import { SectionMarker } from '@/components/ui/section-marker';
import { AgentesHeroBackground } from '@/components/agentes-automacao/agentes-hero-background';
import { AutomationFlowDiagram } from '@/components/agentes-automacao/flow-diagram';
import { AgentesPricingForm } from '@/components/agentes-automacao/agentes-pricing-form';
import { TimeDrainSection } from '@/components/agentes-automacao/time-drain-section';
import { ProductFAQ } from '@/components/ui/product-faq';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Agentes' });
  return { title: t('metaTitle'), description: t('metaDesc') };
}

export default async function AgentesAutomacaoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Agentes' });

  const USE_CASES = [
    { icon: MessageSquare, title: t('uc1Title'), desc: t('uc1Desc'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(34,197,94,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(34,197,94,0.15)', iconStroke: '#16a34a' },
    { icon: Workflow,      title: t('uc2Title'), desc: t('uc2Desc'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(59,130,246,0.14) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(59,130,246,0.15)', iconStroke: '#2563eb' },
    { icon: Bot,           title: t('uc3Title'), desc: t('uc3Desc'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(139,92,246,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(139,92,246,0.15)', iconStroke: '#7c3aed' },
    { icon: Zap,           title: t('uc4Title'), desc: t('uc4Desc'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(245,158,11,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(245,158,11,0.15)', iconStroke: '#d97706' },
  ];

  const RESULTS = [
    { value: t('result1Value'), label: t('result1Label') },
    { value: t('result2Value'), label: t('result2Label') },
    { value: t('result3Value'), label: t('result3Label') },
  ];

  const STACK = [
    { icon: MessageSquare,   name: t('stack1Name'), use: t('stack1Use'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(34,197,94,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(34,197,94,0.15)', iconStroke: '#16a34a' },
    { icon: Sparkles,        name: t('stack2Name'), use: t('stack2Use'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(139,92,246,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(139,92,246,0.15)', iconStroke: '#7c3aed' },
    { icon: Workflow,        name: t('stack3Name'), use: t('stack3Use'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(245,158,11,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(245,158,11,0.15)', iconStroke: '#d97706' },
    { icon: FileSpreadsheet, name: t('stack4Name'), use: t('stack4Use'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(59,130,246,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(59,130,246,0.15)', iconStroke: '#2563eb' },
    { icon: Database,        name: t('stack5Name'), use: t('stack5Use'), gradient: 'radial-gradient(ellipse 80% 70% at 90% 10%, rgba(8,145,178,0.13) 0%, transparent 65%), hsl(55 100% 97%)', iconColor: 'rgba(8,145,178,0.15)', iconStroke: '#0891b2' },
  ];

  const HOW = [
    { iconNode: <Search className="w-7 h-7 text-primary" strokeWidth={1.5} />,  number: '01', title: t('how1Title'), desc: t('how1Desc') },
    { iconNode: <PenTool className="w-7 h-7 text-primary" strokeWidth={1.5} />, number: '02', title: t('how2Title'), desc: t('how2Desc') },
    { iconNode: <Rocket className="w-7 h-7 text-primary" strokeWidth={1.5} />,  number: '03', title: t('how3Title'), desc: t('how3Desc') },
  ];

  const AGENTES_FAQS = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-surface-base">
        <AgentesHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-20 lg:pb-24">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-center">
            <Reveal className="min-w-0">
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-5">
                <span className="block mb-1">{t('heroTitleLine1')}</span>
                <span className="block mb-1">{t('heroTitleLine2')}</span>
                <span className="block">
                  {t('heroTitleLine3')} <span className="font-bricolage">{t('heroTitleAccent')}</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-7">{t('heroDesc')}</p>
              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                {t('heroCta')}
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>

            <Reveal delay={200} direction="left" distance={32}>
              <AutomationFlowDiagram />
            </Reveal>
          </div>
        </div>
      </section>

      <TimeDrainSection />

      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-16 lg:py-20">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
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
            <SectionMarker number="01" label={t('useCasesEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              {t('useCasesTitlePre')} <span className="font-bricolage">{t('useCasesTitleAccent')}</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {USE_CASES.map((uc, i) => (
              <Reveal key={uc.title} delay={i * 90}>
                <TiltCard className="rounded-2xl border border-black/[0.07] p-6 lg:p-7 h-full" style={{ background: uc.gradient }} intensity={5}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: uc.iconColor }}>
                    <uc.icon className="w-5 h-5" style={{ color: uc.iconStroke }} strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">{uc.title}</h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">{uc.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="02" label={t('stackEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4 max-w-2xl">
              {t('stackTitlePre')} <span className="font-bricolage">{t('stackTitleAccent')}</span>
            </h2>
            <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mb-12">{t('stackDesc')}</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {STACK.map((s, i) => (
              <Reveal key={s.name} delay={i * 60}>
                <TiltCard className="rounded-xl border border-black/[0.07] p-5 h-full" style={{ background: s.gradient }} intensity={4}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: s.iconColor }}>
                    <s.icon className="w-4 h-4" style={{ color: s.iconStroke }} strokeWidth={1.7} />
                  </div>
                  <p className="font-bricolage text-[15px] font-semibold text-text-primary mb-1.5">{s.name}</p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{s.use}</p>
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
        faqs={AGENTES_FAQS}
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
            <div className="max-w-2xl mx-auto">
              <AgentesPricingForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
