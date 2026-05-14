'use client';

import Image from 'next/image';
import { MessageCircle, Mail, Instagram, Calendar, Database, FileSpreadsheet } from 'lucide-react';

const LEFT_NODES = [
  { icon: MessageCircle, label: 'WhatsApp',  color: '#25D366' },
  { icon: Mail,          label: 'E-mail',    color: '#0EA5E9' },
  { icon: Instagram,     label: 'Instagram', color: '#E1306C' },
];

const RIGHT_NODES = [
  { icon: Database,        label: 'CRM',      color: '#8B5CF6' },
  { icon: FileSpreadsheet, label: 'Planilha', color: '#22C55E' },
  { icon: Calendar,        label: 'Agenda',   color: '#F59E0B' },
];

export function AutomationFlowDiagram() {
  return (
    <div className="relative w-full aspect-[5/3]">
      {/* Identity dot grid background */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.18) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          opacity: 0.4,
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59,130,246,0.14) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      {/* SVG connecting lines — drawn first so they sit BEHIND the nodes */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          {/* userSpaceOnUse — gradient is fixed to the SVG viewport, not the path's bbox.
              Critical for straight horizontal paths (bbox height = 0 makes objectBoundingBox gradients invisible). */}
          <linearGradient id="flowGradLR" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
            <stop offset="0%"   stopColor="rgba(25,25,24,0.55)" />
            <stop offset="100%" stopColor="rgba(25,25,24,0.85)" />
          </linearGradient>
          <linearGradient id="flowGradRL" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
            <stop offset="0%"   stopColor="rgba(25,25,24,0.85)" />
            <stop offset="100%" stopColor="rgba(25,25,24,0.55)" />
          </linearGradient>
        </defs>

        {/* Subtle dotted lines, animated to flow toward the core — "data connection" feel. */}
        <g strokeWidth="0.55" fill="none" strokeDasharray="1 1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round">
          {/* LEFT → core (dashes travel rightward, toward center) */}
          <path d="M 28 17 C 40 17, 42 30, 50 30" stroke="url(#flowGradLR)" style={{ animation: 'flow-dash 5s linear infinite' }} />
          <path d="M 28 30 L 50 30"                stroke="url(#flowGradLR)" style={{ animation: 'flow-dash 5s linear infinite' }} />
          <path d="M 28 43 C 40 43, 42 30, 50 30" stroke="url(#flowGradLR)" style={{ animation: 'flow-dash 5s linear infinite' }} />

          {/* core → RIGHT (dashes travel rightward, away from center → toward right pills) */}
          <path d="M 50 30 C 58 30, 60 17, 72 17" stroke="url(#flowGradRL)" style={{ animation: 'flow-dash 5s linear infinite reverse' }} />
          <path d="M 50 30 L 72 30"                stroke="url(#flowGradRL)" style={{ animation: 'flow-dash 5s linear infinite reverse' }} />
          <path d="M 50 30 C 58 30, 60 43, 72 43" stroke="url(#flowGradRL)" style={{ animation: 'flow-dash 5s linear infinite reverse' }} />
        </g>
      </svg>

      {/* Nodes positioned absolutely — same coordinates as SVG end-points */}
      {/* Left column */}
      {LEFT_NODES.map((n, i) => (
        <div
          key={n.label}
          className="absolute -translate-x-full -translate-y-1/2 pr-1 sm:pr-2"
          style={{ left: '28%', top: `${[17, 30, 43][i] / 60 * 100}%` }}
        >
          <NodePill icon={n.icon} label={n.label} color={n.color} />
        </div>
      ))}

      {/* Right column */}
      {RIGHT_NODES.map((n, i) => (
        <div
          key={n.label}
          className="absolute -translate-y-1/2 pl-1 sm:pl-2"
          style={{ left: '72%', top: `${[17, 30, 43][i] / 60 * 100}%` }}
        >
          <NodePill icon={n.icon} label={n.label} color={n.color} />
        </div>
      ))}

      {/* Central node — Notkode "carinha" */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: '50%', top: '50%' }}
      >
        <div className="relative">
          <span
            className="absolute -inset-3 rounded-full pointer-events-none"
            style={{
              border: '1px solid rgba(25,25,24,0.35)',
              animation: 'flow-pulse 2.4s ease-out infinite',
            }}
          />
          <div
            className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              background: '#0F172A',
              boxShadow: '0 12px 30px -10px rgba(0,0,0,0.45)',
            }}
          >
            <Image
              src="/brand/carinha.png"
              alt="Notkode"
              width={96}
              height={96}
              className="w-12 h-12 lg:w-14 lg:h-14 object-contain"
              priority
            />
          </div>
        </div>
        <p className="font-bricolage mt-3 text-[14px] lg:text-[15px] font-bold text-text-primary tracking-tight">
          Agente IA
        </p>
      </div>
    </div>
  );
}

function NodePill({
  icon: Icon, label, color,
}: {
  icon: typeof MessageCircle;
  label: string;
  color: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap"
      style={{
        background: 'hsl(55 100% 97%)',
        border: '1px solid rgba(25,25,24,0.10)',
        boxShadow: '0 4px 12px -6px rgba(0,0,0,0.10)',
      }}
    >
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}1A` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={1.8} />
      </span>
      <span className="text-[12px] lg:text-[13px] font-semibold text-text-primary">
        {label}
      </span>
    </div>
  );
}
