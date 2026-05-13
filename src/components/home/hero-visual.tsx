const AGENTS = [
  { name: 'Atendimento 24h', cmd: 'support.agent', active: true },
  { name: 'Geração de Relatórios', cmd: 'reports.agent', active: true },
  { name: 'Sincronização CRM', cmd: 'crm.sync', active: false },
];

const ACTIVITY = [
  { done: true,  text: 'Lead qualificado e encaminhado', time: '+248ms' },
  { done: true,  text: 'Relatório semanal gerado',       time: '+891ms' },
  { done: true,  text: 'CRM atualizado (47 registros)',  time: '+1.2s'  },
  { done: false, text: 'Analisando novos leads',         time: 'running' },
];

const METRICS = [
  { value: '847',   label: 'tarefas hoje'       },
  { value: '4.2×',  label: 'mais rápido'        },
  { value: '99.1%', label: 'precisão'           },
  { value: 'R$12k', label: 'economizados/mês'   },
];

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Blue glow layer behind the card */}
      <div
        className="absolute -inset-x-4 bottom-0 h-3/4 rounded-3xl opacity-60"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(59,130,246,0.18) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
        aria-hidden
      />

      {/* Dashboard card */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0A0C14]/95 backdrop-blur-xl shadow-2xl">

        {/* Window chrome */}
        <div className="flex items-center gap-3 px-4 h-11 border-b border-white/8 bg-white/[0.02]">
          <div className="flex gap-1.5" aria-hidden>
            <div className="w-2.5 h-2.5 rounded-full bg-white/18" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/18" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/18" />
          </div>
          <span className="font-mono text-[11px] text-text-dim flex-1 text-center select-none">
            sistema.notkode.ai — dashboard
          </span>
          <div className="flex items-center gap-1.5">
            <span className="status-dot" />
            <span className="font-mono text-[10px] text-primary select-none">online</span>
          </div>
        </div>

        {/* Main content — two columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/6">

          {/* Left — Agents */}
          <div className="p-5 lg:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim mb-5 select-none">
              {'// agentes ativos'}
            </p>
            <div className="space-y-4">
              {AGENTS.map((agent) => (
                <div key={agent.cmd} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                      agent.active ? 'bg-primary' : 'bg-white/20'
                    }`}
                    style={agent.active ? { boxShadow: '0 0 8px rgba(59,130,246,0.7)' } : {}}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-primary font-medium truncate leading-snug">
                      {agent.name}
                    </div>
                    <div className="font-mono text-[10px] text-text-dim leading-snug">
                      {`> ${agent.cmd}`}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      agent.active
                        ? 'border-primary/30 text-primary bg-primary/8'
                        : 'border-white/10 text-text-dim'
                    }`}
                  >
                    {agent.active ? 'ativo' : 'idle'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Activity log */}
          <div className="p-5 lg:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim mb-5 select-none">
              {'// atividade recente'}
            </p>
            <div className="space-y-3">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 font-mono text-sm">
                  <span
                    className={`mt-0.5 flex-shrink-0 leading-none ${
                      item.done ? 'text-[#22C55E]' : 'text-primary'
                    }`}
                  >
                    {item.done ? '✓' : '⟳'}
                  </span>
                  <span className={`flex-1 leading-snug ${item.done ? 'text-text-secondary' : 'text-text-primary'}`}>
                    {item.text}
                    {!item.done && <span className="cursor-blink ml-0.5">_</span>}
                  </span>
                  <span
                    className={`text-[10px] whitespace-nowrap leading-snug flex-shrink-0 ${
                      item.done ? 'text-text-dim' : 'text-primary'
                    }`}
                  >
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — metrics strip */}
        <div className="grid grid-cols-4 divide-x divide-white/6 border-t border-white/6 bg-white/[0.01]">
          {METRICS.map((m) => (
            <div key={m.label} className="px-3 py-3 text-center">
              <div className="text-sm font-semibold text-text-primary tabular-nums leading-none">
                {m.value}
              </div>
              <div className="font-mono text-[9px] text-text-dim mt-1 leading-tight">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
