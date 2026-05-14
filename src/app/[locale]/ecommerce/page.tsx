import { setRequestLocale } from 'next-intl/server';
import { ArrowDown, ShoppingCart, RefreshCw, TrendingUp, CreditCard, Search, PenTool, Rocket } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProdutosHeroBackground } from '@/components/produtos-digitais/produtos-hero-background';
import { BrowserShowcase, type ShowcaseSlide } from '@/components/ui/browser-showcase';
import { EcommercePricingForm } from '@/components/ecommerce/ecommerce-pricing-form';

const STORE_SLIDES: ShowcaseSlide[] = [
  { id: 'noodrops',       name: 'Noodrops',         url: 'noodrops.com.br',           live: true },
  { id: 'brechodonhanha', name: 'Brechó do Nhanha', url: 'brechodonhanha.com.br',     from: '#9D174D', to: '#500724', tag: 'moda circular' },
  { id: 'ipecas',         name: 'IPeças',           url: 'ipecasdaconstrucao.com.br', from: '#0369A1', to: '#0C4A6E', tag: 'peças & construção' },
];

const SCENARIOS = [
  {
    icon: ShoppingCart,
    title: 'Loja nova do zero',
    desc: 'Ainda não vende online. A gente sobe sua loja com pagamento, frete, fiscal e marketing já configurados.',
  },
  {
    icon: RefreshCw,
    title: 'Migração de plataforma',
    desc: 'Sua loja está numa plataforma que não escala mais. Levamos catálogo, clientes e SEO sem perder ranking.',
  },
  {
    icon: TrendingUp,
    title: 'Otimização de conversão',
    desc: 'Tem tráfego mas converte pouco. Auditoria de funil, melhorias de UX, A/B testing e checkout otimizado.',
  },
];

const RESULTS = [
  { value: '+R$ 150k', label: 'faturamento mensal · Ponto Patta' },
  { value: '+R$ 80k',  label: 'faturamento mensal · Noodrops' },
  { value: '4–8 sem',  label: 'do briefing à loja no ar' },
];

const PLATFORMS = [
  {
    name: 'WooCommerce',
    use: 'Catálogos médios/grandes, controle total de plugins e SEO. Ideal quando você quer flexibilidade brasileira.',
  },
  {
    name: 'Shopify',
    use: 'Lojas DTC com tráfego pago intenso. Setup rápido, apps maduros, foco em conversão.',
  },
  {
    name: 'Custom (Next.js)',
    use: 'Quando o negócio precisa de algo único — assinaturas, configurador de produto, integração pesada com ERP.',
  },
];

const HOW = [
  {
    icon: Search,
    title: 'Diagnóstico da operação',
    desc: 'Catálogo, gateway, fiscal, frete, ERP. Mapeamos o que já existe e o que precisa entrar. Saída: plano de plataforma e integrações.',
  },
  {
    icon: PenTool,
    title: 'Construção da loja',
    desc: 'Design focado em conversão, integração de pagamento + frete + fiscal, painel de admin destravado e testes de checkout.',
  },
  {
    icon: Rocket,
    title: 'Go-live + crescimento',
    desc: 'Lançamento monitorado, configuração de pixels e e-mail marketing, primeiros 30 dias acompanhados de perto.',
  },
];

export default async function EcommercePage({
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
        <ProdutosHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-20 lg:pb-28">
          <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.5rem] font-bold leading-[1.06] tracking-[-0.03em] mb-6">
                <span className="block mb-1">Loja virtual que</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">vende sozinha.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl mx-auto mb-8">
                Do catálogo ao checkout, com pagamento, frete e marketing integrados. Construímos lojas que faturam R$80k a R$150k por mês — calcule seu projeto abaixo.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Calcular minha loja
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>
          </div>

          <Reveal delay={280} distance={32}>
            <BrowserShowcase slides={STORE_SLIDES} />
          </Reveal>
        </div>
      </section>

      {/* ── Resultados ── */}
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

      {/* ── Cenários ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="01" label="Para qual cenário" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Três cenários,{' '}
              <span className="font-bricolage">o mesmo cuidado.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {SCENARIOS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <s.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">
                    {s.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {s.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plataformas ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="02" label="Plataformas que usamos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4 max-w-2xl">
              Cada loja tem a plataforma{' '}
              <span className="font-bricolage">que faz sentido.</span>
            </h2>
            <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mb-12">
              Não casamos com uma plataforma só. Recomendamos com base em catálogo, ticket médio e modelo de venda.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
            {PLATFORMS.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <div
                  className="rounded-xl border border-black/[0.08] p-5 lg:p-6 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <p className="font-bricolage text-[16px] font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" strokeWidth={1.7} />
                    {p.name}
                  </p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {p.use}
                  </p>
                </div>
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
              <span className="font-bricolage">até a loja vender sozinha.</span>
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
                Monte sua loja,{' '}
                <span className="font-bricolage">veja o investimento na hora.</span>
              </h2>
              <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed">
                Quatro perguntas para entender seu cenário. No final você vê a faixa estimada e pode pedir a proposta detalhada.
              </p>
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
