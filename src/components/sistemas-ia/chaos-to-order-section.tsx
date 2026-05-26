'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  FileSpreadsheet,
  MessageCircle,
  Mail,
  Database,
  Calendar,
  DollarSign,
  ArrowDown,
} from 'lucide-react';

type IconConfig = {
  Icon: typeof FileSpreadsheet;
  labelKey: 'chaosIconPlanilha' | 'chaosIconWhatsApp' | 'chaosIconEmail' | 'chaosIconCrm' | 'chaosIconAgenda' | 'chaosIconFinanceiro';
  color: string;
  bg: string;
  scatter: { x: number; y: number; rot: number };
  organized: { x: number; y: number };
  floatDelay: number;
  floatDuration: number;
};

const ICONS: IconConfig[] = [
  {
    Icon: FileSpreadsheet,
    labelKey: 'chaosIconPlanilha',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.10)',
    scatter: { x: -500, y: -200, rot: -8 },
    organized: { x: -325, y: 220 },
    floatDelay: 0,
    floatDuration: 5.5,
  },
  {
    Icon: MessageCircle,
    labelKey: 'chaosIconWhatsApp',
    color: '#25D366',
    bg: 'rgba(37,211,102,0.10)',
    scatter: { x: 500, y: -220, rot: 12 },
    organized: { x: -195, y: 220 },
    floatDelay: 0.8,
    floatDuration: 6.2,
  },
  {
    Icon: Mail,
    labelKey: 'chaosIconEmail',
    color: '#EA4335',
    bg: 'rgba(234,67,53,0.08)',
    scatter: { x: -540, y: 20, rot: -15 },
    organized: { x: -65, y: 220 },
    floatDelay: 1.6,
    floatDuration: 5.8,
  },
  {
    Icon: Database,
    labelKey: 'chaosIconCrm',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.10)',
    scatter: { x: 540, y: 30, rot: 9 },
    organized: { x: 65, y: 220 },
    floatDelay: 0.4,
    floatDuration: 6.5,
  },
  {
    Icon: Calendar,
    labelKey: 'chaosIconAgenda',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.10)',
    scatter: { x: -460, y: 220, rot: -5 },
    organized: { x: 195, y: 220 },
    floatDelay: 2.2,
    floatDuration: 5.4,
  },
  {
    Icon: DollarSign,
    labelKey: 'chaosIconFinanceiro',
    color: '#EAB308',
    bg: 'rgba(234,179,8,0.10)',
    scatter: { x: 480, y: 240, rot: 11 },
    organized: { x: 325, y: 220 },
    floatDelay: 1.2,
    floatDuration: 6.0,
  },
];


