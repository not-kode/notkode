'use client';

import {
  FileSpreadsheet, Database, Mail, MessageSquare,
  ClipboardCopy, Repeat2, Receipt, UserCheck, ListChecks, MoonStar,
} from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

const STAGES = [
  { Icon: FileSpreadsheet, label: 'Planilha', color: '#10b981' },
  { Icon: Database,        label: 'CRM',      color: '#3b82f6' },
  { Icon: Mail,            label: 'E-mail',   color: '#f59e0b' },
  { Icon: MessageSquare,   label: 'WhatsApp', color: '#22c55e' },
];

const DRAINS = [
  { Icon: ClipboardCopy, text: 'Copiar dado de planilha pro CRM, do CRM pro e-mail, do e-mail pro WhatsApp.', metric: '5 a 8h/sem' },
  { Icon: Repeat2,       text: 'Responder o mesmo tipo de dúvida trinta vezes por semana.',                   metric: '4 a 6h/sem' },
  { Icon: Receipt,       text: 'Cobrar cliente atrasado, um por um, manualmente.',                            metric: '3 a 5h/sem' },
  { Icon: UserCheck,     text: 'Qualificar lead novo: formulário, call, anotação no CRM.',                    metric: '6 a 10h/sem' },
  { Icon: ListChecks,    text: 'Conferir pedido, planilha, estoque e status, tudo na mão.',                   metric: '4 a 8h/sem' },
  { Icon: MoonStar,      text: 'Lead chega às 23h e fica esperando até o dia seguinte.',                      metric: 'toda noite' },
];

export function TimeDrainSection() {
  return (
    <section className="relative bg-surface-base overflow-hidden">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        {/* Header */}
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
              <span className="block">Onde sua equipe</span>
              <span className="block font-bricolage">perde tempo todo dia.</span>
            </h2>
            <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-text-secondary max-w-2xl mx-auto">
              A pequena tarefa repetitiva que não dói por hora, mas sangra dezenas de horas por semana entre cinco pessoas. É aí que a Notkode atua: não pra trocar seu time por bot, mas pra devolver o tempo que a planilha, o e-mail e o WhatsApp comem sozinhos.
            </p>
          </div>
        </Reveal>

        {/* Animated flow: data being copied between tools */}
        <Reveal delay={120}>
          <div className="relative mx-auto max-w-3xl mb-16 lg:mb-20" aria-hidden="true">
            {/* Desktop horizontal flow */}
            <div className="hidden md:block">
              <svg viewBox="0 0 600 120" className="w-full h-auto">
                {/* Connecting dashed line */}
                <line
                  x1="75" y1="60" x2="525" y2="60"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                {/* Three traveling dots, staggered */}
                {[0, 1, 2].map((i) => (
                  <circle key={i} r="6" fill="hsl(217 91% 60%)">
                    <animateMotion
                      dur="6s"
                      repeatCount="indefinite"
                      begin={`${i * 2}s`}
                      path="M 75 60 L 525 60"
                      keyTimes="0;1"
                      keySplines="0.4 0 0.6 1"
                      calcMode="spline"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      keyTimes="0;0.1;0.9;1"
                      dur="6s"
                      repeatCount="indefinite"
                      begin={`${i * 2}s`}
                    />
                  </circle>
                ))}
              </svg>
              {/* Stage labels positioned over the SVG */}
              <div className="absolute inset-0 flex items-center justify-between px-[8%]">
                {STAGES.map(({ Icon, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-full bg-white border border-black/[0.08] flex items-center justify-center shadow-sm"
                    >
                      <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.8} />
                    </div>
                    <span className="font-mono text-[11px] text-text-secondary tracking-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile vertical flow */}
            <div className="md:hidden flex flex-col items-center gap-1">
              {STAGES.map(({ Icon, label, color }, i) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-white border border-black/[0.08] flex items-center justify-center">
                    <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.8} />
                  </div>
                  <span className="font-mono text-[11px] text-text-secondary mt-1.5">
                    {label}
                  </span>
                  {i < STAGES.length - 1 && (
                    <div className="my-2 w-0.5 h-6 bg-gradient-to-b from-primary/40 to-primary/10 drain-pulse" />
                  )}
                </div>
              ))}
            </div>

            {/* Caption under the flow */}
            <p className="text-center text-[13px] text-text-muted mt-4 max-w-md mx-auto">
              Cada cópia, cada janela, cada ctrl-c-ctrl-v. Multiplique por dia, por pessoa, por semana.
            </p>
          </div>
        </Reveal>

        {/* Pain cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 max-w-5xl mx-auto">
          {DRAINS.map(({ Icon, text, metric }, i) => (
            <Reveal key={i} delay={i * 70}>
              <div className="group h-full flex items-start gap-4 p-5 lg:p-6 rounded-2xl border border-black/[0.07] bg-white/40 hover:border-primary/30 hover:bg-white/60 transition-colors duration-200">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] lg:text-[16px] text-text-primary leading-snug">
                    {text}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim">
                    <span className="w-1 h-1 rounded-full bg-primary/60" />
                    {metric}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes drainPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .drain-pulse {
          animation: drainPulse 1.6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
