'use client';

// Vertical rising lines — represents growth / project momentum
// Same visual language as /sobre but reversed direction (up = results)
const LINES = [
  // Left edge cluster
  { x:  4, height: 100, duration: 14, delay:  0,    opacity: 0.40 },
  { x:  9, height: 70,  duration: 11, delay: -3.2,  opacity: 0.42 },
  { x: 14, height: 130, duration: 18, delay: -6.5,  opacity: 0.28 },
  { x: 19, height: 85,  duration: 13, delay: -1.8,  opacity: 0.38 },
  { x: 24, height: 110, duration: 16, delay: -4.7,  opacity: 0.32 },
  { x: 29, height: 60,  duration: 10, delay: -7.1,  opacity: 0.45 },

  // Right edge cluster
  { x: 71, height: 95,  duration: 15, delay: -2.4,  opacity: 0.32 },
  { x: 77, height: 70,  duration: 12, delay: -5.6,  opacity: 0.42 },
  { x: 82, height: 140, duration: 19, delay: -8.3,  opacity: 0.28 },
  { x: 87, height: 80,  duration: 13, delay: -3.9,  opacity: 0.38 },
  { x: 91, height: 105, duration: 16, delay: -6.7,  opacity: 0.30 },
  { x: 96, height: 75,  duration: 12, delay: -1.2,  opacity: 0.42 },

  // Sparse middle (very subtle)
  { x: 40, height: 55,  duration: 10, delay: -2.3,  opacity: 0.18 },
  { x: 52, height: 65,  duration: 12, delay: -7.4,  opacity: 0.16 },
  { x: 60, height: 50,  duration: 11, delay: -4.1,  opacity: 0.18 },
];

export function CasesHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft ambient glow */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)',
        filter: 'blur(80px)',
        bottom: '10%', left: '5%',
        animation: 'hero-glow-drift 28s ease-in-out infinite reverse',
        willChange: 'transform',
      }} />

      {/* Rising lines */}
      {LINES.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${line.x}%`,
            bottom: 0,
            width: '1px',
            height: `${line.height}px`,
            background: `linear-gradient(to top,
              transparent 0%,
              rgba(59,130,246,${line.opacity}) 40%,
              rgba(59,130,246,${line.opacity}) 60%,
              transparent 100%)`,
            transform: 'translateY(100%)',
            willChange: 'transform, opacity',
            animation: `rise-up ${line.duration}s linear ${line.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
