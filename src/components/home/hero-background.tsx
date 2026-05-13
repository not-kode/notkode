'use client';

const COLS = 10;
const ROWS = 4;
const STEP = 110;
const OX   = 55;
const OY   = 55;

const pos = (r: number, c: number) => ({ x: OX + c * STEP, y: OY + r * STEP });
const idx = (r: number, c: number) => r * COLS + c;

const H_EDGES: [number, number][] = [
  [idx(0,0), idx(0,1)], [idx(0,1), idx(0,2)],
  [idx(0,3), idx(0,4)], [idx(0,4), idx(0,5)],
  [idx(0,6), idx(0,7)], [idx(0,7), idx(0,8)], [idx(0,8), idx(0,9)],
  [idx(1,0), idx(1,1)],
  [idx(1,2), idx(1,3)], [idx(1,3), idx(1,4)],
  [idx(1,5), idx(1,6)],
  [idx(1,7), idx(1,8)], [idx(1,8), idx(1,9)],
  [idx(2,1), idx(2,2)], [idx(2,2), idx(2,3)],
  [idx(2,4), idx(2,5)], [idx(2,5), idx(2,6)],
  [idx(2,7), idx(2,8)],
  [idx(3,0), idx(3,1)],
  [idx(3,2), idx(3,3)], [idx(3,3), idx(3,4)],
  [idx(3,5), idx(3,6)],
  [idx(3,7), idx(3,8)], [idx(3,8), idx(3,9)],
];

const V_EDGES: [number, number][] = [
  [idx(0,0), idx(1,0)], [idx(2,0), idx(3,0)],
  [idx(0,2), idx(1,2)], [idx(1,2), idx(2,2)],
  [idx(0,4), idx(1,4)], [idx(2,4), idx(3,4)],
  [idx(0,6), idx(1,6)], [idx(1,6), idx(2,6)],
  [idx(0,8), idx(1,8)], [idx(2,8), idx(3,8)],
  [idx(1,1), idx(2,1)], [idx(2,1), idx(3,1)],
  [idx(0,3), idx(1,3)], [idx(2,3), idx(3,3)],
  [idx(1,5), idx(2,5)], [idx(2,5), idx(3,5)],
  [idx(0,7), idx(1,7)], [idx(2,7), idx(3,7)],
  [idx(0,9), idx(1,9)], [idx(1,9), idx(2,9)],
];

const ALL_EDGES = [...H_EDGES, ...V_EDGES];

// Edges where a light signal travels — each with [edgeIndex, delaySecs, durationSecs]
const SIGNALS: [number, number, number][] = [
  [1,  0.0, 3.2],
  [4,  1.4, 2.8],
  [10, 2.7, 3.5],
  [16, 0.8, 3.0],
  [21, 3.5, 2.6],
  [27, 1.9, 3.8],
  [33, 4.2, 3.1],
  [38, 0.5, 2.9],
];
const SIGNAL_MAP = new Map(SIGNALS.map(([i, d, dur]) => [i, { d, dur }]));

// Nodes that glow — [nodeIdx, delaySecs]
const GLOW_NODES: [number, number][] = [
  [idx(0,2),  0.3],
  [idx(0,5),  2.1],
  [idx(0,8),  4.0],
  [idx(1,1),  1.2],
  [idx(1,4),  3.3],
  [idx(1,7),  0.8],
  [idx(2,3),  2.6],
  [idx(2,6),  1.5],
  [idx(3,2),  3.8],
  [idx(3,7),  0.2],
];
const GLOW_MAP = new Map(GLOW_NODES);

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>

      {/* Soft blue glow blob */}
      <div style={{
        position: 'absolute',
        width: '700px', height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)',
        filter: 'blur(80px)',
        top: '-5%', left: '25%',
        animation: 'hero-glow-drift 22s ease-in-out infinite',
        willChange: 'transform',
      }} />

      <svg
        viewBox="0 0 1100 440"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Ghost grid — all edges very faint */}
        {ALL_EDGES.map(([a, b], i) => {
          const pa = pos(Math.floor(a / COLS), a % COLS);
          const pb = pos(Math.floor(b / COLS), b % COLS);
          return (
            <line
              key={`g${i}`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="rgba(59,130,246,0.13)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Traveling signals — bright dot moves along selected edges */}
        {ALL_EDGES.map(([a, b], i) => {
          const sig = SIGNAL_MAP.get(i);
          if (!sig) return null;
          const pa = pos(Math.floor(a / COLS), a % COLS);
          const pb = pos(Math.floor(b / COLS), b % COLS);
          return (
            <line
              key={`s${i}`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="rgba(59,130,246,0.9)"
              strokeWidth="1.2"
              strokeDasharray="14 96"
              strokeLinecap="round"
              style={{
                animation: `signal-travel ${sig.dur}s ease-in-out ${sig.d}s infinite`,
              }}
            />
          );
        })}

        {/* Nodes */}
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const { x, y } = pos(Math.floor(i / COLS), i % COLS);
          const delay = GLOW_MAP.get(i);
          const isGlow = delay !== undefined;
          return (
            <g key={`n${i}`}>
              {isGlow && (
                <circle
                  cx={x} cy={y} r={7}
                  fill="rgba(59,130,246,0.0)"
                  stroke="rgba(59,130,246,0.0)"
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
