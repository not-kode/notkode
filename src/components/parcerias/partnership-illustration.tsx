import Image from 'next/image';

// Photo card with mountain background + grain + dark terminal overlay
// Same visual identity as Process and AgencyBanner — keeps the brand cohesive
export function PartnershipIllustration() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] aspect-[4/3] w-full">

      {/* Landscape photo — generated specifically for /parcerias (two paths converging) */}
      <Image
        src="/images/generated/bg-parcerias.png"
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 520px"
        className="object-cover"
      />

      {/* Warm amber tint */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(220,185,140,0.35)', mixBlendMode: 'multiply' }}
      />

      {/* Subtle square grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
                            linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Grain texture */}
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

      {/* Dark terminal — partnership flow */}
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
            <span className="font-mono text-[10px] text-white/20 ml-3">parceria-live.sh</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ animation: 'status-pulse 2s ease-out infinite' }} />
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">live</span>
            </span>
          </div>

          {/* Content — live partnership status */}
          <div className="p-5 font-mono text-[11px] leading-[1.85] select-none">
            <div className="text-white/30 mb-3">{'❯ notkode parceria --status'}</div>

            {/* Meta */}
            <div className="mb-4 space-y-0.5">
              <div className="flex gap-3">
                <span className="text-white/25 w-16 shrink-0">Parceiro</span>
                <span className="text-white/60">Agência Exemplo</span>
              </div>
              <div className="flex gap-3">
                <span className="text-white/25 w-16 shrink-0">Cliente</span>
                <span className="text-white/60">CRM personalizado</span>
              </div>
              <div className="flex gap-3">
                <span className="text-white/25 w-16 shrink-0">Status</span>
                <span className="text-primary">⚡ em produção</span>
              </div>
            </div>

            {/* This week */}
            <div className="border-t border-white/[0.07] pt-3 mb-3">
              <div className="text-white/25 mb-2 text-[9px] uppercase tracking-wider">esta semana</div>
              <div><span className="text-[#22C55E]">✓</span><span className="text-white/55 ml-2">Tela do CRM aprovada</span></div>
              <div><span className="text-[#22C55E]">✓</span><span className="text-white/55 ml-2">Integração WhatsApp testada</span></div>
              <div><span className="text-primary">→</span><span className="text-white/60 ml-2">Deploy em homologação</span><span className="text-primary cursor-blink">_</span></div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.07] pt-3 text-white/30 flex items-center justify-between">
              <span>{'> próxima entrega: sexta'}</span>
              <span className="text-white/40">100% sua marca</span>
            </div>
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
