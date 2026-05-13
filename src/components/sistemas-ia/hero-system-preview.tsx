'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const MODULES = [
  { label: 'CRM & Vendas',         active: true,  highlight: false },
  { label: 'Atendimento IA',       active: true,  highlight: true  },
  { label: 'Financeiro',           active: true,  highlight: false },
  { label: 'Relatórios',           active: true,  highlight: false },
  { label: 'Estoque',              active: true,  highlight: false },
  { label: 'WhatsApp Automático',  active: true,  highlight: false },
];

export function HeroSystemPreview() {
  // Rotate which module shows the "live" indicator
  const [liveIdx, setLiveIdx] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveIdx((i) => (i + 1) % MODULES.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      {/* Glow blob behind the card */}
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: 'hsl(55 100% 97%)',
          border: '1px solid rgba(25,25,24,0.08)',
          boxShadow: '0 20px 60px -20px rgba(59,130,246,0.15), 0 8px 24px -12px rgba(0,0,0,0.08)',
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06]" style={{ background: 'rgba(25,25,24,0.02)' }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-[11px] font-bold">N</span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-text-primary leading-tight">Seu Sistema</p>
              <p className="font-mono text-[9px] text-text-dim leading-tight">notkode · sob medida</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ boxShadow: '0 0 0 0 rgba(34,197,94,0.5)', animation: 'status-pulse 2s ease-out infinite' }} />
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider">online</span>
          </div>
        </div>

        {/* Modules list */}
        <div className="p-4 space-y-1.5">
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-3 px-2">
            Módulos ativos
          </p>
          {MODULES.map((m, i) => {
            const isLive = i === liveIdx;
            return (
              <div
                key={m.label}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-300"
                style={{
                  background: isLive
                    ? 'rgba(59,130,246,0.08)'
                    : 'transparent',
                  border: isLive
                    ? '1px solid rgba(59,130,246,0.25)'
                    : '1px solid rgba(25,25,24,0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: '#3B82F6',
                    }}
                  >
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[12px] text-text-primary">{m.label}</span>
                  {m.highlight && (
                    <Sparkles className="w-3 h-3 text-primary" strokeWidth={2} />
                  )}
                </div>
                {isLive && (
                  <span
                    className="font-mono text-[9px] text-primary uppercase tracking-wider"
                    style={{ animation: 'testimonial-in 0.35s ease both' }}
                  >
                    em uso
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/[0.06] flex items-center justify-between" style={{ background: 'rgba(25,25,24,0.02)' }}>
          <span className="font-mono text-[10px] text-text-secondary">
            {MODULES.length} módulos · 100% sob medida
          </span>
          <span className="font-mono text-[10px] text-primary">
            código entregue ✓
          </span>
        </div>
      </div>

      {/* Floating IA badge — extra polish */}
      <div
        className="absolute -top-3 -right-3 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
          boxShadow: '0 8px 24px -8px rgba(59,130,246,0.5)',
        }}
      >
        <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
        <span className="font-bricolage text-white font-bold text-[10px] uppercase tracking-wider">IA dentro</span>
      </div>
    </div>
  );
}
