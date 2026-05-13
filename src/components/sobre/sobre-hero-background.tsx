'use client';

// Vertical falling lines — confined to far edges only (left 0-30%, right 95-100%)
// Center kept clean for text and stats card
const LINES = [
  // Far left cluster
  { x:  2, height: 90,  duration: 14, delay:  0,    opacity: 0.40 },
  { x:  6, height: 130, duration: 18, delay: -5.2,  opacity: 0.30 },
  { x: 10, height: 60,  duration: 11, delay: -2.5,  opacity: 0.45 },
  { x: 14, height: 100, duration: 16, delay: -8.1,  opacity: 0.32 },
  { x: 19, height: 75,  duration: 13, delay: -1.3,  opacity: 0.38 },
  { x: 24, height: 110, duration: 17, delay: -4.8,  opacity: 0.28 },
  { x: 28, height: 80,  duration: 15, delay: -7.2,  opacity: 0.34 },

  // Far right edge only (just outside stats card area)
  { x: 95, height: 100, duration: 16, delay: -4.1,  opacity: 0.32 },
  { x: 98, height: 80,  duration: 14, delay: -7.5,  opacity: 0.40 },
];

export function SobreHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft ambient glow */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)',
        filter: 'blur(80px)',
        top: '5%', right: '5%',
        animation: 'hero-glow-drift 28s ease-in-out infinite',
        willChange: 'transform',
      }} />

      {/* Falling lines */}
      {LINES.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${line.x}%`,
            top: 0,
            width: '1px',
            height: `${line.height}px`,
            background: `linear-gradient(to bottom,
              transparent 0%,
              rgba(59,130,246,${line.opacity}) 40%,
              rgba(59,130,246,${line.opacity}) 60%,
              transparent 100%)`,
            transform: 'translateY(-100%)',
            willChange: 'transform, opacity',
            animation: `rain-fall ${line.duration}s linear ${line.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
