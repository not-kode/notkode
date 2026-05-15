import { setRequestLocale } from 'next-intl/server';
import {
  ArrowDown, Palette, Type, BookOpen, Layout, Search, PenTool, Rocket,
  Sprout, Leaf, Flag, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { SobreHeroBackground } from '@/components/sobre/sobre-hero-background';
import { BrandbookPreviewLazy as BrandbookPreview } from '@/components/design/brandbook-preview-lazy';
import { BrandbookPricingForm } from '@/components/brandbook/brandbook-pricing-form';
import { ProductFAQ } from '@/components/ui/product-faq';

const LIFECYCLE_STAGES = [
  {
    Icon: Sprout,
    label: 'Marca nascendo',
    desc: 'Empresa pré-lançamento ou primeiro mercado. Precisa de identidade pra existir oficialmente.',
  },
  {
    Icon: Leaf,
    label: 'Rebrand leve',
    desc: 'O negócio amadureceu e o visual ficou pra trás. Hora de atualizar sem reinventar do zero.',
  },
  {
    Icon: Flag,
    label: 'Antes do site novo',
    desc: 'A marca precisa estar pronta antes do site sair, pra ele já nascer consistente com a identidade.',
  },
];

const BRANDBOOK_FAQS = [
  {
    q: 'Preciso de brandbook se já tenho logo?',
    a: 'Depende. Se você tem só o logo solto, sem paleta definida, tipografia escolhida ou regras de uso, qualquer designer novo vai criar inconsistência. O brandbook é o que protege a marca de virar versões soltas em apresentação, social e site.',
  },
  {
    q: 'Vocês refazem o logo do zero ou trabalham com o que já existe?',
    a: 'Os dois caminhos. Refazer do zero quando a marca não traduz mais quem o negócio é hoje. Refinar quando o logo já tem identidade, mas falta sistema (paleta, tipografia, aplicações).',
  },
  {
    q: 'Quanto tempo até a marca estar pronta?',
    a: 'Entre 2 e 3 semanas pro brandbook essencial. Combo com site costuma rodar em paralelo: a marca fica pronta antes do site ir pro ar, garantindo consistência.',
  },
  {
    q: 'O brandbook combina com o site que vocês fazem?',
    a: 'É o jeito que recomendamos contratar. Quando os dois saem juntos, a identidade visual chega no site exata, sem reinterpretação. Combo Brandbook + Site sai com desconto.',
  },
  {
    q: 'Quem fica com os arquivos editáveis?',
    a: 'Você. Vetores em SVG, PDF e PNG, sem dependência de software pago. Pode levar pra qualquer designer continuar a partir daí.',
  },
];

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
                  feita pra <span className="font-bricolage">durar.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] mx-auto mb-8">
                Pra marca nova nascendo, rebrand leve ou antes do site novo. Logo, paleta, tipografia e brandbook prontos pra sustentar tudo que a empresa vai construir depois.
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

      {/* ── Quando faz sentido: ciclo de vida da marca ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Três momentos em que sua marca</span>
                <span className="font-bricolage block">pede um brandbook.</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Brandbook não é coisa só de empresa madura. É a base que segura tudo que vem depois: o site, a apresentação, o post, a proposta.
              </p>
            </div>
          </Reveal>

          {/* Visual estático: 3 etapas com ícones, linha central tracejada conectando */}
          <Reveal delay={120}>
            <div className="relative max-w-4xl mx-auto px-4 lg:px-8" aria-hidden="true">
              {/* Linha central horizontal (desktop), alinhada com o centro vertical dos ícones */}
              <div className="hidden md:block absolute left-[14%] right-[14%] top-[52px] h-px border-t border-dashed border-black/20" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
                {LIFECYCLE_STAGES.map(({ Icon, label, desc }, i) => (
                  <div
                    key={label}
                    className="relative z-10 flex flex-col items-center text-center px-4 pt-6 pb-7"
                  >
                    <div className="w-14 h-14 rounded-full bg-white border border-black/[0.08] flex items-center justify-center shadow-sm mb-5">
                      <Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim mb-2">
                      Etapa {String(i + 1).padStart(2, '0')}
                    </p>
                    <p className="font-bricolage text-[18px] lg:text-[20px] font-semibold text-text-primary mb-2">
                      {label}
                    </p>
                    <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-xs">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Brandbook preview ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
              <SectionMarker number="01" label="Veja um exemplo real" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4">
                Folheie o brandbook que{' '}
                a gente <span className="font-bricolage">entrega.</span>
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
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <SectionMarker number="02" label="O que você recebe" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4">
                Tudo que sua marca{' '}
                precisa para <span className="font-bricolage">existir.</span>
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
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="03" label="Como entregamos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Três etapas do briefing à <span className="font-bricolage">marca pronta.</span>
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

      {/* ── Combo Brandbook + Site: cross-sell visual ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Brandbook e Site,</span>
                <span className="block font-bricolage">na mesma respiração.</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Quando os dois saem juntos, a identidade chega no site exata, sem reinterpretação. Sem perder uma palette no caminho, sem refazer tipografia. E o combo sai com desconto.
              </p>
            </div>
          </Reveal>

          {/* Visual: two pieces fitting */}
          <Reveal delay={120}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 max-w-3xl mx-auto mb-10">
              <div className="flex-1 max-w-xs w-full rounded-2xl border border-black/[0.08] bg-white/60 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-5 h-5 text-primary" strokeWidth={1.7} />
                </div>
                <p className="font-bricolage text-[18px] font-semibold text-text-primary mb-1">
                  Brandbook
                </p>
                <p className="text-[13px] text-text-secondary">
                  Logo, paleta, tipografia, regras
                </p>
              </div>

              <ArrowRight className="w-6 h-6 text-primary rotate-90 md:rotate-0 shrink-0" strokeWidth={1.8} />

              <div className="flex-1 max-w-xs w-full rounded-2xl border border-black/[0.08] bg-white/60 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Layout className="w-5 h-5 text-primary" strokeWidth={1.7} />
                </div>
                <p className="font-bricolage text-[18px] font-semibold text-text-primary mb-1">
                  Site
                </p>
                <p className="text-[13px] text-text-secondary">
                  Identidade aplicada, sem ruído
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="text-center">
              <Link
                href="/sites"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-black/[0.12] bg-white/60 hover:bg-white/90 text-text-primary font-bold text-[13px] uppercase tracking-wide transition-all duration-200"
              >
                Ver como funciona o combo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ: objeções comuns de brandbook ── */}
      <ProductFAQ
        title={<><span className="block">O que todo fundador</span><span className="block font-bricolage">pergunta antes de fechar.</span></>}
        faqs={BRANDBOOK_FAQS}
        surface="elevated"
      />

      {/* ── Pricing form ── */}
      <section id="orcamento" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Monte sua identidade,</span>
                <span className="block font-bricolage">veja o investimento na hora.</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
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
