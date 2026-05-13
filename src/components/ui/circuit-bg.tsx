'use client';

// ─── Section variant ──────────────────────────────────────────────────────────
// 10×4 grid, step 110, viewBox 1100×440 — same geometry as hero
const S_COLS = 10, S_ROWS = 4, S_STEP = 110, S_OX = 55, S_OY = 55;
const sPos = (r: number, c: number) => ({ x: S_OX + c * S_STEP, y: S_OY + r * S_STEP });
const sIdx = (r: number, c: number) => r * S_COLS + c;

const S_H: [number,number][] = [
  [sIdx(0,1),sIdx(0,2)],[sIdx(0,4),sIdx(0,5)],[sIdx(0,7),sIdx(0,8)],
  [sIdx(1,0),sIdx(1,1)],[sIdx(1,3),sIdx(1,4)],[sIdx(1,6),sIdx(1,7)],[sIdx(1,8),sIdx(1,9)],
  [sIdx(2,2),sIdx(2,3)],[sIdx(2,5),sIdx(2,6)],
  [sIdx(3,0),sIdx(3,1)],[sIdx(3,3),sIdx(3,4)],[sIdx(3,6),sIdx(3,7)],[sIdx(3,8),sIdx(3,9)],
];
const S_V: [number,number][] = [
  [sIdx(0,0),sIdx(1,0)],[sIdx(0,3),sIdx(1,3)],[sIdx(0,6),sIdx(1,6)],[sIdx(0,9),sIdx(1,9)],
  [sIdx(1,2),sIdx(2,2)],[sIdx(1,5),sIdx(2,5)],[sIdx(1,8),sIdx(2,8)],
  [sIdx(2,1),sIdx(3,1)],[sIdx(2,4),sIdx(3,4)],[sIdx(2,7),sIdx(3,7)],
];
const S_EDGES = [...S_H, ...S_V];
const S_SIGNALS: [number,number,number][] = [
  [1,0.0,3.5],[4,1.8,2.9],[7,3.2,3.8],[10,0.6,3.1],[15,2.4,4.0],[18,4.5,3.3],
];
const S_GLOW = new Map<number,number>([
  [sIdx(0,3),0.5],[sIdx(0,7),2.2],[sIdx(1,1),3.8],[sIdx(1,5),1.0],
  [sIdx(2,4),2.8],[sIdx(3,2),0.3],[sIdx(3,6),4.1],
]);

// ─── Card variant ─────────────────────────────────────────────────────────────
// 7×5 grid, step 60, viewBox 480×360 — fits inside 4:3 photo cards
const C_COLS = 7, C_ROWS = 5, C_STEP = 60, C_OX = 30, C_OY = 30;
const cPos = (r: number, c: number) => ({ x: C_OX + c * C_STEP, y: C_OY + r * C_STEP });
const cIdx = (r: number, c: number) => r * C_COLS + c;

const C_H: [number,number][] = [
  [cIdx(0,0),cIdx(0,1)],[cIdx(0,2),cIdx(0,3)],[cIdx(0,4),cIdx(0,5)],
  [cIdx(1,1),cIdx(1,2)],[cIdx(1,4),cIdx(1,5)],[cIdx(1,5),cIdx(1,6)],
  [cIdx(2,0),cIdx(2,1)],[cIdx(2,3),cIdx(2,4)],[cIdx(2,5),cIdx(2,6)],
  [cIdx(3,1),cIdx(3,2)],[cIdx(3,3),cIdx(3,4)],
  [cIdx(4,0),cIdx(4,1)],[cIdx(4,2),cIdx(4,3)],[cIdx(4,4),cIdx(4,5)],[cIdx(4,5),cIdx(4,6)],
];
const C_V: [number,number][] = [
  [cIdx(0,0),cIdx(1,0)],[cIdx(2,0),cIdx(3,0)],
  [cIdx(0,2),cIdx(1,2)],[cIdx(1,2),cIdx(2,2)],
  [cIdx(0,4),cIdx(1,4)],[cIdx(2,4),cIdx(3,4)],
  [cIdx(0,6),cIdx(1,6)],[cIdx(3,6),cIdx(4,6)],
  [cIdx(1,1),cIdx(2,1)],[cIdx(3,1),cIdx(4,1)],
  [cIdx(1,3),cIdx(2,3)],[cIdx(2,3),cIdx(3,3)],
  [cIdx(1,5),cIdx(2,5)],[cIdx(3,5),cIdx(4,5)],
];
const C_EDGES = [...C_H, ...C_V];
const C_SIGNALS: [number,number,number][] = [
  [0,0.0,2.5],[3,1.2,2.2],[7,2.6,2.8],[10,0.4,2.4],[14,1.9,2.7],[19,3.3,2.3],
];
const C_GLOW = new Map<number,number>([
  [cIdx(0,2),0.4],[cIdx(0,5),1.8],[cIdx(1,4),3.0],
  [cIdx(2,1),2.1],[cIdx(3,3),0.7],[cIdx(4,2),3.5],[cIdx(4,5),1.3],
]);

