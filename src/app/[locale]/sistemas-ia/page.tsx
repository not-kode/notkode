import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { SistemasHeroBackground } from '@/components/sistemas-ia/sistemas-hero-background';
import { ProdutoAppPreview } from '@/components/produtos-digitais/produto-app-preview';
import { ToolChaos } from '@/components/sistemas-ia/tool-chaos';
import { ROICalculatorLazy as ROICalculator } from '@/components/sistemas-ia/roi-calculator-lazy';
import { ProductShowcase } from '@/components/home/product-showcase';
import { FeaturedCase } from '@/components/home/featured-case';
import { Process } from '@/components/home/process';
import { FAQLazy as FAQ } from '@/components/sistemas-ia/faq-lazy';
import { FinalCTA } from '@/components/home/final-cta';
import { SistemasQualificationForm } from '@/components/sistemas-ia/sistemas-qualification-form';

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
                <span className="block mb-1">Várias ferramentas,</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">um sistema só.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-xl mb-8">
                Pare de pular entre planilha, CRM, ERP, e-mail e chat. Construímos um sistema interno sob medida, com IA que conhece o seu negócio — feito do jeito que sua empresa funciona de verdade.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#diagnostico"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  {t('heroPrimaryCta')}
                  <ArrowDown className="w-4 h-4" />
                </a>
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
              <ProdutoAppPreview />
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

      {/* ── Diagnóstico (qualification form) ── */}
      <section id="diagnostico" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <Reveal>
              <SectionMarker number="07" label="Diagnóstico gratuito" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-6">
                Vamos entender{' '}
                <span className="font-bricolage">o seu cenário.</span>
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Três perguntas curtas pra a gente preparar uma conversa de 30 min sob medida — sem template, sem proposta fria.
              </p>
              <p className="text-[14px] text-text-muted leading-relaxed">
                Sistemas com IA são projetos consultivos. A faixa típica fica entre R$ 25k e R$ 80k+, dependendo do escopo. Diagnóstico é grátis e sem compromisso.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <SistemasQualificationForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <FinalCTA locale={locale} ctaHref="#diagnostico" />
    </>
  );
}
