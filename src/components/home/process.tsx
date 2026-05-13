import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Search, Compass, Hammer, Rocket, type LucideIcon } from 'lucide-react';
import { SectionMarker } from '@/components/ui/section-marker';
import { Reveal } from '@/components/ui/reveal';
import { CircuitBg } from '@/components/ui/circuit-bg';

export async function Process({ locale, reverse = false }: { locale: string; reverse?: boolean }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  const steps: { num: string; title: string; desc: string; cmd: string; icon: LucideIcon }[] = [
    { num: '01', title: t('process1Title'), desc: t('process1Desc'), cmd: 'analyze', icon: Search },
    { num: '02', title: t('process2Title'), desc: t('process2Desc'), cmd: 'strategy', icon: Compass },
    { num: '03', title: t('process3Title'), desc: t('process3Desc'), cmd: 'build', icon: Hammer },
    { num: '04', title: t('process4Title'), desc: t('process4Desc'), cmd: 'launch', icon: Rocket },
  ];

  return (
    <section className="relative overflow-hidden bg-surface-base">
      <div className="absolute inset-0 -z-10 bg-grid-dots opacity-15" />

      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32 relative">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Text column — always 2nd on mobile, position based on reverse on desktop */}
          <div className={`order-2 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
            <Reveal>
              <SectionMarker number="04" label={t('processEyebrow')} />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-4 mt-4">
                Metodologia{' '}
                <span className="font-bricolage">{t('processTitle').replace('Metodologia ', '')}</span>
              </h2>
              <p className="text-base lg:text-lg text-text-secondary leading-relaxed mb-12">
                {t('processDesc')}
              </p>
            </Reveal>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <Reveal key={step.num} delay={i * 100}>
                  <div className="flex gap-5 items-start group">
                    {/* Icon circle */}
                    <div className="shrink-0 w-12 h-12 rounded-full bg-surface-elevated border border-black/[0.08] flex flex-col items-center justify-center group-hover:border-primary/40 transition-colors duration-300">
                      <step.icon className="w-4 h-4 text-primary" strokeWidth={1.6} />
                    </div>

                    {/* Text */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors duration-300">
                          {step.title}
                        </h3>
                        <span className="font-mono text-[10px] text-text-dim">{`> ${step.cmd}`}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Image column — always 1st on mobile, position based on reverse on desktop */}
          <Reveal delay={150} className={`order-1 ${reverse ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="lg:sticky lg:top-28">
              <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] aspect-[5/6] sm:aspect-[4/3]">
                {/* Photo */}
                <CircuitBg variant="card" />
                <Image
                  src="/images/generated/bg-hero.png"
                  alt=""
                  fill
                  className="object-cover"
                />
                {/* Warm tint */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'rgba(220,185,140,0.35)', mixBlendMode: 'multiply' }}
                />
                {/* Grain overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'url(/images/relace-ref/grain.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '648px auto',
                    mixBlendMode: 'multiply',
                    opacity: 0.7,
                  }}
                />
                {/* Code editor window overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-5 lg:p-8">
                  <div
                    className="w-full max-w-[340px] rounded-xl overflow-hidden shadow-2xl"
                    style={{
                      background: 'rgba(6,6,8,0.90)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Window chrome */}
                    <div className="flex items-center gap-1.5 px-4 h-9 border-b border-white/[0.06]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                      <span className="font-mono text-[10px] text-white/20 ml-3">projeto.md</span>
                    </div>
                    {/* Client status view — what the client receives */}
                    <div className="p-4 font-mono text-[11px] leading-[1.9] select-none">
                      <div className="text-white/30 mb-3">{'❯ notkode status --client=minha-empresa'}</div>

                      {/* Project info */}
                      <div className="mb-4 space-y-0.5">
                        <div className="flex gap-3">
                          <span className="text-white/25 w-16 shrink-0">Cliente</span>
                          <span className="text-white/60">Minha Empresa Ltda</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-white/25 w-16 shrink-0">Início</span>
                          <span className="text-white/60">Semana 1</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-white/25 w-16 shrink-0">Previsão</span>
                          <span className="text-primary">6 semanas</span>
                        </div>
                      </div>

                      {/* What the client receives */}
                      <div className="border-t border-white/[0.07] pt-3 mb-3">
                        <div className="text-white/25 mb-2 text-[9px] uppercase tracking-wider">o que você vai receber</div>
                        <div className="space-y-1">
                          <div><span className="text-[#22C55E]">✓</span><span className="text-white/55 ml-2">Sistema no seu domínio</span></div>
                          <div><span className="text-[#22C55E]">✓</span><span className="text-white/55 ml-2">Treinamento da equipe incluso</span></div>
                          <div><span className="text-[#22C55E]">✓</span><span className="text-white/55 ml-2">Código-fonte entregue</span></div>
                          <div><span className="text-[#22C55E]">✓</span><span className="text-white/55 ml-2">30 dias de suporte</span></div>
                        </div>
                      </div>

                      {/* This week */}
                      <div className="border-t border-white/[0.07] pt-3">
                        <div className="text-white/25 mb-2 text-[9px] uppercase tracking-wider">esta semana</div>
                        <div><span className="text-primary">→</span><span className="text-white/60 ml-2">Tela de CRM aprovada</span></div>
                        <div><span className="text-primary">→</span><span className="text-white/60 ml-2">Integração WhatsApp testada</span></div>
                        <div className="mt-2 text-white/30">{'> próxima entrega: sexta-feira'}<span className="cursor-blink">_</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FIG label */}
                <div className="absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                  FIG. 003
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
