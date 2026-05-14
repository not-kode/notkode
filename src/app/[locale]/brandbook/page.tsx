import { setRequestLocale } from 'next-intl/server';
import { ArrowDown, Palette, Type, BookOpen, Layout, Search, PenTool, Rocket } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { SobreHeroBackground } from '@/components/sobre/sobre-hero-background';
import { BrandbookPreviewLazy as BrandbookPreview } from '@/components/design/brandbook-preview-lazy';
import { BrandbookPricingForm } from '@/components/brandbook/brandbook-pricing-form';

const DELIVERABLES = [
  {
    icon: Palette,
    title: 'Logo + variações',
    desc: 'Marca principal, secundária, monograma e versões reduzidas. Vetores em todos os formatos (SVG, PDF, PNG).',
  },
  {
    icon: Type,
    title: 'Paleta de cores e tipografia',
    desc: 'Sistema completo de cores (primária, secundária, neutras) com códigos hex/RGB e fontes escolhidas para a marca.',
  },
  {
    icon: BookOpen,
    title: 'Brandbook completo',
    desc: 'Manual de identidade explicando regras de uso da marca: espaçamento, proporções, usos corretos e proibidos.',
  },
  {
    icon: Layout,
    title: 'Aplicações práticas',
    desc: 'Templates para social media, papelaria (cartão, assinatura de e-mail) e apresentações — prontos para usar.',
  },
];

const STATS = [
  { value: '2–3 sem', label: 'do briefing à entrega final' },
  { value: '100%',    label: 'arquivos vetoriais editáveis' },
  { value: '+30',     label: 'identidades visuais entregues' },
];

const HOW = [
  {
    icon: Search,
    title: 'Imersão na marca',
    desc: 'Entendemos seu negócio, público e referências. Saída: moodboard, valores de marca e direções criativas.',
  },
  {
    icon: PenTool,
    title: 'Concepção e refino',
    desc: 'Apresentamos 2–3 caminhos de logo, paleta e tipografia. Você escolhe um e a gente refina até bater.',
  },
  {
    icon: Rocket,
    title: 'Brandbook + aplicações',
    desc: 'Entregamos manual de marca completo, vetores editáveis e templates prontos para a sua equipe usar.',
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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <SobreHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-20 lg:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.08] tracking-[-0.03em] mb-6">
                <span className="block mb-1">A marca da sua empresa,</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">feita pra durar.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] mx-auto mb-8">
                Logo, paleta de cores, tipografia e brandbook completo. Construímos a identidade visual que sua empresa precisa para crescer com personalidade e consistência.
              </p>

              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Calcular meu brandbook
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-16 lg:py-20">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center">
                  <div className="font-bricolage text-[2.25rem] lg:text-[2.75rem] font-bold text-primary leading-none mb-2 tracking-tight">
                    {s.value}
                  </div>
                  <div className="font-mono text-[12px] text-text-muted">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brandbook preview ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
              <SectionMarker number="01" label="Veja um exemplo real" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4">
                Folheie o brandbook que{' '}
                <span className="font-bricolage">a gente entrega.</span>
              </h2>
              <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed">
                Role para baixo dentro do documento e veja as páginas reais de uma identidade visual: capa, logo, cores, tipografia, componentes e aplicações.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <BrandbookPreview />
          </Reveal>
        </div>
      </section>

      {/* ── Entregáveis ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <SectionMarker number="02" label="O que você recebe" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4">
                Tudo que sua marca{' '}
                <span className="font-bricolage">precisa para existir.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
            {DELIVERABLES.map((d, i) => (
              <Reveal key={d.title} delay={i * 90}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <d.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">
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

      {/* ── Como entregamos ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="03" label="Como entregamos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Três etapas{' '}
              <span className="font-bricolage">do briefing à marca pronta.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {HOW.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[11px] text-text-dim">0{i + 1}</span>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-4 h-4 text-primary" strokeWidth={1.7} />
                    </div>
                  </div>
                  <h3 className="text-[17px] lg:text-[18px] font-semibold tracking-tight text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {step.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing form ── */}
      <section id="orcamento" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mb-10 lg:mb-12">
              <SectionMarker number="04" label="Seu orçamento" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4">
                Monte sua identidade,{' '}
                <span className="font-bricolage">veja o investimento na hora.</span>
              </h2>
              <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed">
                Quatro perguntas curtas. No final você vê o investimento estimado e pode pedir a proposta detalhada.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <BrandbookPricingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
