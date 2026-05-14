import { setRequestLocale } from 'next-intl/server';
import { ArrowDown, Layout, FileText, BookOpen, Globe2, Gauge, Search, PenTool, Rocket } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProdutosHeroBackground } from '@/components/produtos-digitais/produtos-hero-background';
import { BrowserShowcase, type ShowcaseSlide } from '@/components/ui/browser-showcase';
import { SitesPricingForm } from '@/components/sites/sites-pricing-form';

const SITE_SLIDES: ShowcaseSlide[] = [
  { id: 'propay',  name: 'ProPay',          url: 'propay.com.br',          embedUrl: 'https://propay.com.br',           live: true },
  { id: 'solojet', name: 'Solojet Aviação', url: 'solojetaviacao.com.br',  embedUrl: 'https://www.solojetaviacao.com.br', live: true },
  { id: 'simbos',  name: 'SimbOS',          url: 'simbos.com',             embedUrl: 'https://simbos.com',              live: true },
  { id: 'blindy',  name: 'Blindy',          url: 'blindy.com.br',          embedUrl: 'https://www.blindy.com.br',       live: true },
];

const TYPES = [
  {
    icon: FileText,
    title: 'Landing Page',
    desc: 'Uma página focada em uma só ação: conversão. Ideal para campanhas pagas, lançamentos e captação de leads.',
    examples: 'Hero · Prova social · CTA · Formulário',
  },
  {
    icon: Layout,
    title: 'Site Institucional',
    desc: 'Apresentação completa da empresa — sobre, serviços, cases e contato. A vitrine digital do negócio.',
    examples: 'Azure · Solojet · Peki · Cotton',
  },
  {
    icon: BookOpen,
    title: 'Site + Blog',
    desc: 'Institucional com área editorial integrada. SEO de longo prazo + autoridade de conteúdo.',
    examples: 'Sanity / WordPress · GA4 · RSS',
  },
  {
    icon: Globe2,
    title: 'Site Multilíngue',
    desc: 'Conteúdo em PT, EN e mais idiomas — pronto para audiência internacional desde o dia 1.',
    examples: 'i18n · hreflang · CDN global',
  },
];

const STATS = [
  { value: '2–4 sem', label: 'do briefing ao site no ar' },
  { value: '60+',     label: 'sites entregues' },
  { value: '95+',     label: 'pontuação média no PageSpeed' },
];

const STACK = [
  {
    name: 'Framer',
    use: 'Sites institucionais com animações ricas e CMS visual. Bom para marketing que quer publicar sozinho.',
  },
  {
    name: 'Next.js',
    use: 'Quando performance, SEO técnico ou integração custom importam. Nossa escolha default para projetos sérios.',
  },
  {
    name: 'WordPress',
    use: 'Sites com blog volumoso ou equipe já acostumada com WP. Plugins maduros para SEO e conteúdo.',
  },
];

const HOW = [
  {
    icon: Search,
    title: 'Briefing & Arquitetura',
    desc: 'Entendemos o objetivo do site, público e estrutura de páginas. Saída: sitemap + wireframe de cada página.',
  },
  {
    icon: PenTool,
    title: 'Design & Desenvolvimento',
    desc: 'UI no Figma, código limpo, SEO técnico e responsivo do início. Revisões semanais antes do go-live.',
  },
  {
    icon: Rocket,
    title: 'Lançamento & Crescimento',
    desc: 'Subimos no ar, configuramos analytics e te treinamos para editar conteúdo. Suporte nos primeiros 30 dias.',
  },
];

export default async function SitesPage({
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
                <span className="block mb-1">Seu site no ar em</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">poucas semanas.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl mx-auto mb-8">
                Landing pages, sites institucionais e blogs construídos sob medida — sem template, com performance, SEO e copy de verdade. Calcule o investimento abaixo.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Calcular meu site
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>
          </div>

          <Reveal delay={280} distance={32}>
            <BrowserShowcase slides={SITE_SLIDES} />
          </Reveal>
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

      {/* ── Tipos ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="01" label="O que construímos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Quatro formatos.{' '}
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

      {/* ── Stack ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="02" label="Stack que usamos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4 max-w-2xl">
              A tecnologia certa{' '}
              <span className="font-bricolage">para cada caso.</span>
            </h2>
            <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mb-12">
              Escolhemos a plataforma certa para seu objetivo — não te empurramos para o que dá mais comissão.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
            {STACK.map((s, i) => (
              <Reveal key={s.name} delay={i * 80}>
                <div
                  className="rounded-xl border border-black/[0.08] p-5 lg:p-6 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <p className="font-bricolage text-[16px] font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" strokeWidth={1.7} />
                    {s.name}
                  </p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {s.use}
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
              <span className="font-bricolage">do briefing ao ar.</span>
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
                Monte seu site,{' '}
                <span className="font-bricolage">veja a faixa na hora.</span>
              </h2>
              <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed">
                Quatro perguntas curtas. No final você vê o investimento estimado e pode pedir a proposta detalhada.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <SitesPricingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
