'use client';

import { useEffect, useRef, useState } from 'react';

const STYLES = `
@keyframes brand-blob-a { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,-20px) scale(1.08); } }
@keyframes brand-blob-b { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(-30px,25px) rotate(8deg); } }
@keyframes brand-blob-c { from { transform: translate(0,0); } to { transform: translate(20px,-30px); } }
@keyframes brand-swatch { 0%,100% { opacity:0.6; transform:translateY(0); } 50% { opacity:1; transform:translateY(-8px); } }
@keyframes brand-letter-a { 0%,100% { opacity:0.8; transform:translateX(0); } 50% { opacity:0.3; transform:translateX(-12px); } }
@keyframes brand-letter-b { 0%,100% { opacity:0.6; transform:translateY(0) rotate(-3deg); } 50% { opacity:0.15; transform:translateY(10px) rotate(0deg); } }

.bb-anim { animation-play-state: paused; }
.bb-anim.bb-run { animation-play-state: running; }

/* Respeita quem pediu menos movimento no SO: sem animação nenhuma. */
@media (prefers-reduced-motion: reduce) {
  .bb-anim { animation: none !important; }
}
`;

export function BrandbookHeroBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // Só anima enquanto o fundo estiver visível — economiza GPU ao rolar a página.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const run = inView ? ' bb-run' : '';

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <style>{STYLES}</style>

      {/* Floating palette blobs — blur reduzido (era 40–60px) para aliviar o compositor */}
      <div className={`bb-anim${run}`} style={{
        position: 'absolute',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 65%)',
        filter: 'blur(34px)',
        top: '-10%', left: '10%',
        animation: 'brand-blob-a 14s ease-in-out infinite alternate',
      }} />
      <div className={`bb-anim${run}`} style={{
        position: 'absolute',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)',
        filter: 'blur(30px)',
        top: '20%', right: '5%',
        animation: 'brand-blob-b 18s ease-in-out infinite alternate',
      }} />
      <div className={`bb-anim${run}`} style={{
        position: 'absolute',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(251,191,36,0.05) 0%, transparent 65%)',
        filter: 'blur(24px)',
        bottom: '10%', left: '30%',
        animation: 'brand-blob-c 22s ease-in-out infinite alternate',
      }} />

      {/* Floating color swatches */}
      <svg
        viewBox="0 0 1100 440"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Guide lines — layout grid feel */}
        <line x1="0" y1="146" x2="1100" y2="146" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        <line x1="0" y1="294" x2="1100" y2="294" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        <line x1="183" y1="0" x2="183" y2="440" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        <line x1="550" y1="0" x2="550" y2="440" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        <line x1="917" y1="0" x2="917" y2="440" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />

        {/* Palette color chips — floating */}
        <rect x="68" y="60" width="36" height="36" rx="8"
          fill="rgba(59,130,246,0.18)"
          className={`bb-anim${run}`}
          style={{ animation: 'brand-swatch 9s ease-in-out 0s infinite' }}
        />
        <rect x="980" y="100" width="28" height="28" rx="6"
          fill="rgba(30,30,30,0.10)"
          className={`bb-anim${run}`}
          style={{ animation: 'brand-swatch 12s ease-in-out 1.5s infinite' }}
        />
        <rect x="860" y="300" width="22" height="22" rx="5"
          fill="rgba(59,130,246,0.12)"
          className={`bb-anim${run}`}
          style={{ animation: 'brand-swatch 15s ease-in-out 3s infinite' }}
        />
        <rect x="140" y="330" width="18" height="18" rx="4"
          fill="rgba(99,102,241,0.10)"
          className={`bb-anim${run}`}
          style={{ animation: 'brand-swatch 11s ease-in-out 0.8s infinite' }}
        />
        <rect x="500" y="30" width="14" height="14" rx="3"
          fill="rgba(251,191,36,0.10)"
          className={`bb-anim${run}`}
          style={{ animation: 'brand-swatch 17s ease-in-out 2.2s infinite' }}
        />

        {/* Typography letterforms — very faint, large */}
        <text
          x="820" y="360"
          fontFamily="Georgia, serif"
          fontSize="200"
          fontWeight="700"
          fill="rgba(59,130,246,0.04)"
          className={`bb-anim${run}`}
          style={{ animation: 'brand-letter-a 20s ease-in-out infinite' }}
          aria-hidden
        >A</text>
        <text
          x="-30" y="300"
          fontFamily="Georgia, serif"
          fontSize="160"
          fontWeight="400"
          fill="rgba(25,25,24,0.03)"
          className={`bb-anim${run}`}
          style={{ animation: 'brand-letter-b 25s ease-in-out 4s infinite' }}
          aria-hidden
        >G</text>
      </svg>
    </div>
  );
}
