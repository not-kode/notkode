'use client';

// Grid SVG com sinais viajando + nodes pulsando — adaptado do hero da home
// Limitado à metade esquerda do hero (onde está o texto),
// deixando o mockup de app à direita completamente limpo.

const STEP = 100;
const OX   = 65;
const OY   = 55;

// 5 colunas × 4 linhas — ocupa x: 65..465 (metade esquerda do viewBox 1100x420)
const pos = (r: number, c: number) => ({ x: OX + c * STEP, y: OY + r * STEP });

// Edges: [nodeA, nodeB] usando índice r*5+c
const H_EDGES: [number, number][] = [
  [0,  1], [2,  3], [3,  4],        // row 0
  [5,  6], [8,  9],                  // row 1
  [10, 11], [12, 13],                // row 2
  [15, 16], [17, 18], [18, 19],      // row 3
];
const V_EDGES: [number, number][] = [
  [0,  5], [5,  10],                 // col 0
  [1,  6],                           // col 1 top
  [6,  11], [11, 16],               // col 1 bottom
  [2,  7], [7,  12],                // col 2
  [3,  8], [13, 18],                // col 3
  [4,  9], [9,  14], [14, 19],      // col 4
];

const ALL_EDGES = [...H_EDGES, ...V_EDGES];

// [edgeIndex, delaySecs, durationSecs]
const SIGNALS: [number, number, number][] = [
  [0,  0.0, 3.2],
  [3,  1.6, 2.8],
  [7,  0.9, 3.5],
  [11, 2.4, 3.0],
  [14, 3.8, 2.6],
];
const SIGNAL_MAP = new Map(SIGNALS.map(([i, d, dur]) => [i, { d, dur }]));

// [nodeIndex, delaySecs]
const GLOW_NODES: [number, number][] = [
  [1,  0.4],
  [3,  2.0],
  [6,  1.3],
  [9,  3.5],
  [12, 0.7],
  [16, 2.8],
];
const GLOW_MAP = new Map(GLOW_NODES);

export function SistemasHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>

      {/* Glow blob suave concentrado à esquerda */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 65%)',
        filter: 'blur(80px)',
        top: '-10%',
        left: '-5%',
        animation: 'hero-glow-drift 22s ease-in-out infinite',
        willChange: 'transform',
      }} />

      {/* SVG da rede — ocupa full container mas nodes/edges só à esquerda */}
      <svg
        viewBox="0 0 1100 420"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Ghost grid — linhas faint */}
        {ALL_EDGES.map(([a, b], i) => {
          const pa = pos(Math.floor(a / 5), a % 5);
          const pb = pos(Math.floor(b / 5), b % 5);
          return (
            <line
              key={`g${i}`}
              x1={pa.x} y1={pa.y}
              x2={pb.x} y2={pb.y}
              stroke="rgba(59,130,246,0.12)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Sinais viajando */}
        {ALL_EDGES.map(([a, b], i) => {
          const sig = SIGNAL_MAP.get(i);
          if (!sig) return null;
          const pa = pos(Math.floor(a / 5), a % 5);
          const pb = pos(Math.floor(b / 5), b % 5);
          return (
            <line
              key={`s${i}`}
              x1={pa.x} y1={pa.y}
              x2={pb.x} y2={pb.y}
              stroke="rgba(59,130,246,0.85)"
              strokeWidth="1.2"
              strokeDasharray="12 88"
              strokeLinecap="round"
              style={{ animation: `signal-travel ${sig.dur}s ease-in-out ${sig.d}s infinite` }}
            />
          );
        })}

        {/* Nodes */}
        {Array.from({ length: 20 }, (_, i) => {
          const { x, y } = pos(Math.floor(i / 5), i % 5);
          const delay = GLOW_MAP.get(i);
          const isGlow = delay !== undefined;
          return (
            <g key={`n${i}`}>
              {isGlow && (
                <circle
                  cx={x} cy={y} r={7}
                  fill="none"
                  stroke="rgba(59,130,246,0)"
                  style={{ animation: `node-ring ${5 + (i % 3)}s ease-in-out ${delay}s infinite` }}
                />
              )}
              <circle
                cx={x} cy={y}
                r={isGlow ? 2.5 : 1.6}
                fill={isGlow ? 'rgba(59,130,246,0.50)' : 'rgba(59,130,246,0.15)'}
                style={isGlow ? { animation: `node-glow ${5 + (i % 3)}s ease-in-out ${delay}s infinite` } : undefined}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
