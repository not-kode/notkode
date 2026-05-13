'use client';

// Radial expanding waves — concentric rings spreading outward
// Concept: "reaching out" / signal broadcast
const RINGS = [
  { delay:  0,   duration: 8, opacity: 0.35 },
  { delay: -2,   duration: 8, opacity: 0.30 },
  { delay: -4,   duration: 8, opacity: 0.25 },
  { delay: -6,   duration: 8, opacity: 0.20 },
];

export function ContatoHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft ambient glow */}
      <div style={{
        position: 'absolute',
        width: '700px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 65%)',
        filter: 'blur(80px)',
        top: '-10%', right: '-10%',
        animation: 'hero-glow-drift 24s ease-in-out infinite',
        willChange: 'transform',
      }} />

      {/* Expanding rings — anchored on the right side */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '8%',
        transform: 'translateY(-50%)',
        width: '600px',
        height: '600px',
      }}>
        {RINGS.map((ring, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `1px solid rgba(59,130,246,${ring.opacity})`,
              animation: `signal-ring ${ring.duration}s ease-out ${ring.delay}s infinite`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
        {/* Center pulse dot */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: '12px', height: '12px',
          marginTop: '-6px', marginLeft: '-6px',
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.85)',
          animation: 'node-glow 3s ease-in-out infinite',
        }} />
      </div>
    </div>
  );
}
