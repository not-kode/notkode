import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { SistemasHeroBackground } from '@/components/sistemas-ia/sistemas-hero-background';
import { ProdutoAppPreview } from '@/components/produtos-digitais/produto-app-preview';
import { HeroMobilePhone } from '@/components/sistemas-ia/hero-mobile-phone';
import { ChaosToOrderSection } from '@/components/sistemas-ia/chaos-to-order-section';
import { ProductShowcase } from '@/components/home/product-showcase';
import { FeaturedCase } from '@/components/home/featured-case';
import { Process } from '@/components/home/process';
import { FAQLazy as FAQ } from '@/components/sistemas-ia/faq-lazy';
import { SistemasQualificationForm } from '@/components/sistemas-ia/sistemas-qualification-form';

export default async function SistemasIAPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
                <span className="block mb-1">Sua operação inteira,</span>
                <span className="block">
                  num <span className="font-bricolage">lugar só.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-xl mb-8">
                Atendimento, vendas, e-mail, site e dados conectados num sistema sob medida. A IA cuida do trabalho repetitivo enquanto seu time foca no que importa.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#diagnostico"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  Tenho interesse
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

      {/* ── Beats 2 + 3: dor + virada (caos→ordem animado, já cobre os dois) ── */}
      <ChaosToOrderSection />

      {/* ── Beat 4: solução tangível — o que você vai ter ── */}
      <span id="o-que-voce-vai-ter" />
      <ProductShowcase
        locale={locale}
        eyebrow="O que você vai ter"
        titleMain="Tudo que você precisa, num"
        titleAccent="lugar só."
        markerNumber="03"
      />

      {/* ── Beat 4 (continuação): como entregamos ── */}
      <Process locale={locale} reverse />

      {/* ── Beat 5: prova social específica do ICP ── */}
      <FeaturedCase locale={locale} />

      {/* ── Beat 6: objeções ── */}
      <FAQ />

      {/* ── Form de interesse (qualification form) ── */}
      <section id="diagnostico" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <Reveal>
              <SectionMarker number="07" label="Tenho interesse" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-6">
                Vamos entender{' '}
                o seu <span className="font-bricolage">cenário.</span>
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Três perguntas curtas pra a gente preparar uma conversa de 30 minutos sob medida. Sem template, sem proposta fria.
              </p>
              <p className="text-[14px] text-text-muted leading-relaxed">
                Sistemas com IA são projetos consultivos. A faixa típica fica entre R$ 25k e R$ 80k, dependendo do escopo. A conversa inicial é gratuita e sem compromisso.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <SistemasQualificationForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
