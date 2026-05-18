import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Loja virtual sob medida · Notkode',
  description:
    'Loja com sistema próprio: checkout, CRM e operação inteira dentro do seu domínio. Sem alugar peça por peça. Quando o orçamento ainda não cabe, partimos de Shopify, WooCommerce ou Nuvemshop.',
};
import { ArrowDown, ShoppingCart, RefreshCw, Cpu, CreditCard, Search, PenTool, Rocket } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProdutosHeroBackground } from '@/components/produtos-digitais/produtos-hero-background';
import { StackedShowcase, type StackSlide } from '@/components/ui/stacked-showcase';
import { EcommercePricingForm } from '@/components/ecommerce/ecommerce-pricing-form';
import { PainNamingBlock } from '@/components/ui/pain-naming-block';
import { ProductFAQ } from '@/components/ui/product-faq';
import { BrandbookCombo } from '@/components/ui/brandbook-combo';

const FRANKENSTEIN_LINES = [
  { text: 'Plataforma de loja (Shopify, Yampi, Loja Integrada…)', metric: 'R$ 600–1.200/mês' },
  { text: 'App de cupom + recuperação de carrinho', metric: 'R$ 200–350/mês' },
  { text: 'App de frete inteligente', metric: 'R$ 150–300/mês' },
  { text: 'Gateway de pagamento', metric: '3,4% por transação' },
  { text: 'ERP + integrador', metric: 'R$ 350–600/mês' },
  { text: 'Plugins avulsos (review, pop-up, SEO, fiscal…)', metric: 'R$ 150–250/mês' },
];

const ECOMMERCE_FAQS = [
  {
    q: 'Qual a diferença entre loja com plataforma e loja com sistema próprio?',
    a: 'Plataforma é aluguel: mensalidade fixa mais percentual sobre tudo que vende, e você fica preso ao ecossistema de quem aluga. Sistema próprio é investimento único: checkout, CRM e operação dentro de uma base que ninguém cobra royalty. Recomendamos começar pela plataforma quando o orçamento pede, e migrar pro sistema próprio quando a operação justifica.',
  },
  {
    q: 'Já estou na Shopify (ou Yampi, Nuvemshop…). Preciso migrar tudo?',
    a: 'Não obrigatoriamente. Em muitos casos a gente integra o que falta (ERP, automações, CRM próprio) e mantém a plataforma atual rodando. Migração só quando o custo mensal já dói e o catálogo justifica.',
  },
  {
    q: 'Perco SEO e ranking na migração?',
    a: 'Não. Mapeamos todas as URLs antigas, fazemos redirecionamento 301, mantemos estrutura de palavras-chave e monitoramos ranking nas primeiras 4 semanas. Na maioria das migrações o tráfego se mantém ou cresce.',
  },
  {
    q: 'E meus dados de cliente, vão pra onde?',
    a: 'Você é dono do banco. Migramos clientes, histórico de pedidos e cupons. O CRM fica seu, sem assinatura de plataforma cobrando pelo seu próprio dado.',
  },
  {
    q: 'Quanto tempo até a loja estar no ar?',
    a: 'Entre 4 e 8 semanas. Loja nova do zero leva mais tempo que migração ou otimização. Na primeira conversa estimamos o prazo do seu caso.',
  },
  {
    q: 'E se eu quiser trocar de fornecedor depois?',
    a: 'Troca. O código é seu, a hospedagem é sua, o banco é seu. Sem fidelidade, sem refém. Qualquer dev consegue continuar o trabalho.',
  },
];

const STORE_SLIDES: StackSlide[] = [
  { id: 'noodrops', name: 'Noodrops',   url: 'noodrops.com.br',       image: '/images/portfolio/noodrops.jpg', segment: 'nootrópicos' },
  { id: 'donanha',  name: 'Dona Nhá',   url: 'donanhabrecho.com.br',  image: '/images/portfolio/donanha.jpg',  segment: 'brechó / moda' },
];

const SCENARIOS = [
  {
    icon: Cpu,
    title: 'Loja + sistema próprio',
    desc: 'Checkout, CRM, gestão de pedidos e estoque rodando dentro do seu sistema. Pra quem quer sair do aluguel de plataforma de vez.',
    flagship: true,
  },
  {
    icon: ShoppingCart,
    title: 'Loja com plataforma',
    desc: 'Vitrine personalizada em Shopify, WooCommerce ou Nuvemshop, com pagamento, frete, fiscal e marketing já configurados. Caminho de entrada antes do sistema próprio.',
  },
  {
    icon: RefreshCw,
    title: 'Migração de plataforma',
    desc: 'Sua loja está numa plataforma que não escala mais. Levamos catálogo, clientes e SEO sem perder ranking.',
  },
];

