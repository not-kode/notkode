import { setRequestLocale } from 'next-intl/server';
import {
  ArrowDown, Layout, FileText, BookOpen, Globe2, Search, PenTool, Rocket,
  Sparkles, Code2, Wand2, Gauge as GaugeIcon,
  RefreshCw, FlaskConical, ShieldCheck,
} from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProdutosHeroBackground } from '@/components/produtos-digitais/produtos-hero-background';
import { StackedShowcase, type StackSlide } from '@/components/ui/stacked-showcase';
import { SitesPricingForm } from '@/components/sites/sites-pricing-form';
import { ProductFAQ } from '@/components/ui/product-faq';

const SITES_FAQS = [
  {
    q: 'Quanto tempo até o site estar no ar?',
    a: 'Entre 2 e 4 semanas para landing pages e sites institucionais médios. Sites com blog ou multilíngue podem levar 5 a 8 semanas. Na primeira conversa estimamos o seu caso.',
  },
  {
    q: 'Preciso já ter logo e identidade visual?',
    a: 'Não, mas ajuda. Se não tiver, fazemos o brandbook simples junto (logo, paleta, tipografia, aplicações básicas) como combo. Veja a página de Identidade & Brandbook.',
  },
  {
    q: 'Framer, WordPress ou Next.js: como vocês decidem?',
    a: 'Pelo objetivo, não pela ferramenta. Framer quando marketing quer publicar sozinho com animações ricas. WordPress quando há blog volumoso ou equipe acostumada. Next.js quando performance, SEO técnico ou integração custom importam. Mostramos os trade-offs antes de fechar.',
  },
  {
    q: 'O domínio fica no meu nome? E a hospedagem?',
    a: 'Tudo no seu nome. Domínio, conta de hospedagem, credenciais. A Notkode não trava nada. Se um dia você decidir trocar de fornecedor, sai com tudo na mão.',
  },
  {
    q: 'E o conteúdo (textos, imagens)? Vocês fazem ou eu?',
    a: 'Depende do escopo. No pacote padrão fazemos a estrutura e copy de cada página com base em briefing seu. Imagens próprias são bem-vindas; se não tiver, usamos banco de imagens curado ou contratamos foto/render à parte.',
  },
  {
    q: 'Como funciona a manutenção depois do site no ar?',
    a: 'Plano mensal opcional que cobre atualizações de conteúdo (trocar copy, imagens, criar nova seção), testes A/B de hero e copy, e manutenção técnica (segurança, performance, uptime). Sem fidelidade, e você pode pausar quando quiser.',
  },
];

const SITE_SLIDES: StackSlide[] = [
  { id: 'propay',  name: 'ProPay',              url: 'propay.com.br',           image: '/images/portfolio/propay.jpg',  segment: 'RH & folha' },
  { id: 'solojet', name: 'Solojet Aviação',     url: 'solojetaviacao.com.br',   image: '/images/portfolio/solojet.jpg', segment: 'aviação executiva' },
  { id: 'azure',   name: 'Azure Investimentos', url: 'azureinvestimentos.com',  image: '/images/portfolio/azure.jpg',   segment: 'assessoria BTG' },
  { id: 'simbos',  name: 'SimbOS',              url: 'simbos.vercel.app',       image: '/images/portfolio/simbos.jpg',  segment: 'SaaS · AI workspace' },
];

const TYPES = [
  {
    icon: Layout,
    scenario: 'Sua marca está nascendo ou ganhando cara nova.',
    recommendation: 'Site institucional',
    oneLiner: 'A vitrine que faz a marca parecer maior do que o time é hoje.',
  },
  {
    icon: FileText,
    scenario: 'Você roda ads e o lead precisa cair direto no funil.',
    recommendation: 'Landing Page',
    oneLiner: 'Uma página, uma missão: converter. Pronta pra rodar campanha na segunda.',
  },
  {
    icon: BookOpen,
    scenario: 'Você quer aparecer no Google sem brigar com ad budget.',
    recommendation: 'Site + Blog',
    oneLiner: 'Tráfego orgânico que não depende de verba de mídia.',
  },
  {
    icon: Globe2,
    scenario: 'Seu cliente fala outro idioma, ou vai falar logo.',
    recommendation: 'Site multilíngue',
    oneLiner: 'Tradução tratada como conteúdo, não como Google Translate.',
  },
];

const STATS = [
  { value: '2–4 sem', label: 'do briefing ao site no ar' },
  { value: '60+',     label: 'sites entregues' },
  { value: '95+',     label: 'pontuação média no PageSpeed' },
];

