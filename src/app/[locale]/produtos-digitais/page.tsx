import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Smartphone, ShoppingCart, Layout, LineChart } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProdutosHeroBackground } from '@/components/produtos-digitais/produtos-hero-background';
import { ProdutoAppPreview } from '@/components/produtos-digitais/produto-app-preview';
import { Process } from '@/components/home/process';
import { FinalCTA } from '@/components/home/final-cta';

const TYPES = [
  {
    icon: LineChart,
    title: 'SaaS',
    desc: 'Plataformas escaláveis para distribuição comercial. Do MVP ao primeiro milhão em receita recorrente.',
    examples: 'AutoAgentes · ZapInside · Ativa Clientes',
  },
  {
    icon: Smartphone,
    title: 'Apps Mobile',
    desc: 'Apps iOS e Android nativos ou híbridos. Foco em retenção e experiência fluida.',
    examples: 'React Native · Flutter · iOS / Android',
  },
  {
    icon: ShoppingCart,
    title: 'E-commerce',
    desc: 'Lojas virtuais focadas em conversão. Integração de pagamentos, logística e marketing.',
    examples: 'Noodrops · Ponto Patta · WooCommerce',
  },
  {
    icon: Layout,
    title: 'Websites Institucionais',
    desc: 'Sites editoriais com performance, SEO e captação de leads integrada.',
    examples: 'Solojet · Azure · Cotton · Peki',
  },
];

const RESULTS = [
  { value: '+R$ 150k', label: 'faturamento mensal · Ponto Patta' },
  { value: '3 semanas', label: 'até o 1º cliente · ZapInside'  },
  { value: '+80%',     label: 'crescimento de receita · Noodrops' },
];

export default async function ProdutosDigitaisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* ── Hero — centered + app preview below ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <ProdutosHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-20 lg:pb-28">
          {/* Centered headline */}
          <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.5rem] font-bold leading-[1.06] tracking-[-0.03em] mb-6">
                <span className="block mb-1">Do papel ao</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">primeiro cliente.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl mx-auto mb-8">
                SaaS, apps mobile, e-commerce e websites construídos sob medida — do MVP ao escalar. Sem framework genérico, sem template pronto.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/contato"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  Agendar diagnóstico
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cases"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  Ver cases
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* App preview below */}
          <Reveal delay={280} distance={32}>
            <ProdutoAppPreview />
          </Reveal>
        </div>
      </section>

      {/* ── Resultados em destaque ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-16 lg:py-20">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {RESULTS.map((r, i) => (
              <Reveal key={r.label} delay={i * 100}>
                <div className="text-center">
                  <div className="font-bricolage text-[2.25rem] lg:text-[2.75rem] font-bold text-primary leading-none mb-2 tracking-tight">
                    {r.value}
                  </div>
                  <div className="font-mono text-[12px] text-text-muted">
                    {r.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tipos de produto ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="01" label="O que construímos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Quatro tipos de produto.{' '}
              <span className="font-bricolage">Uma só metodologia.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {TYPES.map((t, i) => (
              <Reveal key={t.title} delay={i * 90}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <t.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                    </div>
                    <h3 className="text-[18px] lg:text-[20px] font-semibold tracking-tight text-text-primary">
                      {t.title}
                    </h3>
                  </div>
                  <p className="text-[14px] text-text-secondary leading-relaxed mb-4">
                    {t.desc}
                  </p>
                  <div className="pt-3 border-t border-black/[0.06]">
                    <p className="font-mono text-[10px] text-text-dim">
                      {t.examples}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como trabalhamos (reaproveitado) ── */}
      <Process locale={locale} />

      {/* ── CTA final ── */}
      <FinalCTA locale={locale} />
    </>
  );
}