// ─── Component ────────────────────────────────────────────────────────────────
interface CircuitBgProps {
  variant?: 'section' | 'card';
  className?: string;
}

export function CircuitBg({ variant = 'section', className = '' }: CircuitBgProps) {
  const isCard = variant === 'card';

  const edges   = isCard ? C_EDGES   : S_EDGES;
  const signals = isCard ? C_SIGNALS : S_SIGNALS;
  const glow    = isCard ? C_GLOW    : S_GLOW;
  const cols    = isCard ? C_COLS    : S_COLS;
  const rows    = isCard ? C_ROWS    : S_ROWS;
  const getPos  = isCard ? cPos      : sPos;
  const vBox    = isCard ? '0 0 480 360' : '0 0 1100 440';
  const step    = isCard ? C_STEP    : S_STEP;

  // On dark (card) background: light lines. On light (section): blue lines.
  const ghostColor   = isCard ? 'rgba(255,255,255,0.10)' : 'rgba(59,130,246,0.12)';
  const signalColor  = isCard ? 'rgba(147,197,253,0.90)' : 'rgba(59,130,246,0.85)';
  const dotColor     = isCard ? 'rgba(255,255,255,0.14)' : 'rgba(59,130,246,0.15)';
  const glowColor    = isCard ? 'rgba(147,197,253,0.55)' : 'rgba(59,130,246,0.50)';
  const dashLen      = isCard ? 10 : 14;
  const dashGap      = step - dashLen;

  const sigMap = new Map(signals.map(([i, d, dur]) => [i, { d, dur }]));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {!isCard && (
        <div style={{
          position: 'absolute',
          width: '700px', height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 65%)',
          filter: 'blur(80px)',
          top: '-5%', left: '25%',
          animation: 'hero-glow-drift 24s ease-in-out infinite',
          willChange: 'transform',
        }} />
      )}

      <svg
        viewBox={vBox}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isCard ? 0.75 : 0.65 }}
      >
        {/* Ghost grid */}
        {edges.map(([a, b], i) => {
          const pa = getPos(Math.floor(a / cols), a % cols);
          const pb = getPos(Math.floor(b / cols), b % cols);
          return (
            <line key={`g${i}`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={ghostColor} strokeWidth={isCard ? 0.5 : 0.5}
            />
          );
        })}

        {/* Traveling signals */}
        {edges.map(([a, b], i) => {
          const sig = sigMap.get(i);
          if (!sig) return null;
          const pa = getPos(Math.floor(a / cols), a % cols);
          const pb = getPos(Math.floor(b / cols), b % cols);
          return (
            <line key={`s${i}`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={signalColor}
              strokeWidth={isCard ? 1.0 : 1.2}
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeLinecap="round"
              style={{ animation: `signal-travel ${sig.dur}s ease-in-out ${sig.d}s infinite` }}
            />
          );
        })}

        {/* Nodes */}
        {Array.from({ length: rows * cols }, (_, i) => {
          const { x, y } = getPos(Math.floor(i / cols), i % cols);
          const delay = glow.get(i);
          const isGlow = delay !== undefined;
          const dur = 5 + (i % 3);
          return (
            <g key={`n${i}`}>
              {isGlow && (
                <circle cx={x} cy={y} r={isCard ? 5 : 7}
                  fill={isCard ? 'rgba(147,197,253,0.0)' : 'rgba(59,130,246,0.0)'}
                  style={{ animation: `node-ring ${dur}s ease-in-out ${delay}s infinite` }}
                />
              )}
              <circle cx={x} cy={y}
                r={isGlow ? (isCard ? 2.2 : 2.5) : (isCard ? 1.3 : 1.6)}
                fill={isGlow ? glowColor : dotColor}
                style={isGlow ? { animation: `node-glow ${dur}s ease-in-out ${delay}s infinite` } : undefined}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
