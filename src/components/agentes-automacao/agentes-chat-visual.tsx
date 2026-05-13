import Image from 'next/image';

// Photo card with WhatsApp-like chat terminal showing AI responding to customers
export function AgentesChatVisual() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] aspect-[5/6] sm:aspect-[4/3] w-full">

      {/* Landscape — rock strata, technical feel */}
      <Image
        src="/images/generated/bg-process.png"
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 520px"
        className="object-cover"
      />

      {/* Warm tint */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(220,185,140,0.35)', mixBlendMode: 'multiply' }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
                            linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Grain */}
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

      {/* Chat terminal */}
      <div className="absolute inset-0 flex items-center justify-center p-5 lg:p-8">
        <div
          className="w-full max-w-[360px] rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(6,6,8,0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Chrome */}
          <div className="flex items-center gap-1.5 px-4 h-9 border-b border-white/[0.06]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <span className="font-mono text-[10px] text-white/20 ml-3">agente-ia.log</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ animation: 'status-pulse 2s ease-out infinite' }} />
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">live</span>
            </span>
          </div>

          {/* Conversation */}
          <div className="p-4 font-mono text-[11px] leading-[1.6] select-none space-y-2.5">

            {/* Customer msg */}
            <div className="flex flex-col gap-1">
              <div className="text-white/30 text-[9px]">12:34 · cliente</div>
              <div className="text-white/60 px-3 py-1.5 rounded-md self-start max-w-[80%]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                Oi, meu pedido chegou?
              </div>
            </div>

            {/* Agent response */}
            <div className="flex flex-col gap-1">
              <div className="text-primary/60 text-[9px]">12:34 · agente IA</div>
              <div className="text-white/80 px-3 py-1.5 rounded-md self-start max-w-[85%]" style={{ background: 'rgba(59,130,246,0.18)' }}>
                Verificando pedido #4521…
              </div>
              <div className="text-white/80 px-3 py-1.5 rounded-md self-start max-w-[85%]" style={{ background: 'rgba(59,130,246,0.18)' }}>
                <span className="text-[#22C55E]">✓</span> Entregue ontem às 16:22
              </div>
            </div>

            {/* New question */}
            <div className="flex flex-col gap-1 pt-2 border-t border-white/[0.05]">
              <div className="text-white/30 text-[9px]">12:35 · cliente</div>
              <div className="text-white/60 px-3 py-1.5 rounded-md self-start max-w-[85%]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                Quero a 2ª via da fatura
              </div>
            </div>

            {/* Agent action */}
            <div className="flex flex-col gap-1">
              <div className="text-primary/60 text-[9px]">12:35 · agente IA</div>
              <div className="text-white/80 px-3 py-1.5 rounded-md self-start max-w-[85%]" style={{ background: 'rgba(59,130,246,0.18)' }}>
                Fatura 12/2025 · R$ 1.247
              </div>
              <div className="text-primary px-3 py-1.5 rounded-md self-start max-w-[85%] flex items-center gap-2" style={{ background: 'rgba(59,130,246,0.18)' }}>
                <span className="text-[#22C55E]">⚡</span> PIX enviado por e-mail
                <span className="cursor-blink">_</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="font-mono text-[9px] text-white/30">2 atendimentos resolvidos · 0 humanos envolvidos</span>
          </div>
        </div>
      </div>

      {/* FIG label */}
      <span className="absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase select-none">
        FIG. 001
      </span>
    </div>
  );
}