const RESULTS = [
  { value: '4–8 sem', label: 'do briefing à loja no ar' },
  { value: '100%',    label: 'do código é seu · sem fidelidade' },
  { value: '0%',      label: 'royalty sobre suas vendas' },
];

const PLATFORMS = [
  {
    name: 'WooCommerce',
    use: 'Catálogos médios e grandes, controle total de plugins e SEO. Boa quando você quer flexibilidade pra integrar fiscal, ERP e marketing BR.',
  },
  {
    name: 'Shopify',
    use: 'Lojas DTC com tráfego pago intenso. Setup rápido, apps maduros, foco em conversão.',
  },
  {
    name: 'Nuvemshop',
    use: 'Operação enxuta focada no mercado brasileiro. Integrações fiscais e logísticas BR já maduras, curva de aprendizado curta.',
  },
];

const HOW = [
  {
    icon: Search,
    title: 'Diagnóstico da operação',
    desc: 'Catálogo, gateway, fiscal, frete, ERP. Mapeamos o que já existe e o que precisa entrar. Saída: plano técnico (plataforma ou sistema próprio) e cronograma.',
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
                  vende <span className="font-bricolage">sozinha.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl mx-auto mb-8">
                Loja virtual com sistema próprio: checkout, CRM e operação inteira dentro do seu domínio, sem alugar peça por peça. Quando o orçamento ainda não cabe, começamos por Shopify, WooCommerce ou Nuvemshop e migramos quando a loja crescer. Monte o esboço do seu projeto abaixo.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Montar meu projeto
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>
          </div>

          <Reveal delay={280} distance={32}>
            <StackedShowcase slides={STORE_SLIDES} />
          </Reveal>
        </div>
      </section>

      {/* ── Beat 2: Frankenstein de assinaturas — nomeia a dor do ICP ── */}
      <PainNamingBlock
        title={<><span className="block">Sua loja virou um</span><span className="block font-bricolage">Frankenstein de assinaturas.</span></>}
        intro="Plataforma, app de cupom, app de frete, gateway, ERP, plugin disso, plugin daquilo. Cada um cobra. Cada um cresce com o faturamento. Cada um tira um pedaço da margem antes de você ver o lucro."
        variant="tally"
        surface="base"
        pains={FRANKENSTEIN_LINES}
        footer={
          <div className="max-w-2xl rounded-2xl border border-black/[0.08] bg-white/40 px-6 py-5 lg:px-8 lg:py-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim mb-2">
              Conta típica de uma loja com bom volume
            </p>
            <p className="text-[15px] lg:text-[16px] text-text-primary leading-snug">
              <span className="font-semibold">R$ 1.500 a R$ 3.000/mês fixos</span>, mais{' '}
              <span className="font-semibold">3,4% sobre tudo que vende</span>. Numa loja com sistema próprio, isso vira investimento único, sem teto de crescimento e sem alugar pedaços da sua operação.
            </p>
          </div>
        }
      />

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
              Três cenários, o mesmo <span className="font-bricolage">cuidado.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {SCENARIOS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <article
                  className="relative rounded-2xl p-6 lg:p-7 h-full"
                  style={{
                    background: s.flagship
                      ? 'linear-gradient(180deg, rgba(59,130,246,0.06) 0%, hsl(55 100% 97%) 70%)'
                      : 'hsl(55 100% 97%)',
                    border: s.flagship ? '1.5px solid rgba(59,130,246,0.35)' : '1px solid rgba(25,25,24,0.08)',
                  }}
                >
                  {s.flagship && (
                    <span className="absolute top-4 right-4 font-mono text-[9px] text-primary uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)' }}>
                      caminho default
                    </span>
                  )}
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
            <SectionMarker number="02" label="Quando começar pela plataforma" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4 max-w-2xl">
              Nem todo projeto começa com{' '}
              <span className="font-bricolage">sistema próprio.</span>
            </h2>
            <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mb-12">
              Quando o orçamento ainda pede um primeiro passo mais acessível, partimos por uma destas plataformas e migramos pro sistema próprio quando a loja crescer. Mesmo cuidado de design, integrações e operação.
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
              Três etapas até a loja vender <span className="font-bricolage">sozinha.</span>
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

      {/* ── Beat 6: objeções específicas de e-commerce ── */}
      <ProductFAQ
        title={<><span className="block">Perguntas que todo dono</span><span className="block font-bricolage">de loja faz.</span></>}
        faqs={ECOMMERCE_FAQS}
        surface="elevated"
      />

      <BrandbookCombo companion="loja" surface="elevated" />

      {/* ── Pricing form ── */}
      <section id="orcamento" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Monte seu projeto,</span>
                <span className="block font-bricolage">veja o esboço de investimento.</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Seis perguntas pra mapear seu cenário. No final você vê o escopo organizado e uma faixa preliminar; o valor exato a gente fecha junto na conversa.
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
