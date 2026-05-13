const MODULES = [
  { name: 'CRM & Leads',   active: true  },
  { name: 'Agentes IA',    active: true  },
  { name: 'Dashboard',     active: false },
  { name: 'Relatórios',    active: false },
  { name: 'Financeiro',    active: false },
  { name: 'Estoque',       active: false },
];

const BAR_HEIGHTS = [30, 45, 35, 60, 50, 70, 80, 65, 75, 90, 85, 95];

const LOG = [
  { time: '14:32', text: 'atendimento.agent → Lead #482 qualificado', elapsed: '+248ms', active: true  },
  { time: '14:28', text: 'relatorios.agent  → Relatório semanal gerado', elapsed: '+891ms', active: true  },
  { time: '14:25', text: 'crm.sync          → 47 registros atualizados', elapsed: '+1.2s',  active: false },
];

export function SystemMockup() {
  return (
    <div className="relative w-full">
      {/* Blue glow behind card */}
      <div
        className="absolute -inset-x-6 bottom-0 h-2/3 rounded-3xl"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(59,130,246,0.12) 0%, transparent 70%)',
          filter: 'blur(32px)',
        }}
        aria-hidden
      />

      {/* Main window */}
      <div className="relative rounded-2xl border border-black/10 bg-[#0A0C14] overflow-hidden shadow-2xl shadow-black/25">

        {/* Window chrome */}
        <div className="flex items-center gap-3 px-4 h-10 bg-white/[0.02] border-b border-white/[0.07]">
          <div className="flex gap-1.5" aria-hidden>
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <span className="font-mono text-[11px] text-white/25 flex-1 text-center select-none">
            notkode/sistema-v2 — dashboard
          </span>
          <span className="font-mono text-[10px] text-[#22C55E] select-none">● production</span>
        </div>

        {/* Body */}
        <div className="grid grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr]">

          {/* Sidebar */}
          <div className="border-r border-white/[0.06] p-4 hidden sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 mb-3 select-none">
              módulos
            </p>
            <div className="space-y-1">
              {MODULES.map((mod) => (
                <div
                  key={mod.name}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs select-none ${
                    mod.active
                      ? 'bg-primary/15 text-primary'
                      : 'text-white/35'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-sm flex-shrink-0 ${
                      mod.active ? 'bg-primary' : 'bg-white/15'
                    }`}
                  />
                  {mod.name}
                </div>
              ))}
            </div>
          </div>

          {/* Main dashboard */}
          <div className="p-4 lg:p-5">

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">

              {/* Revenue card */}
              <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
                <p className="font-mono text-[9px] text-white/30 mb-1.5 select-none">receita / mês</p>
                <p className="text-xl lg:text-2xl font-bold text-white leading-none mb-1">R$ 48.2k</p>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[#22C55E] text-[11px] font-mono">↑ 24%</span>
                  <span className="text-white/25 text-[9px] font-mono">vs anterior</span>
                </div>
                {/* Mini bar chart */}
                <div className="flex items-end gap-0.5 h-8">
                  {BAR_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        background: i >= BAR_HEIGHTS.length - 3
                          ? 'rgba(59,130,246,0.8)'
                          : 'rgba(59,130,246,0.25)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Conversion card */}
              <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
                <p className="font-mono text-[9px] text-white/30 mb-1.5 select-none">conversão leads</p>
                <p className="text-xl lg:text-2xl font-bold text-white leading-none mb-1">
                  68<span className="text-sm text-white/40 font-normal">%</span>
                </p>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[#22C55E] text-[11px] font-mono">↑ 12%</span>
                  <span className="text-white/25 text-[9px] font-mono">taxa</span>
                </div>
                {/* Progress */}
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: '68%' }} />
                </div>
                <div className="mt-1.5 flex justify-between">
                  <span className="font-mono text-[8px] text-white/20">0</span>
                  <span className="font-mono text-[8px] text-primary">68%</span>
                  <span className="font-mono text-[8px] text-white/20">100</span>
                </div>
              </div>
            </div>

            {/* Agent log */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 mb-2 select-none">
                log de agentes
              </p>
              <div className="space-y-1.5">
                {LOG.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 font-mono text-[11px] ${
                      entry.active ? 'text-white/50' : 'text-white/30'
                    }`}
                  >
                    <span className={entry.active ? 'text-primary' : 'text-white/15'}>
                      {entry.active ? '●' : '○'}
                    </span>
                    <span className="text-white/20 flex-shrink-0 hidden sm:inline">{entry.time}</span>
                    <span className="flex-1 truncate">{entry.text}</span>
                    <span className={`flex-shrink-0 ${entry.active ? 'text-[#22C55E]' : 'text-white/20'}`}>
                      {entry.elapsed}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
