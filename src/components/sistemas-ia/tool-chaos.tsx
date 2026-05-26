import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';

// Preços reais mai/2025 — fonte: sites oficiais das ferramentas
const TOOLS = [
  { name: 'Z-API / Twilio (WhatsApp)',   cost: '~ R$ 121/mês'       },
  { name: 'RD Station CRM / Pipedrive',  cost: '~ R$ 127/usuário'   },
  { name: 'Omie / Conta Azul',           cost: 'R$ 299–310/mês'     },
  { name: 'Notion / Monday.com',         cost: '~ R$ 110/usuário'   },
  { name: 'RD Station Mkt / Mailchimp',  cost: 'R$ 85–529/mês'      },
  { name: 'Metabase / Power BI Pro',     cost: 'R$ 80–570/mês'      },
  { name: 'Zendesk / Freshdesk',         cost: '~ R$ 337/agente'    },
];

const SISTEMA_MODULES = [
  'CRM & Leads',
  'Financeiro',
  'Atendimento IA',
  'Relatórios automáticos',
  'Gestão de tarefas',
  'Integrações',
  'Dashboard unificado',
];

export function ToolChaos() {
  return (
    <section className="bg-surface-elevated overflow-hidden">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <SectionMarker number="01" label="O problema real" />
          <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-4 mt-4 max-w-2xl">
            Você provavelmente paga por mais ferramentas{' '}
            <span className="font-bricolage">do que deveria.</span>
          </h2>
          <p className="text-base lg:text-lg text-text-secondary leading-relaxed mb-16 max-w-xl">
            E nenhuma delas conversa com a outra. Sua equipe vive copiando dado de um lugar para o outro.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center">

          {/* LEFT — ferramentas desconectadas */}
          <Reveal>
            <div className="space-y-2">
              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4">Hoje, ferramentas isoladas</p>
              {TOOLS.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(25,25,24,0.04)', border: '1px solid rgba(25,25,24,0.08)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                    <span className="text-[13px] text-text-secondary">{tool.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-text-dim">{tool.cost}</span>
                </div>
              ))}
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50/60 border border-red-100">
                <p className="font-mono text-[11px] text-red-500/70">
                  + horas perdidas integrando manualmente
                </p>
              </div>
            </div>
          </Reveal>

          {/* CENTER — divider */}
          <Reveal delay={100}>
            <div className="flex lg:flex-col items-center gap-3 py-4 lg:py-0">
              <div className="flex-1 lg:flex-none h-px lg:h-16 lg:w-px bg-black/[0.08] lg:mx-auto" />
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="text-white font-bricolage font-bold text-sm">→</span>
              </div>
              <div className="flex-1 lg:flex-none h-px lg:h-16 lg:w-px bg-black/[0.08] lg:mx-auto" />
            </div>
          </Reveal>

          {/* RIGHT — sistema unificado */}
          <Reveal delay={150}>
            <div>
              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4">Com Notkode, tudo em um</p>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-primary/10">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[11px]">N</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">Seu Sistema</p>
                    <p className="font-mono text-[10px] text-text-dim">notkode · sob medida</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {SISTEMA_MODULES.map((mod) => (
                    <div key={mod} className="flex items-center gap-3">
                      <span className="text-primary text-[12px]">✓</span>
                      <span className="text-[13px] text-text-secondary">{mod}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-primary/10 space-y-1">
                  <p className="font-mono text-[10px] text-primary">código-fonte entregue</p>
                  <p className="font-mono text-[10px] text-text-dim">sem mensalidade de plataforma</p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
