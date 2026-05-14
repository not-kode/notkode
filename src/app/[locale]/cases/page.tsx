import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';
import { CasesGridLazy as CasesGrid } from '@/components/cases/cases-grid-lazy';
import { CasesHeroBackground } from '@/components/cases/cases-hero-background';
import { TrustBand } from '@/components/home/trust-band';
import { Testimonials } from '@/components/home/testimonials';
import { FinalCTA } from '@/components/home/final-cta';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-bricolage text-[1.5rem] lg:text-[1.75rem] font-bold text-text-primary leading-none mb-1">
        {value}
      </div>
      <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
        {label}
      </div>
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

  return (
    <>
      {/* Hero — centered */}
      <section className="relative overflow-hidden bg-surface-base">
        <CasesHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-32 lg:pt-40 pb-12 lg:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.5rem] font-bold leading-[1.06] tracking-[-0.03em] mb-6">
                <span className="block mb-1">Projetos que viraram</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">resultado real.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] mx-auto max-w-2xl mb-10">
                50+ projetos entregues em 6 anos para empresas em crescimento — sistemas internos, SaaS, e-commerce e websites. Cada caso resolveu uma dor real e gerou um número que importa.
              </p>
            </Reveal>

            {/* Stat row */}
            <Reveal delay={120}>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-10 pb-10 border-b border-black/[0.08] max-w-2xl mx-auto">
                <Stat value="50+"  label="projetos entregues" />
                <Divider />
                <Stat value="4"    label="categorias" />
                <Divider />
                <Stat value="4"    label="países atendidos" />
                <Divider />
                <Stat value="9.8"  label="avaliação média" />
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/sistemas-ia#diagnostico"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  Quero ser o próximo case
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="#grid"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  Explorar portfólio
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>

      </section>

      {/* Trust band */}
      <TrustBand locale={locale} />

      {/* Grid */}
      <section id="grid" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <CasesGrid />
        </div>
      </section>

      {/* Testimonials reaproveitado */}
      <Testimonials locale={locale} />

      {/* CTA final reaproveitado */}
      <FinalCTA locale={locale} />
    </>
  );
}