function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function ChaosToOrderSection() {
  const t = useTranslations('SistemasIA');
  const BULLETS_PHASE_1 = [
    t('chaosBullet1'),
    t('chaosBullet2'),
    t('chaosBullet3'),
    t('chaosBullet4'),
  ];
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const passed = -rect.top;
      setProgress(clamp01(passed / scrollable));
    };
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Phase 1 text (Pra quem é): visible while progress 0 → 0.55
  // Phase 2 text (A situação): visible from 0.5 onward
  const phase1TextOpacity = clamp01((0.55 - progress) / 0.15);
  const phase2TextOpacity = clamp01((progress - 0.5) / 0.15);

  // Icon morph: 0 = scattered chaos, 1 = organized row
  const morph = easeInOutCubic(clamp01((progress - 0.4) / 0.3));

  // End nudge (arrow appears near end of section)
  const endNudge = clamp01((progress - 0.85) / 0.15);

  return (
    <section
      ref={containerRef}
      className="relative bg-surface-base lg:min-h-[240vh]"
    >
      {/* ───────────── MOBILE LAYOUT (stacked, no sticky scroll) ───────────── */}
      <div className="lg:hidden container mx-auto px-5 py-24 lg:py-32">
        {/* ── Phase 1 — Você se reconhece aqui? (caos visual) ── */}
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-7">
            {t('chaosPhase1Heading')}{' '}
            <span className="font-bricolage">{t('chaosPhase1HeadingAccent')}</span>
          </h2>
          <ul className="space-y-3.5 text-left max-w-md mx-auto mb-10">
            {BULLETS_PHASE_1.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 items-start text-[15px] text-text-secondary leading-relaxed"
              >
                <Check className="w-4 h-4 mt-1 text-primary flex-shrink-0" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Chaos visual — scattered icons + messy connection lines */}
          <ChaosVisualMobile />
        </div>

        {/* ── Phase 2 — Sua operação ficou pra trás + system preview ── */}
        <div className="mt-20 max-w-xl mx-auto text-center">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] mb-2">
              {t('chaosPhase2HeadingLine1')}
            </h2>
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] mb-7">
              <span className="font-bricolage">{t('chaosPhase2HeadingAccent')}</span>
            </h2>
            <p className="text-[15px] text-text-secondary leading-[1.7] mb-7">
              {t('chaosPhase2Body')}
            </p>
            <p className="text-[16px] text-text-primary font-medium mb-10">
              {t('chaosPhase2OutroBefore')}
              <span className="text-primary">{t('chaosPhase2OutroAccent')}</span>
              {t('chaosPhase2OutroAfter')}
            </p>

            {/* System preview — partial mockup showing menu+nav */}
            <SystemPreviewMobile />

            {/* Pull-down arrow */}
            <div className="flex flex-col items-center mt-8">
              <span className="font-mono text-[10.5px] text-text-muted tracking-tight mb-1.5">
                {t('chaosEndNudge')}
              </span>
              <ArrowDown className="w-5 h-5 text-primary animate-bounce" strokeWidth={2.5} />
            </div>
        </div>
      </div>

      {/* ───────────── DESKTOP LAYOUT (sticky scroll animation) ───────────── */}
      <div className="hidden lg:flex sticky top-0 h-screen overflow-hidden items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">

          {/* ── Connection rail (thin line + nodes that "draw" as tags organize) ── */}
          <svg
            className="hidden lg:block absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              width: '720px',
              height: '20px',
              transform: 'translate(-50%, calc(-50% + 220px))',
              overflow: 'visible',
              opacity: morph,
            }}
            aria-hidden
          >
            {/* Horizontal connection line (drawn left → right with stroke-dashoffset) */}
            <line
              x1={360 - 325}
              y1="10"
              x2={360 + 325}
              y2="10"
              stroke="rgba(75,210,229,0.55)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="650"
              strokeDashoffset={650 * (1 - morph)}
            />
            {/* Small nodes at each tag's center */}
            {[-325, -195, -65, 65, 195, 325].map((x, i) => (
              <circle
                key={i}
                cx={360 + x}
                cy="10"
                r="2.5"
                fill="rgb(75,210,229)"
                opacity={Math.max(0, morph - 0.7) * 3.3}
              />
            ))}
          </svg>

          {/* ── Floating tag icons (always rendered, morph between scatter and organized) ── */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            {ICONS.map(({ Icon, labelKey, color, bg, scatter, organized, floatDelay, floatDuration }, i) => {
              const x = lerp(scatter.x, organized.x, morph);
              const y = lerp(scatter.y, organized.y, morph);
              const rot = scatter.rot * (1 - morph);
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 will-change-transform"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot}deg)`,
                  }}
                >
                  {/* Inner wrapper for idle float animation */}
                  <div
                    className="chaos-float"
                    style={{
                      animationDelay: `${floatDelay}s`,
                      animationDuration: `${floatDuration}s`,
                    }}
                  >
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white"
                      style={{
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: bg }}
                      >
                        <Icon className="w-[13px] h-[13px]" style={{ color }} strokeWidth={2.2} />
                      </span>
                      <span className="font-mono text-[11px] text-text-secondary tracking-tight whitespace-nowrap">
                        {t(labelKey)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PHASE 1 TEXT: Você se reconhece aqui? ── */}
          <div
            className="absolute inset-0 flex items-center justify-center px-5 lg:px-8"
            style={{
              opacity: phase1TextOpacity,
              pointerEvents: phase1TextOpacity > 0.5 ? 'auto' : 'none',
              transform: `translateY(${(1 - phase1TextOpacity) * -20}px)`,
              transition: 'transform 0.2s',
            }}
          >
            <div className="relative z-10 max-w-xl text-center">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-8">
                {t('chaosPhase1Heading')}{' '}
                <span className="font-bricolage">{t('chaosPhase1HeadingAccent')}</span>
              </h2>
              <ul className="space-y-4 text-left">
                {BULLETS_PHASE_1.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 items-start text-[15px] lg:text-[16px] text-text-secondary leading-relaxed"
                  >
                    <Check className="w-4 h-4 mt-1 text-primary flex-shrink-0" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── PHASE 2 TEXT: Sua empresa cresceu / situação resumida ── */}
          <div
            className="absolute inset-0 flex items-center justify-center px-5 lg:px-8"
            style={{
              opacity: phase2TextOpacity,
              pointerEvents: phase2TextOpacity > 0.5 ? 'auto' : 'none',
              transform: `translateY(${(1 - phase2TextOpacity) * 20}px)`,
              transition: 'transform 0.2s',
            }}
          >
            <div className="relative z-10 max-w-2xl text-center -translate-y-12 lg:-translate-y-16">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] mb-2">
                {t('chaosPhase2HeadingLine1')}
              </h2>
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] mb-8">
                <span className="font-bricolage">{t('chaosPhase2HeadingAccent')}</span>
              </h2>
              <p className="text-[15px] lg:text-[17px] text-text-secondary leading-[1.7] max-w-xl mx-auto">
                {t('chaosPhase2Body')}
              </p>
              <p className="text-[16px] lg:text-[18px] text-text-primary font-medium mt-7 max-w-xl mx-auto">
                {t('chaosPhase2OutroBefore')}
                <span className="text-primary">{t('chaosPhase2OutroAccent')}</span>
                {t('chaosPhase2OutroAfter')}
              </p>
            </div>
          </div>

          {/* ── End nudge: arrow pulling toward next section ── */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-500"
            style={{ opacity: endNudge }}
          >
            <span className="font-mono text-[11px] text-text-muted tracking-tight mb-1.5">
              {t('chaosEndNudge')}
            </span>
            <ArrowDown className="w-5 h-5 text-primary animate-bounce" strokeWidth={2.5} />
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MOBILE, Chaos visual (Phase 1)
   Scattered icons + messy connection lines
───────────────────────────────────────────── */
function ChaosVisualMobile() {
  const t = useTranslations('SistemasIA');
  // Scattered positions in canvas (% of width/height) — simétrico em torno do centro
  const positions = [
    { x: 24, y: 14, rot: -8 },  // Planilha (top-left)
    { x: 76, y: 12, rot: 11 },  // WhatsApp (top-right)
    { x: 18, y: 48, rot: -14 }, // E-mail (mid-left)
    { x: 82, y: 50, rot: 7 },   // CRM (mid-right)
    { x: 32, y: 86, rot: -5 },  // Agenda (bottom-left)
    { x: 68, y: 84, rot: 13 },  // Financeiro (bottom-right)
  ];

  // Messy connection lines between random pairs (overlapping, no clear pattern)
  const lines = [
    { from: 0, to: 3, curve: 30 },
    { from: 1, to: 2, curve: -40 },
    { from: 0, to: 5, curve: -25 },
    { from: 2, to: 4, curve: 20 },
    { from: 1, to: 5, curve: 35 },
    { from: 3, to: 4, curve: -30 },
    { from: 0, to: 2, curve: 15 },
  ];

  const W = 320;
  const H = 300;

  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: W, height: H }}>
      {/* SVG layer — messy connection lines */}
      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        {lines.map(({ from, to, curve }, i) => {
          const a = positions[from];
          const b = positions[to];
          const x1 = (a.x / 100) * W;
          const y1 = (a.y / 100) * H;
          const x2 = (b.x / 100) * W;
          const y2 = (b.y / 100) * H;
          const mx = (x1 + x2) / 2 + curve;
          const my = (y1 + y2) / 2 + curve * 0.5;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              stroke="rgba(25,25,24,0.18)"
              strokeWidth="1"
              strokeDasharray="3 3"
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Scattered icon tags */}
      {ICONS.map(({ Icon, labelKey, color, bg }, i) => {
        const p = positions[i];
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            }}
          >
            <div
              className="chaos-float inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white"
              style={{
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${5 + (i % 3) * 0.7}s`,
              }}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: bg }}
              >
                <Icon className="w-[10px] h-[10px]" style={{ color }} strokeWidth={2.2} />
              </span>
              <span className="font-mono text-[10px] text-text-secondary tracking-tight whitespace-nowrap">
                {t(labelKey)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MOBILE, System preview (Phase 2)
   Partial dashboard mockup: sidebar menu + main nav
───────────────────────────────────────────── */
function SystemPreviewMobile() {
  const t = useTranslations('Mockup');
  return (
    <div className="relative mx-auto max-w-sm">
      {/* Soft cyan glow */}
      <div
        className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(75,210,229,0.18) 0%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      <div
        className="relative rounded-xl overflow-hidden border border-black/[0.08]"
        style={{
          boxShadow: '0 16px 40px -16px rgba(75,210,229,0.22), 0 8px 24px -8px rgba(0,0,0,0.12)',
          background: 'hsl(55 100% 97%)',
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-1.5 px-3 h-7 border-b border-black/[0.06]"
          style={{ background: 'rgba(25,25,24,0.04)' }}
        >
          <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
          <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
          <div className="w-2 h-2 rounded-full bg-[#28C840]" />
          <div className="flex-1 mx-auto max-w-[60%] h-4 rounded px-2 flex items-center" style={{ background: 'rgba(25,25,24,0.05)' }}>
            <span className="font-mono text-[7px] text-text-dim truncate">
              {t('browserUrlShort')}
            </span>
          </div>
        </div>

        {/* App layout */}
        <div className="flex">
          {/* Sidebar */}
          <aside
            className="flex flex-col w-[88px] shrink-0 border-r border-black/[0.06] py-3 px-2"
            style={{ background: 'rgba(25,25,24,0.02)' }}
          >
            {/* Logo */}
            <div className="flex items-center gap-1.5 px-1 mb-4">
              <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">N</span>
              </div>
              <span className="text-[8px] font-semibold text-text-primary truncate">{t('companyShort')}</span>
            </div>

            {/* Nav items */}
            <nav className="space-y-1">
              {[
                { label: t('navDashboard'), active: true },
                { label: t('navOrders'), count: '12' },
                { label: t('navCustomers') },
                { label: t('navCrm') },
                { label: t('navReports') },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1 px-1.5 py-1 rounded"
                  style={{
                    background: item.active ? 'rgba(75,210,229,0.12)' : 'transparent',
                  }}
                >
                  <div
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ background: item.active ? '#4BD2E5' : 'rgba(25,25,24,0.3)' }}
                  />
                  <span
                    className="text-[7.5px] font-medium flex-1 text-left"
                    style={{ color: item.active ? '#4BD2E5' : 'rgba(25,25,24,0.55)' }}
                  >
                    {item.label}
                  </span>
                  {item.count && (
                    <span
                      className="text-[6px] font-mono px-1 rounded-full"
                      style={{ background: 'rgba(25,25,24,0.06)', color: 'rgba(25,25,24,0.5)' }}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              ))}
            </nav>

            {/* IA badge */}
            <div className="mt-auto pt-3">
              <div
                className="rounded p-1.5"
                style={{
                  background: 'rgba(75,210,229,0.10)',
                  border: '1px solid rgba(75,210,229,0.22)',
                }}
              >
                <p className="font-mono text-[6px] text-primary uppercase tracking-widest leading-none mb-0.5">
                  {t('aiActiveBadge')}
                </p>
                <p className="text-[7px] text-text-secondary leading-tight">{t('aiActiveSubShort')}</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-3">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3 text-left">
              <div>
                <p className="font-mono text-[6.5px] text-text-dim uppercase tracking-widest mb-0.5">
                  {t('overviewLabel')}
                </p>
                <h4 className="text-[11px] font-semibold text-text-primary leading-tight">
                  {t('greeting')}
                </h4>
              </div>
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">C</span>
              </div>
            </div>

            {/* 2 mini stat cards */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <div
                className="rounded p-1.5 text-left"
                style={{ background: 'rgba(25,25,24,0.03)', border: '1px solid rgba(25,25,24,0.06)' }}
              >
                <p className="font-mono text-[6px] text-text-dim uppercase tracking-wider mb-0.5">
                  {t('statSalesShort')}
                </p>
                <p className="text-[10px] font-bold text-text-primary leading-none">R$ 24.8k</p>
              </div>
              <div
                className="rounded p-1.5 text-left"
                style={{ background: 'rgba(75,210,229,0.06)', border: '1px solid rgba(75,210,229,0.20)' }}
              >
                <p className="font-mono text-[6px] text-primary uppercase tracking-wider mb-0.5">
                  {t('statOrdersLabel')}
                </p>
                <p className="text-[10px] font-bold text-text-primary leading-none">48</p>
              </div>
            </div>

            {/* Mini chart placeholder */}
            <div
              className="rounded p-1.5 text-left"
              style={{ background: 'rgba(25,25,24,0.02)', border: '1px solid rgba(25,25,24,0.06)' }}
            >
              <p className="font-mono text-[6.5px] text-text-dim uppercase tracking-wider mb-1.5">
                {t('chartTitleShort')}
              </p>
              <div className="flex items-end gap-0.5 h-6">
                {[35, 50, 42, 65, 58, 80, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      background: i === 5 ? '#4BD2E5' : 'rgba(75,210,229,0.30)',
                    }}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
