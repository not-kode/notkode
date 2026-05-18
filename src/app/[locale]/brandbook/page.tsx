import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowDown, Palette, Type, BookOpen, Layout, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Identidade visual e brandbook · Notkode',
  description:
    'Logo, paleta, tipografia e manual de marca. Pronto em 2 a 3 semanas, com arquivos editáveis na sua mão. Combo com site, sistema ou loja sai com desconto.',
};
import { Reveal } from '@/components/ui/reveal';
import { SobreHeroBackground } from '@/components/sobre/sobre-hero-background';
import { BrandbookPreviewLazy as BrandbookPreview } from '@/components/design/brandbook-preview-lazy';
import { BrandbookPricingForm } from '@/components/brandbook/brandbook-pricing-form';
import { ProductFAQ } from '@/components/ui/product-faq';

const BRANDBOOK_FAQS = [
  {
    q: 'Preciso de brandbook se já tenho logo?',
    a: 'Depende. Se você tem só o logo solto, sem paleta, tipografia ou regras de uso, qualquer designer novo vai criar inconsistência. O brandbook é o que protege a marca de virar versões soltas em apresentação, social e site.',
  },
  {
    q: 'Refazem o logo do zero ou trabalham com o que já existe?',
    a: 'Os dois caminhos. Refazer quando a marca não traduz mais quem o negócio é hoje. Refinar quando o logo já tem identidade, mas falta sistema (paleta, tipografia, aplicações).',
  },
  {
    q: 'Quanto tempo até a marca estar pronta?',
    a: 'Entre 2 e 3 semanas pro brandbook essencial. Quando sai junto com site, sistema ou loja, roda em paralelo e fica pronto antes do go-live.',
  },
];

const DELIVERABLES = [
  {
    icon: Palette,
    title: 'Logo + variações',
    desc: 'Marca principal, secundária, monograma e versões reduzidas. Vetores em SVG, PDF e PNG.',
  },
  {
    icon: Type,
    title: 'Paleta e tipografia',
    desc: 'Cores (primária, secundária, neutras) com hex/RGB e fontes escolhidas para a marca.',
  },
  {
    icon: BookOpen,
    title: 'Brandbook completo',
    desc: 'Manual de identidade com regras de uso: espaçamento, proporções, usos corretos e proibidos.',
  },
  {
    icon: Layout,
    title: 'Aplicações práticas',
    desc: 'Templates pra social, papelaria (cartão, assinatura) e apresentações, prontos pra usar.',
  },
];

export default async function BrandbookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* ── Hero (slim) ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <SobreHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-16 lg:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-5">
                <span className="block mb-1">A identidade da sua empresa,</span>
                <span className="block">
                  feita pra <span className="font-bricolage">durar.</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[18px] text-text-secondary leading-[1.6] mx-auto mb-7 max-w-xl">
                Logo, paleta, tipografia e manual de marca. Pronto em 2 a 3 semanas, com arquivos editáveis na sua mão.
              </p>

              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Montar meu brandbook
                <ArrowDown className="w-4 h-4" />
              </a>

              {/* Stats inline (não card grid) */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] text-text-muted uppercase tracking-widest">
                <span>2–3 sem · briefing à entrega</span>
                <span className="hidden sm:inline text-text-dim">·</span>
                <span>arquivos vetoriais editáveis</span>
                <span className="hidden sm:inline text-text-dim">·</span>
                <span>+30 identidades entregues</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Preview do brandbook ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-3">
                Folheie o brandbook que{' '}
                a gente <span className="font-bricolage">entrega.</span>
              </h2>
              <p className="text-[14px] lg:text-[15px] text-text-secondary leading-relaxed max-w-lg mx-auto">
                Role para baixo dentro do documento e veja capa, logo, cores, tipografia, componentes e aplicações.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <BrandbookPreview />
          </Reveal>
        </div>
      </section>

      {/* ── Entregáveis ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em]">
                Tudo que sua marca{' '}
                precisa para <span className="font-bricolage">existir.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
            {DELIVERABLES.map((d, i) => (
              <Reveal key={d.title} delay={i * 80}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <d.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[17px] lg:text-[18px] font-semibold tracking-tight text-text-primary mb-2">
                    {d.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {d.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ enxuta ── */}
      <ProductFAQ
        title={<><span className="block">Perguntas rápidas</span><span className="block font-bricolage">antes de fechar.</span></>}
        faqs={BRANDBOOK_FAQS}
        surface="elevated"
      />

      {/* ── Pricing form ── */}
      <section id="orcamento" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Monte sua identidade,</span>
                <span className="block font-bricolage">veja a faixa estimada.</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Algumas perguntas curtas pra mapear seu cenário. No final você vê o escopo e uma faixa preliminar.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <BrandbookPricingForm />
          </Reveal>
        </div>
      </section>

      {/* ── Link discreto pro combo ── */}
      <section className="bg-surface-elevated border-t border-black/[0.06]">
        <div className="container mx-auto px-5 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p className="font-mono text-[11px] text-text-dim">
              ❯ vai fazer site, sistema ou loja também?
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link href="/sites" className="text-[13px] text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                Site <ArrowUpRight className="w-3 h-3" />
              </Link>
              <span className="text-text-dim">·</span>
              <Link href="/sistemas-ia" className="text-[13px] text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                Sistema <ArrowUpRight className="w-3 h-3" />
              </Link>
              <span className="text-text-dim">·</span>
              <Link href="/ecommerce" className="text-[13px] text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                Loja <ArrowUpRight className="w-3 h-3" />
              </Link>
              <span className="font-mono text-[11px] text-text-dim">combo com desconto</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