const AI_PILLARS = [
  { Icon: Wand2,     label: 'Design',  desc: 'Direção visual e UI prototipadas com IA antes da primeira linha de código.' },
  { Icon: Code2,     label: 'Código',  desc: 'Stack custom em Next.js, gerado e revisado por humano com IA acelerando cada etapa.' },
  { Icon: Sparkles,  label: 'Copy',    desc: 'Texto que vende, escrito junto, calibrado por dado e teste, não por achismo.' },
  { Icon: GaugeIcon, label: 'Otimização', desc: 'SEO, performance e responsivo aplicados desde o primeiro commit.' },
];

const MAINTENANCE = [
  { Icon: RefreshCw,    label: 'Atualizações de conteúdo', desc: 'Trocar copy, imagens, criar nova página ou seção sem refazer proposta a cada vez.' },
  { Icon: FlaskConical, label: 'Testes de hero e copy',    desc: 'A/B tests pra saber o que converte. Decisão por dado, não por achismo.' },
  { Icon: ShieldCheck,  label: 'Manutenção técnica',       desc: 'Segurança, uptime, performance e correções monitoradas, pra você não precisar pensar nisso.' },
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
                  poucas <span className="font-bricolage">semanas.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl mx-auto mb-8">
                LP pra campanha que começa segunda, ou institucional que vai com a marca nova. A gente desenha pelo objetivo do seu cliente, não pelo template que dá menos trabalho.
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
            <StackedShowcase slides={SITE_SLIDES} />
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

      {/* ── Tipos como decisão (cenário → recomendação) ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">A escolha <span className="font-bricolage">não é</span> de template.</span>
                <span className="block font-bricolage">É de momento.</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-text-secondary max-w-2xl mx-auto">
                Antes de pensar em ferramenta, entenda em qual desses quatro momentos sua marca está. O formato certo cai sozinho.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {TYPES.map((t, i) => (
              <Reveal key={t.recommendation} delay={i * 90}>
                <article
                  className="group h-full rounded-2xl border border-black/[0.08] p-6 lg:p-7 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <t.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim">
                      Cenário {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="text-[16px] lg:text-[17px] font-semibold text-text-primary leading-snug mb-5">
                    {t.scenario}
                  </p>

                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
                      A gente entrega
                    </span>
                    <span className="h-px flex-1 bg-primary/20" />
                  </div>
                  <p className="font-bricolage text-[20px] lg:text-[22px] font-semibold text-text-primary mb-2">
                    {t.recommendation}
                  </p>
                  <p className="text-[13px] lg:text-[14px] text-text-secondary leading-snug">
                    {t.oneLiner}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Construção com IA: o foco real da Notkode em 2026 ── */}
      <section className="relative bg-surface-elevated overflow-hidden">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block font-bricolage">Construído com IA,</span>
                <span className="block">de ponta a ponta.</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                IA aplicada no processo, do design ao código, da copy à otimização. É por isso que entregamos em 2 a 4 semanas o que outras agências levam três meses. Sem comprometer qualidade.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {AI_PILLARS.map(({ Icon, label, desc }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div className="h-full text-center px-5 py-7 lg:py-8 rounded-2xl border border-black/[0.08] bg-white/40">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
                  </div>
                  <p className="font-bricolage text-[17px] font-semibold text-text-primary mb-2">
                    {label}
                  </p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400}>
            <p className="text-center text-[13px] text-text-muted max-w-xl mx-auto mt-10">
              Cliente que prefere Framer ou WordPress, a gente atende. Mas o default é construção custom acelerada por IA.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Como entregamos ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="03" label="Como entregamos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Três etapas do briefing <span className="font-bricolage">ao ar.</span>
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

      {/* ── Manutenção contínua: produto que a Notkode vende além do go-live ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Site no ar é o <span className="font-bricolage">começo</span>,</span>
                <span className="block font-bricolage">não o fim.</span>
              </h2>
              <p className="mt-5 text-[16px] lg:text-[17px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Plano de manutenção opcional pra deixar o site evoluindo com o negócio. Sem chamar uma nova proposta toda vez que precisar trocar uma seção ou testar um hero novo.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {MAINTENANCE.map(({ Icon, label, desc }, i) => (
              <Reveal key={label} delay={i * 90}>
                <div className="h-full p-6 lg:p-7 rounded-2xl border border-black/[0.08] bg-white/40">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <p className="font-bricolage text-[17px] font-semibold text-text-primary mb-2">
                    {label}
                  </p>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beat 6: objeções comuns de quem vai contratar site ── */}
      <ProductFAQ
        title={<><span className="block">O que todo cliente</span><span className="block font-bricolage">pergunta antes de fechar.</span></>}
        faqs={SITES_FAQS}
        surface="base"
      />

      {/* ── Pricing form ── */}
      <section id="orcamento" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Monte seu site,</span>
                <span className="block font-bricolage">veja a faixa na hora.</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
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
