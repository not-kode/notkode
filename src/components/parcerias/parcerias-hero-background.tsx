'use client';

// Aurora-style mesh gradient — large blurred blobs that mix into a warm color wash
const BLOBS = [
  // Top region
  { w: 600, h: 500, top:  '-15%', left: '-5%',  color: 'rgba(59,130,246,0.32)',  blur: 120, dur: 22, delay:  0    },
  { w: 520, h: 460, top:  '-8%',  left: '40%',  color: 'rgba(147,197,253,0.30)', blur: 110, dur: 26, delay: -8    },
  { w: 540, h: 480, top:  '-12%', left: '70%',  color: 'rgba(99,102,241,0.26)',  blur: 130, dur: 24, delay: -4    },

  // Middle / bottom
  { w: 460, h: 420, top:  '40%',  left: '15%',  color: 'rgba(59,130,246,0.22)',  blur: 120, dur: 28, delay: -12   },
  { w: 500, h: 460, top:  '50%',  left: '55%',  color: 'rgba(147,197,253,0.28)', blur: 115, dur: 30, delay: -16   },
  { w: 420, h: 400, top:  '60%',  left: '80%',  color: 'rgba(99,102,241,0.22)',  blur: 110, dur: 26, delay: -6    },
];

export function ParceriasHeroBackground() {
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
