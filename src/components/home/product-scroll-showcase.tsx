'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Feature {
  title: string;
  desc: string;
}

interface Props {
  features: Feature[];
  cta: string;
  ctaHref?: string;
}

/* ─────────────────────────────────────────────
   Visual 1 — Module configurator (custom-built)
───────────────────────────────────────────── */
const V1_MODULES = [
  { label: 'CRM & Vendas',        active: true  },
  { label: 'Financeiro',          active: true  },
  { label: 'WhatsApp Automático', active: true  },
  { label: 'Relatórios',          active: true  },
  { label: 'Estoque',             active: false },
  { label: 'Portal do Cliente',   active: false },
];

function Visual1() {
  return (
    <div className="flex items-center justify-center w-full h-full p-8" aria-hidden>
      <div className="w-full max-w-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-mono text-[10px] text-text-dim tracking-widest uppercase mb-0.5">Seu sistema</div>
            <div className="text-[13px] font-semibold text-text-primary">Configuração sob medida</div>
          </div>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">N</span>
          </div>
        </div>

        {/* Module list */}
        <div className="space-y-2">
          {V1_MODULES.map((m) => (
            <div
              key={m.label}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg"
              style={{
                background: m.active ? 'rgba(59,130,246,0.06)' : 'rgba(25,25,24,0.03)',
                border: m.active ? '1px solid rgba(59,130,246,0.18)' : '1px solid rgba(25,25,24,0.07)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: m.active ? '#3B82F6' : 'rgba(25,25,24,0.2)' }}
                />
                <span
                  className="font-mono text-[11px]"
                  style={{ color: m.active ? 'rgba(25,25,24,0.75)' : 'rgba(25,25,24,0.3)' }}
                >
                  {m.label}
                </span>
              </div>
              <span
                className="font-mono text-[9px] tracking-wider uppercase"
                style={{ color: m.active ? 'rgba(59,130,246,0.7)' : 'rgba(25,25,24,0.22)' }}
              >
                {m.active ? 'ativo' : '+ add'}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-dim">4 módulos ativos</span>
          <span className="font-mono text-[10px] text-primary">personalizado ✓</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Visual 2 — IA Nativa (business scenarios)
───────────────────────────────────────────── */
const V2_SCENARIOS = [
  {
    input:  '"Qual o status do pedido 4521?"',
    output: 'Responde cliente + atualiza CRM',
    color:  '#22C55E',
  },
  {
    input:  '"Relatório de vendas de março"',
    output: 'Gera PDF e envia por e-mail',
    color:  '#3B82F6',
  },
  {
    input:  'Nova lead via formulário',
    output: 'Cria tarefa + notifica vendedor',
    color:  '#F59E0B',
  },
];

function Visual2() {
  return (
    <div className="flex flex-col justify-center h-full px-7 py-6 gap-3" aria-hidden>
      <div className="font-mono text-[10px] text-text-dim tracking-widest uppercase mb-1">Agente IA — exemplos reais</div>
      {V2_SCENARIOS.map((s, i) => (
        <div key={i} className="flex items-stretch gap-0">
          {/* Input */}
          <div className="flex-1 rounded-l-lg px-3 py-2.5 text-[11px] font-mono text-text-secondary leading-snug"
            style={{ background: 'rgba(25,25,24,0.04)', border: '1px solid rgba(25,25,24,0.08)', borderRight: 'none' }}>
            <div className="text-text-dim text-[9px] uppercase tracking-wider mb-1">entrada</div>
            {s.input}
          </div>
          {/* Arrow */}
          <div className="flex items-center px-2 shrink-0"
            style={{ background: 'rgba(25,25,24,0.03)', border: '1px solid rgba(25,25,24,0.08)', borderLeft: 'none', borderRight: 'none' }}>
            <span className="text-[10px]" style={{ color: s.color }}>▶</span>
          </div>
          {/* Output */}
          <div className="flex-1 rounded-r-lg px-3 py-2.5 text-[11px] font-mono leading-snug"
            style={{ background: `${s.color}0d`, border: `1px solid ${s.color}30`, borderLeft: 'none', color: 'rgba(25,25,24,0.65)' }}>
            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: s.color }}>resultado</div>
            {s.output}
          </div>
        </div>
      ))}
      <div className="mt-1 font-mono text-[10px] text-text-dim text-center">
        integrado ao seu sistema — sem ferramentas extras
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Visual 3 — Propriedade total terminal
───────────────────────────────────────────── */
function Visual3() {
  return (
    <div className="flex items-center justify-center p-8 h-full" aria-hidden>
      <div
        className="w-full max-w-[340px] rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(6,6,8,0.90)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-1.5 px-4 h-9 border-b border-white/[0.06]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <span className="font-mono text-[10px] text-white/20 ml-3">ownership.sh</span>
        </div>

        {/* Content */}
        <div className="p-5 font-mono text-[11px] leading-[1.8] select-none">
          <div className="text-white/40 mb-3">{'$ git remote show origin'}</div>
          <div className="text-white/25 mb-1">{'Remote URL:'}</div>
          <div className="text-white/55 mb-4">{'github.com/sua-empresa/sistema.git'}</div>

          <div className="space-y-1 mb-4">
            <div>
              <span style={{ color: '#22C55E' }}>✓</span>
              <span className="text-white/55 ml-2">código 100% seu</span>
            </div>
            <div>
              <span style={{ color: '#22C55E' }}>✓</span>
              <span className="text-white/55 ml-2">deploy em qualquer servidor</span>
            </div>
            <div>
              <span style={{ color: '#22C55E' }}>✓</span>
              <span className="text-white/55 ml-2">zero vendor lock-in</span>
            </div>
            <div>
              <span style={{ color: '#22C55E' }}>✓</span>
              <span className="text-white/55 ml-2">sem mensalidade de plataforma</span>
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-3">
            <span style={{ color: '#3B82F6' }}>{'>'}</span>
            <span className="text-white/55 ml-2">você tem controle total</span>
            <span className="text-white/55 cursor-blink">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Visual 4 — Escala (growth comparison)
───────────────────────────────────────────── */
const V4_ROWS = [
  { label: 'Usuários',   before: '50',       after: '5.000',    unit: '' },
  { label: 'Módulos',    before: '3',        after: '11',       unit: '' },
  { label: 'Dados/mês',  before: '1 GB',     after: '180 GB',   unit: '' },
  { label: 'Reescrita',  before: 'zero',     after: 'zero',     same: true },
];

function Visual4() {
  return (
    <div className="flex flex-col justify-center h-full px-8 py-6" aria-hidden>
      <div className="font-mono text-[10px] text-text-dim tracking-widest uppercase mb-4">Crescimento real — mesma base</div>

      {/* Table */}
      <div className="w-full">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-2 px-3">
          <div />
          <div className="font-mono text-[9px] text-text-dim uppercase tracking-wider text-center">Hoje</div>
          <div className="font-mono text-[9px] text-primary uppercase tracking-wider text-center">Em 1 ano</div>
        </div>

        <div className="space-y-1.5">
          {V4_ROWS.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1fr_80px_80px] gap-2 items-center px-3 py-2 rounded-lg"
              style={{ background: 'rgba(25,25,24,0.03)', border: '1px solid rgba(25,25,24,0.06)' }}
            >
              <span className="font-mono text-[11px] text-text-secondary">{r.label}</span>
              <span className="font-mono text-[11px] text-text-dim text-center">{r.before}</span>
              <span
                className="font-mono text-[11px] text-center font-semibold"
                style={{ color: r.same ? '#22C55E' : '#3B82F6' }}
              >
                {r.after}
                {r.same && ' ✓'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-black/[0.06] font-mono text-[10px] text-text-dim text-center">
        arquitetura preparada desde o dia 1
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Visuals registry
───────────────────────────────────────────── */
const VISUALS = [Visual1, Visual2, Visual3, Visual4];
const FIG_LABELS = ['FIG. 001', 'FIG. 002', 'FIG. 003', 'FIG. 004'];

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export function ProductScrollShowcase({
  features,
  cta,
  ctaHref = '/sistemas-ia',
}: Props) {
  const [active, setActive]   = useState(0);
  const [locked, setLocked]   = useState(false);
  const [openMobile, setOpenMobile] = useState(0); // primeiro item aberto por padrão
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-advance every 8s unless user locked a tab
  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % VISUALS.length);
    }, 8000);
    return () => clearInterval(id);
  }, [locked]);

  const clickFeature = (i: number) => {
    setActive(i);
    setLocked(true);
  };

  const figLabel = FIG_LABELS[active] ?? 'FIG. 001';

  return (
    <>
      {/* ── MOBILE: accordion (uma feature aberta por vez) ── */}
      <div className="lg:hidden">
        <div className="rounded-2xl border border-black/[0.08] overflow-hidden divide-y divide-black/[0.06]" style={{ background: 'hsl(55 100% 97%)' }}>
          {features.map((f, i) => {
            const VisualComp = VISUALS[i] ?? VISUALS[0];
            const figLabel   = FIG_LABELS[i] ?? 'FIG. 001';
            const isOpen     = openMobile === i;
            return (
              <article key={f.title}>
                <button
                  type="button"
                  onClick={() => setOpenMobile(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left"
                >
                  <span
                    className="font-mono text-[10px] tracking-widest text-text-dim shrink-0"
                    style={{ minWidth: 28 }}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="flex-1 text-[15px] font-semibold tracking-tight text-text-primary">
                    {f.title}
                  </h3>
                  <ChevronDown
                    className="w-4 h-4 text-text-secondary transition-transform shrink-0"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                    strokeWidth={2}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                      {f.desc}
                    </p>
                    <div
                      className="relative rounded-xl border border-black/[0.08] overflow-hidden"
                      style={{ minHeight: 380 }}
                    >
                      <VisualComp />
                      <span className="absolute bottom-3 right-4 font-mono text-[9px] tracking-[0.2em] text-text-dim uppercase pointer-events-none select-none">
                        {figLabel}
                      </span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="pt-6">
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            {cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── DESKTOP: scroll-sticky with auto-advance ── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_1fr] gap-16 items-start">

      {/* ── Left — scrollable feature list ── */}
      <div>
        {features.map((f, i) => (
          <div
            key={f.title}
            onClick={() => clickFeature(i)}
            className="py-10 min-h-[180px] lg:min-h-0 cursor-pointer select-none"
            style={{
              borderBottom: active === i
                ? '1.5px solid rgba(59,130,246,0.55)'
                : '1px solid rgba(25,25,24,0.06)',
              opacity: active === i ? 1 : 0.38,
              transition: 'opacity 0.35s ease, border-color 0.35s ease',
            }}
          >
            <h3 className="text-[15px] font-semibold tracking-tight text-text-primary">
              {f.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mt-1">
              {f.desc}
            </p>
          </div>
        ))}

        <div className="mt-10">
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            {cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── Right — sticky visual panel ── */}
      <div className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
        <div className="relative rounded-2xl border border-black/[0.08] overflow-hidden bg-[hsl(55_100%_97%)] aspect-[4/3]">
          {VISUALS.map((VisualComp, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity:   active === i ? 1 : 0,
                transform: active === i ? 'translateY(0px)' : 'translateY(10px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease',
                pointerEvents: active === i ? 'auto' : 'none',
              }}
            >
              <VisualComp />
            </div>
          ))}

          <span className="absolute bottom-3 right-4 font-mono text-[10px] tracking-[0.2em] text-text-dim uppercase pointer-events-none select-none z-10">
            {figLabel}
          </span>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {VISUALS.map((_, i) => (
              <button
                key={i}
                onClick={() => clickFeature(i)}
                aria-label={`Ver visual ${i + 1}`}
                className="focus:outline-none relative"
              >
                <div
                  className="w-5 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.10)' }}
                >
                  {active === i && (
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: '100%',
                        animation: locked ? 'none' : 'progress-bar 8s linear forwards',
                      }}
                    />
                  )}
                  {active !== i && (
                    <div className="h-full w-0 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
