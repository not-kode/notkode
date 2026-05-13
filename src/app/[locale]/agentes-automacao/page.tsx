import { setRequestLocale } from 'next-intl/server';
import { ArrowDown, Bot, Workflow, MessageSquare, Zap } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { InlineForm } from '@/components/ui/inline-form';
import { ParceriasHeroBackground } from '@/components/parcerias/parcerias-hero-background';
import { AgentesChatVisual } from '@/components/agentes-automacao/agentes-chat-visual';

const USE_CASES = [
  {
    icon: MessageSquare,
    title: 'Atendimento via WhatsApp',
    desc: 'Agente que responde dúvidas comuns, qualifica leads e passa para o time só quando precisa de humano.',
  },
  {
    icon: Workflow,
    title: 'Integração entre sistemas',
    desc: 'Fluxos n8n que conectam CRM, financeiro, e-mail e planilhas — sem precisar copiar dado de um lugar para outro.',
  },
  {
    icon: Bot,
    title: 'Assistente interno com IA',
    desc: 'Um bot que sua equipe usa para consultar dados, gerar relatórios e fazer tarefas repetitivas em segundos.',
  },
  {
    icon: Zap,
    title: 'Automação de tarefas',
    desc: 'De preencher planilha a enviar e-mail de cobrança — o que sua equipe faz manual pode rodar sozinho.',
  },
];

const RESULTS = [
  { value: '10–40h', label: 'liberadas por semana na operação' },
  { value: '~2 sem',  label: 'do briefing ao agente em produção' },
  { value: '24/7',    label: 'cobertura sem contratar ninguém' },
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
                  <span className="font-bricolage text-gradient">o que a máquina faz melhor.</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-7">
                Chatbots inteligentes, agentes de IA e automações que respondem clientes, organizam pedidos e eliminam tarefas repetitivas. Resposta em algumas horas — sem call obrigatória.
              </p>
              <a
                href="#comecar"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                Receber proposta
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>

            {/* RIGHT — chat visual */}
            <Reveal delay={200} direction="left" distance={32}>
              <AgentesChatVisual />
            </Reveal>

          </div>
        </div>
      </section>

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
              Onde a automação{' '}
              <span className="font-bricolage">faz mais diferença.</span>
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

      {/* ── Form inline ── */}
      <section id="comecar" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
            <Reveal>
              <SectionMarker number="02" label="Vamos começar" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-6">
                Conta o que você{' '}
                <span className="font-bricolage">precisa automatizar.</span>
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed">
                Sem agenda, sem call. Você descreve o desafio e recebe uma proposta no WhatsApp em algumas horas.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <InlineForm
                title="Receba uma proposta direta."
                subtitle="Preenche os 4 campos e a gente já te chama."
                serviceTag="agentes-automacao"
                needsPlaceholder="Ex: meu time gasta 4h/dia respondendo dúvidas básicas no WhatsApp. Queria um bot que filtra e só passa o que importa..."
              />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
