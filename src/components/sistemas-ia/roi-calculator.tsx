'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { Link } from '@/i18n/routing';
import { ArrowUpRight } from 'lucide-react';

// Preços reais verificados em mai/2025 — plano intermediário por ferramenta
// Ferramentas por usuário calculadas para um time de 3 pessoas
const TOOLS = [
  { id: 'crm',       label: 'CRM — RD Station Pro / Pipedrive Growth',     cost: 382  }, // R$ 127/usuário × 3
  { id: 'whatsapp',  label: 'WhatsApp API — Z-API / Twilio',               cost: 121  }, // média Z-API + Twilio 1k conv.
  { id: 'erp',       label: 'ERP / Financeiro — Omie / Conta Azul',        cost: 305  }, // média R$ 299 + R$ 310
  { id: 'sheets',    label: 'Planilhas & Google Workspace',                 cost: 0    }, // horas manuais — sem custo fixo
  { id: 'tasks',     label: 'Gestão de tarefas — Notion / Monday.com',     cost: 330  }, // R$ 110/usuário × 3
  { id: 'email',     label: 'E-mail marketing — RD Station / Mailchimp',   cost: 307  }, // média R$ 529 + R$ 85
  { id: 'analytics', label: 'Analytics — Metabase / Power BI Pro',         cost: 325  }, // média R$ 570 + R$ 80
  { id: 'support',   label: 'Suporte ao cliente — Zendesk / Freshdesk',    cost: 337  }, // média R$ 359 + R$ 314
];

const HOURLY_RATE = 60; // R$/h — custo médio colaborador operacional CLT

export function ROICalculator() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['crm', 'whatsapp', 'sheets', 'tasks'])
  );
  const [hoursWasted, setHoursWasted] = useState(15);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toolsCost = TOOLS.filter((t) => selected.has(t.id)).reduce(
    (sum, t) => sum + t.cost,
    0
  );
  const laborCost  = hoursWasted * HOURLY_RATE;
  const totalMonth = toolsCost + laborCost;
  const totalYear  = totalMonth * 12;

  // Estimativa simplificada de investimento notkode (baseada em complexidade proxy)
  const notkodeCost = Math.max(12000, Math.round(selected.size * 2800 / 500) * 500);
  const paybackMonths = totalMonth > 0 ? Math.ceil(notkodeCost / totalMonth) : 0;

  return (
    <section className="bg-surface-base relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dots opacity-[0.08] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32 relative">
        <Reveal>
          <SectionMarker number="02" label="Calculadora de ROI" />
          <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-3">
            Quanto você gasta hoje{' '}
            <span className="font-bricolage">em ferramentas avulsas?</span>
          </h2>
          <p className="text-base text-text-secondary leading-relaxed mb-12 max-w-xl">
            Selecione as ferramentas que você usa. Veja o que sai todo mês — e quando um sistema próprio se paga.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-start">

          {/* LEFT — tool checklist + hours slider */}
          <Reveal>
            <div className="space-y-2">
              {TOOLS.map((tool) => {
                const active = selected.has(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => toggle(tool.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: active ? 'rgba(59,130,246,0.06)' : 'rgba(25,25,24,0.03)',
                      border: active ? '1px solid rgba(59,130,246,0.22)' : '1px solid rgba(25,25,24,0.07)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all duration-200"
                        style={{
                          background: active ? '#3B82F6' : 'transparent',
                          border: active ? '1px solid #3B82F6' : '1px solid rgba(25,25,24,0.2)',
                        }}
                      >
                        {active && <span className="text-white text-[10px] leading-none">✓</span>}
                      </div>
                      <span className="text-[13px] text-text-primary">{tool.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-text-dim shrink-0">
                      {tool.cost > 0 ? `R$ ${tool.cost}/mês` : 'tempo da equipe'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Horas manuais slider */}
            <div className="mt-6 p-5 rounded-xl" style={{ background: 'rgba(25,25,24,0.03)', border: '1px solid rgba(25,25,24,0.07)' }}>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[13px] text-text-primary font-medium">
                  Horas/semana perdidas em tarefas manuais
                </span>
                <span className="font-mono text-[13px] text-primary font-semibold">{hoursWasted}h</span>
              </div>
              <input
                type="range" min={0} max={40} step={1}
                value={hoursWasted}
                onChange={(e) => setHoursWasted(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[9px] text-text-dim">0h</span>
                <span className="font-mono text-[9px] text-text-dim">40h</span>
              </div>
            </div>
          </Reveal>

          {/* RIGHT — result panel */}
          <Reveal delay={120}>
            <div className="lg:sticky lg:top-28">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(25,25,24,0.09)', background: 'hsl(55 100% 97%)' }}
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-black/[0.06]">
                  <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-1">Resultado estimado</p>
                  <p className="text-[13px] text-text-secondary">baseado nas ferramentas selecionadas</p>
                </div>

                {/* Custo atual */}
                <div className="px-6 py-5 border-b border-black/[0.06] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-text-secondary">Ferramentas (mensalidades)</span>
                    <span className="font-mono text-[14px] text-text-primary font-semibold">
                      R$ {toolsCost.toLocaleString('pt-BR')}/mês
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-text-secondary">Trabalho manual ({hoursWasted}h × R${HOURLY_RATE})</span>
                    <span className="font-mono text-[14px] text-text-primary font-semibold">
                      R$ {laborCost.toLocaleString('pt-BR')}/mês
                    </span>
                  </div>
                  <div
                    className="flex items-baseline justify-between pt-3 mt-1"
                    style={{ borderTop: '1px solid rgba(25,25,24,0.07)' }}
                  >
                    <span className="text-[14px] font-semibold text-text-primary">Total atual</span>
                    <span className="font-mono text-[18px] text-red-500/80 font-bold">
                      R$ {totalMonth.toLocaleString('pt-BR')}/mês
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-text-dim">Em 12 meses</span>
                    <span className="font-mono text-[13px] text-text-muted">
                      R$ {totalYear.toLocaleString('pt-BR')}/ano
                    </span>
                  </div>
                </div>

                {/* Com Notkode */}
                <div className="px-6 py-5 border-b border-black/[0.06] space-y-3" style={{ background: 'rgba(59,130,246,0.03)' }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-text-secondary">Sistema Notkode (investimento)</span>
                    <span className="font-mono text-[14px] text-primary font-semibold">
                      a partir de R$ {notkodeCost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-text-secondary">Mensalidade de plataforma</span>
                    <span className="font-mono text-[14px] text-primary font-semibold">R$ 0/mês</span>
                  </div>
                  {totalMonth > 0 && (
                    <div
                      className="flex items-baseline justify-between pt-3 mt-1"
                      style={{ borderTop: '1px solid rgba(59,130,246,0.12)' }}
                    >
                      <span className="text-[14px] font-semibold text-text-primary">Payback estimado</span>
                      <span className="font-mono text-[18px] text-primary font-bold">
                        {paybackMonths} {paybackMonths === 1 ? 'mês' : 'meses'}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-6 py-5">
                  <p className="text-[12px] text-text-dim mb-4 leading-relaxed">
                    Preços baseados nos planos intermediários reais de cada ferramenta (mai/2025). Ferramentas por usuário calculadas para 3 pessoas. Na conversa de diagnóstico você recebe uma proposta personalizada.
                  </p>
                  <Link
                    href="/contato"
                    className="font-bricolage w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:bg-primary/90 hover:-translate-y-px transition-all duration-200"
                  >
                    Quero meu diagnóstico gratuito
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
