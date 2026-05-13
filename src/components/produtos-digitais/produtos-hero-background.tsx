'use client';

// Diagonal streaks — confined to top-right and bottom-left corners only
// Keeps the center area clean for text
const STREAKS = [
  // Top-right corner
  { startX: 75, startY: -8,  length: 180, duration: 14, delay:  0,    opacity: 0.40 },
  { startX: 85, startY: -5,  length: 220, duration: 18, delay: -4.2,  opacity: 0.32 },
  { startX: 95, startY:  0,  length: 200, duration: 16, delay: -7.5,  opacity: 0.36 },
  // Bottom-left corner
  { startX: -5, startY: 80,  length: 220, duration: 17, delay: -5.6,  opacity: 0.34 },
  { startX:  5, startY: 90,  length: 200, duration: 15, delay: -2.8,  opacity: 0.38 },
  { startX: 15, startY: 95,  length: 240, duration: 19, delay: -9.1,  opacity: 0.30 },
];

export function ProdutosHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft ambient glow */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 65%)',
        filter: 'blur(80px)',
        top: '10%', left: '20%',
        animation: 'hero-glow-drift 26s ease-in-out infinite',
        willChange: 'transform',
      }} />

      {/* Diagonal streaks at ~30deg */}
      {STREAKS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            width: `${s.length}px`,
            height: '1px',
            background: `linear-gradient(to right,
              transparent 0%,
              rgba(59,130,246,${s.opacity}) 35%,
              rgba(59,130,246,${s.opacity}) 65%,
              transparent 100%)`,
            transformOrigin: 'left center',
            transform: 'rotate(28deg) translateX(-50%)',
            willChange: 'transform, opacity',
            animation: `streak ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
