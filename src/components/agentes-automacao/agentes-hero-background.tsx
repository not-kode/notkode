'use client';

const BLOBS = [
  // Laranja quente — top left
  { w: 560, h: 480, top: '-10%', left: '-8%',  color: 'rgba(251,146,60,0.18)',  blur: 130, dur: 24, delay:  0  },
  // Âmbar suave — top right
  { w: 480, h: 420, top: '-5%',  left: '55%',  color: 'rgba(252,211,77,0.13)',  blur: 120, dur: 28, delay: -7  },
  // Azul claro — meio
  { w: 500, h: 440, top: '30%',  left: '30%',  color: 'rgba(147,197,253,0.18)', blur: 110, dur: 26, delay: -4  },
  // Azul bem claro — canto direito
  { w: 420, h: 380, top: '45%',  left: '70%',  color: 'rgba(186,230,253,0.14)', blur: 115, dur: 30, delay: -12 },
  // Laranja difuso — embaixo esquerda
  { w: 400, h: 360, top: '60%',  left: '5%',   color: 'rgba(253,186,116,0.12)', blur: 120, dur: 22, delay: -9  },
];

export function AgentesHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: b.w,
            height: b.h,
            top: b.top,
            left: b.left,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${b.color} 0%, transparent 65%)`,
            filter: `blur(${b.blur}px)`,
            willChange: 'transform',
            animation: `hero-glow-drift ${b.dur}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
