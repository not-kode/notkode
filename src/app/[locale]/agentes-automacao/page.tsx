import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Agentes de IA e automações · Notkode',
  description:
    'Chatbots, agentes de IA e automações que respondem clientes, organizam pedidos e eliminam tarefas repetitivas. Cliente atendido, pedido organizado, cobrança feita, sem precisar de você.',
};
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
    a: 'Não. Faz sentido quando você já tem volume alto de mensagem e quer o selo verde oficial (aí a Meta cobra por mensagem). Pra automação interna ou volume menor, dá pra fazer com outros canais (e-mail, formulário, Telegram) sem esse custo.',
  },
  {
    q: 'Vai funcionar com o sistema que eu já uso?',
    a: 'Sim, na grande maioria dos casos. Conectamos no CRM, no ERP, na planilha do Google, no Notion, na agenda. Se você usa HubSpot, RD, Pipedrive, Bling, Omie, Tiny ou qualquer ferramenta conhecida, integramos. Sistema mais incomum a gente avalia na conversa.',
  },
  {
    q: 'Posso ajustar a automação depois sem chamar vocês?',
    a: 'Sim. Entregamos com documentação e treinamento do seu time. Mexer em mensagem, gatilho ou resposta a equipe consegue sozinha. Mudança maior na lógica vale uma conversa com a gente.',
  },
  {
    q: 'Quanto tempo até a primeira automação estar rodando?',
    a: 'Automação simples fica pronta em 1 a 2 semanas. Agente com IA e várias integrações pode chegar a 4 a 6 semanas. Na primeira conversa a gente estima o seu caso com base no que você precisa.',
  },
  {
    q: 'E se o cliente perguntar algo que o agente não sabe responder?',
    a: 'O agente nunca inventa. Quando não tem certeza, passa pra alguém do seu time com a conversa já anotada. Seu time recebe o lead meio resolvido, não do zero.',
  },
];

const USE_CASES = [
  {
    icon: MessageSquare,
    title: 'Atendimento no WhatsApp',
    desc: 'Responde dúvidas comuns na hora, qualifica o lead e só passa pro seu time quando precisa de gente. Funciona inclusive de madrugada.',
  },
  {
    icon: Workflow,
    title: 'Pedidos e clientes em um só lugar',
    desc: 'Dado que aparece no WhatsApp já entra na planilha ou no seu sistema, sem ninguém precisar copiar manualmente. Acabou a duplicação.',
  },
  {
    icon: Bot,
    title: 'Assistente interno do seu time',
    desc: 'Sua equipe pergunta em linguagem normal e o agente busca o dado, gera o relatório ou avisa o cliente. Em segundos.',
  },
  {
    icon: Zap,
    title: 'Cobrança e tarefas no piloto automático',
    desc: 'De cobrar atrasado a mandar lembrete de reunião. O que hoje é manual e cansa o time pode rodar sozinho.',
  },
];

const RESULTS = [
  { value: '10–40h', label: 'liberadas por semana na operação' },
  { value: '~2 sem',  label: 'do briefing ao agente em produção' },
  { value: '24/7',    label: 'cobertura sem contratar ninguém' },
];

const STACK = [
  { name: 'WhatsApp oficial',     use: 'Pra quem já tem volume e precisa do selo verde. Mensagens com o cliente direto na conta oficial da Meta.' },
  { name: 'Inteligência artificial', use: 'O cérebro do agente. Entende a mensagem do cliente, decide o que fazer e escreve a resposta no tom da sua marca.' },
  { name: 'Automação n8n',        use: 'A engrenagem que conecta um sistema ao outro. Sem ninguém precisar abrir aba, copiar e colar.' },
  { name: 'Planilhas e Drive',    use: 'Quando a operação ainda roda em Google Sheets, a gente integra. Você continua editando do jeito que já edita.' },
  { name: 'Seu CRM/ERP atual',    use: 'HubSpot, RD, Pipedrive, Bling, Omie, Tiny, Notion, Airtable. Conectamos no que você já usa.' },
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
    desc: 'Mostramos pra você como o agente vai responder, em quais momentos pergunta, quando passa pro humano. Você aprova antes da gente construir.',
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
                <span className="block mb-1">Cliente atendido, pedido organizado,</span>
                <span className="block">
                  cobrança feita, <span className="font-bricolage">sem precisar de você.</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-7">
                A gente automatiza o atendimento no WhatsApp, a organização dos pedidos, a cobrança e as tarefas repetitivas que comem o dia da sua equipe. Você ganha horas de volta e o cliente é respondido na hora, inclusive de madrugada.
              </p>
              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Montar meu projeto
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
            <SectionMarker number="02" label="O que tem por trás" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-4 max-w-2xl">
              Ferramentas conhecidas, no jeito{' '}
              <span className="font-bricolage">que faz sentido pra você.</span>
            </h2>
            <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mb-12">
              Não inventamos roda. Conectamos no que você já usa e escolhemos a tecnologia certa pro seu caso. Você recebe documentação clara de como tudo funciona, sem caixa-preta.
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
                <span className="block font-bricolage">veja a faixa preliminar.</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Quatro perguntas curtas pra mapear o que você precisa automatizar. No final você vê o escopo organizado e uma faixa preliminar; a proposta detalhada chega no seu WhatsApp em poucas horas.
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
