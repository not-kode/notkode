import { setRequestLocale } from 'next-intl/server';
import { ArrowDown, Bot, Workflow, MessageSquare, Zap, Search, PenTool, Rocket } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ParceriasHeroBackground } from '@/components/parcerias/parcerias-hero-background';
import { AutomationFlowDiagram } from '@/components/agentes-automacao/flow-diagram';
import { AgentesPricingForm } from '@/components/agentes-automacao/agentes-pricing-form';
import { TimeDrainSection } from '@/components/agentes-automacao/time-drain-section';
import { ProductFAQ } from '@/components/ui/product-faq';

const AGENTES_FAQS = [
  {
    q: 'WhatsApp oficial é obrigatório?',
    a: 'Não. A API oficial faz sentido quando o cliente já tem volume e verba pra arcar com os custos (a Meta cobra por mensagem e o ciclo de aprovação é mais longo). Pra automação interna ou volume menor, integramos com outros canais (e-mail, Telegram, formulário) sem esse overhead.',
  },
  {
    q: 'Vai funcionar com o CRM/ERP que eu já uso?',
    a: 'Sim, na grande maioria dos casos. Trabalhamos com qualquer ferramenta que tenha API ou webhook (RD, HubSpot, Pipedrive, Bling, Omie, Tiny, planilha Google, Notion, Airtable…). Se não tiver, escrevemos a ponte.',
  },
  {
    q: 'Posso ajustar a automação depois, sem chamar vocês?',
    a: 'Sim. Entregamos com documentação e treinamento do seu time. Quem usa n8n/Make consegue mexer em respostas, gatilhos e mensagens sem precisar de dev. Mudanças estruturais maiores valem uma conversa com a gente.',
  },
  {
    q: 'Quanto tempo até a primeira automação estar rodando?',
    a: 'Automações simples ficam prontas em 1 a 2 semanas. Integrações com IA, agentes complexos ou pilhas com muitas ferramentas chegam a 4–6 semanas. Na primeira conversa estimamos o seu caso.',
  },
  {
    q: 'E se o cliente perguntar algo que o agente não sabe responder?',
    a: 'O agente nunca finge. Quando não tem confiança na resposta, transfere pra um humano com o contexto da conversa já anexado. Seu time recebe o lead já meio resolvido, não do zero.',
  },
];

const USE_CASES = [
  {
    icon: MessageSquare,
    title: 'Atendimento via WhatsApp',
    desc: 'Agente que responde dúvidas comuns, qualifica leads e passa para o time só quando precisa de humano.',
  },
  {
    icon: Workflow,
    title: 'Integração entre sistemas',
    desc: 'Fluxos n8n que conectam CRM, financeiro, e-mail e planilhas, sem precisar copiar dado de um lugar para outro.',
  },
  {
    icon: Bot,
    title: 'Assistente interno com IA',
    desc: 'Um bot que sua equipe usa para consultar dados, gerar relatórios e fazer tarefas repetitivas em segundos.',
  },
  {
    icon: Zap,
    title: 'Automação de tarefas',
    desc: 'De preencher planilha a enviar e-mail de cobrança. O que sua equipe faz manual pode rodar sozinho.',
  },
];

const RESULTS = [
  { value: '10–40h', label: 'liberadas por semana na operação' },
  { value: '~2 sem',  label: 'do briefing ao agente em produção' },
  { value: '24/7',    label: 'cobertura sem contratar ninguém' },
];

const STACK = [
  { name: 'n8n',                  use: 'Orquestração de fluxos entre sistemas. Nosso default para automação séria.' },
  { name: 'Make / Zapier',        use: 'Automação rápida quando o fluxo cabe em conectores prontos.' },
  { name: 'OpenAI · Claude',      use: 'Modelos de linguagem para classificar mensagens, redigir respostas e raciocinar.' },
  { name: 'WhatsApp Business API',use: 'Mensagens transacionais e conversacionais com o cliente, com selo oficial.' },
  { name: 'Google Sheets / Drive',use: 'Banco improvisado simples e acessível para o cliente conferir/editar.' },
  { name: 'Notion · Airtable',    use: 'Bases estruturadas quando o time já vive nessas ferramentas.' },
  { name: 'APIs custom',          use: 'Quando o sistema do cliente não tem conector, escrevemos a ponte.' },
];

const HOW = [
  {
    icon: Search,
    title: 'Mapeamento',
    desc: 'Mergulhamos no fluxo atual: o que sua equipe faz, em quais ferramentas, onde trava. Saída: um diagrama do antes/depois.',
  },
  {
    icon: PenTool,
    title: 'Desenho do agente',
    desc: 'Definimos gatilhos, decisões, integrações e quando o humano entra. Você aprova antes da gente codar.',
  },
  {
    icon: Rocket,
    title: 'Entrega + handoff',
    desc: 'Subimos em produção, monitoramos a primeira semana e treinamos seu time para operar sozinho.',
  },
];

export default async function AgentesAutomacaoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* ── Hero — split: text left + chat visual right ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <ParceriasHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-20 lg:pb-24">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-center">

            {/* LEFT — text + CTA */}
            <Reveal className="min-w-0">
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-5 break-words">
                <span className="block mb-1">Sua equipe parou de fazer</span>
                <span className="block">
                  o que a <span className="font-bricolage">máquina</span> faz melhor.
                </span>
              </h1>
              <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-7">
                Chatbots inteligentes, agentes de IA e automações que respondem clientes, organizam pedidos e eliminam tarefas repetitivas. Veja a faixa de investimento na hora.
              </p>
              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Calcular meu projeto
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>

            {/* RIGHT — automation flow diagram */}
            <Reveal delay={200} direction="left" distance={32}>
              <AutomationFlowDiagram />
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── Beat 2: onde o tempo da equipe vaza (com flow animado) ── */}
      <TimeDrainSection />

      {/* ── Resultados típicos ── */}
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

      {/* ── Casos de uso ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="01" label="Casos de uso comuns" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Onde a automação faz mais <span className="font-bricolage">diferença.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {USE_CASES.map((uc, i) => (
              <Reveal key={uc.title} delay={i * 90}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <uc.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">
                    {uc.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {uc.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack que usamos ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="02" label="Stack que usamos" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4 max-w-2xl">
              As ferramentas certas para cada <span className="font-bricolage">caso.</span>
            </h2>
            <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mb-12">
              Não casamos com um único stack. Escolhemos a ferramenta certa para o problema certo, e te entregamos uma documentação clara de como tudo funciona.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {STACK.map((s, i) => (
              <Reveal key={s.name} delay={i * 60}>
                <div
                  className="rounded-xl border border-black/[0.08] p-5 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <p className="font-bricolage text-[15px] font-semibold text-text-primary mb-1.5">
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
              Três passos do briefing à <span className="font-bricolage">operação.</span>
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
                      <step.icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.7} />
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

      {/* ── Beat 6: objeções específicas de automação ── */}
      <ProductFAQ
        title={<><span className="block">O que todo dono</span><span className="block font-bricolage">pergunta antes de começar.</span></>}
        faqs={AGENTES_FAQS}
        surface="elevated"
      />

      {/* ── Pricing form ── */}
      <section id="orcamento" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">Monte o escopo,</span>
                <span className="block font-bricolage">veja a faixa na hora.</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Quatro perguntas curtas para entender o que você precisa. No final você vê a faixa de investimento e pode pedir a proposta detalhada.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <AgentesPricingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
