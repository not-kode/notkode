const FLOW = [
  {
    from: 'Sua Agência',
    to: 'Notkode',
    label: 'brief & requisitos',
    arrow: '→',
  },
  {
    from: 'Notkode',
    to: 'Entregável',
    label: 'build em white-label',
    arrow: '→',
  },
];

const SERVICES = [
  { name: 'Sistema com IA',    cmd: 'ai-system'  },
  { name: 'App / SaaS',        cmd: 'product'    },
  { name: 'Agentes & Bots',    cmd: 'agents'     },
  { name: 'Design & Prototipo',cmd: 'design'     },
];

export function AgencyVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
      {/* Glow */}
      <div
        className="absolute -inset-4 rounded-3xl opacity-50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        aria-hidden
      />

      <div className="relative rounded-2xl border border-black/10 bg-[#0A0C14] overflow-hidden shadow-xl shadow-black/20">

        {/* Chrome */}
        <div className="flex items-center gap-3 px-4 h-9 bg-white/[0.02] border-b border-white/[0.07]">
          <div className="flex gap-1.5" aria-hidden>
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          <span className="font-mono text-[10px] text-white/25 flex-1 text-center select-none">
            notkode/parceria, white-label
          </span>
        </div>

        <div className="p-5">
          {/* Flow */}
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 mb-3 select-none">
            {'// como funciona'}
          </p>

          <div className="flex items-center gap-2 mb-5">
            {/* Agência node */}
            <div className="flex-1 text-center py-2.5 px-3 rounded-lg border border-white/10 bg-white/[0.04]">
              <div className="font-mono text-[9px] text-white/30 mb-0.5">você</div>
              <div className="text-xs font-semibold text-white/70">Sua Agência</div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <div className="w-8 h-px bg-primary/40" />
              <span className="font-mono text-[8px] text-white/25 whitespace-nowrap">brief</span>
            </div>

            {/* Notkode node */}
            <div className="flex-1 text-center py-2.5 px-3 rounded-lg border border-primary/30 bg-primary/10">
              <div className="font-mono text-[9px] text-primary/60 mb-0.5">tech partner</div>
              <div className="text-xs font-semibold text-primary">Notkode</div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <div className="w-8 h-px bg-primary/40" />
              <span className="font-mono text-[8px] text-white/25 whitespace-nowrap">entrega</span>
            </div>

            {/* Cliente node */}
            <div className="flex-1 text-center py-2.5 px-3 rounded-lg border border-white/10 bg-white/[0.04]">
              <div className="font-mono text-[9px] text-white/30 mb-0.5">seu cliente</div>
              <div className="text-xs font-semibold text-white/70">Produto</div>
            </div>
          </div>

          {/* Services we deliver */}
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 mb-2 select-none">
            {'// entregamos'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {SERVICES.map((s) => (
              <div
                key={s.cmd}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                <span className="text-[11px] text-white/50 leading-tight">{s.name}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between">
            <span className="font-mono text-[9px] text-white/25 select-none">100% white-label · NDA incluído</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
              <span className="font-mono text-[9px] text-[#22C55E]">ativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
