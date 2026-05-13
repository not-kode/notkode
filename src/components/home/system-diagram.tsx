'use client';

const CX = 256, CY = 218;
const ORBIT_R = 142;
const CORE_R  = 36;
const NODE_R  = 11;

function pol(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: parseFloat((CX + r * Math.sin(rad)).toFixed(4)),
    y: parseFloat((CY - r * Math.cos(rad)).toFixed(4)),
  };
}

const MODULES = [
  { label: 'CRM & Leads', node: pol(ORBIT_R, 0),   label_pos: pol(ORBIT_R + 38, 0)   },
  { label: 'Agentes IA',  node: pol(ORBIT_R, 60),  label_pos: pol(ORBIT_R + 38, 60)  },
  { label: 'Dashboard',   node: pol(ORBIT_R, 120), label_pos: pol(ORBIT_R + 38, 120) },
  { label: 'Relatórios',  node: pol(ORBIT_R, 180), label_pos: pol(ORBIT_R + 38, 180) },
  { label: 'Financeiro',  node: pol(ORBIT_R, 240), label_pos: pol(ORBIT_R + 38, 240) },
  { label: 'Automação',   node: pol(ORBIT_R, 300), label_pos: pol(ORBIT_R + 38, 300) },
];

const NEAR = MODULES.map((_, i) => pol(CORE_R + 2,          i * 60));
const FAR  = MODULES.map((_, i) => pol(ORBIT_R - NODE_R - 2, i * 60));

function textAnchor(x: number) {
  if (x < CX - 12) return 'end';
  if (x > CX + 12) return 'start';
  return 'middle';
}

export function SystemDiagram() {
  const cx = CX, cy = CY;
  const orbitR = ORBIT_R;
  const coreR  = CORE_R;

  return (
    <div className="relative w-full select-none" aria-hidden>
      <span className="absolute top-0 right-0 font-mono text-[10px] tracking-[0.22em] text-text-dim uppercase">
        FIG. 001
      </span>

      <svg
        viewBox="0 0 512 436"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <filter id="core-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="rgba(25,25,24,0.08)" />
          </filter>
        </defs>

        {/* ── Outer orbit ring — rotates ── */}
        <circle
          cx={cx} cy={cy} r={orbitR}
          stroke="rgba(25,25,24,0.14)"
          strokeWidth="1"
          strokeDasharray="3 6"
          style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'diagram-orbit 70s linear infinite' }}
        />

        {/* ── Inner halo ring ── */}
        <circle cx={cx} cy={cy} r={62} fill="#E8E4DA" stroke="rgba(25,25,24,0.05)" strokeWidth="1" />

        {/* ── Connection lines from core to each module ── */}
        {MODULES.map((m, i) => (
          <line
            key={`line-${m.label}`}
            x1={NEAR[i].x} y1={NEAR[i].y}
            x2={FAR[i].x}  y2={FAR[i].y}
            stroke="rgba(59,130,246,0.18)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        ))}

        {/* ── Module nodes ── */}
        {MODULES.map((m) => (
          <g key={m.label}>
            <circle
              cx={m.node.x} cy={m.node.y} r={NODE_R}
              fill="#EDE8DF"
              stroke="rgba(25,25,24,0.12)"
              strokeWidth="1"
              filter="url(#node-shadow)"
            />
            <circle cx={m.node.x} cy={m.node.y} r={3.5} fill="rgba(59,130,246,0.6)" />
            <text
              x={m.label_pos.x} y={m.label_pos.y}
              textAnchor={textAnchor(m.node.x)}
              fill="rgba(25,25,24,0.48)"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="0.06em"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* ── Core glow halo (pulses) ── */}
        <circle
          cx={cx} cy={cy} r={coreR + 10}
          fill="rgba(59,130,246,0.1)"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: 'diagram-pulse 3.5s ease-in-out infinite',
          }}
        />

        {/* ── Core circle (pulses with glow) ── */}
        <circle
          cx={cx} cy={cy} r={coreR}
          fill="#3B82F6"
          filter="url(#core-glow)"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: 'diagram-pulse 3.5s ease-in-out infinite',
          }}
        />

        {/* "N" monogram */}
        <text
          x={cx} y={cy + 7}
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          letterSpacing="-0.04em"
          style={{ pointerEvents: 'none' }}
        >
          N
        </text>
      </svg>
    </div>
  );
}
