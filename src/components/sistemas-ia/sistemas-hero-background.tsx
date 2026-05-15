'use client';

import { useEffect, useRef } from 'react';

// Blob definitions — collision radius + visual size
// Brand cyan/turquoise (primary + soft) com opacidades reduzidas — fundo menos saturado
const DEFS = [
  { r: 190, w: 380, h: 320, opacity: 0.18, blur: 56, color: '75,210,229',  morphDur: '11s', morphDelay: '0s'   },
  { r: 110, w: 220, h: 200, opacity: 0.14, blur: 42, color: '142,226,229', morphDur: '9s',  morphDelay: '-3s'  },
  { r: 130, w: 260, h: 230, opacity: 0.12, blur: 48, color: '75,210,229',  morphDur: '13s', morphDelay: '-6s'  },
  { r:  70, w: 140, h: 128, opacity: 0.13, blur: 32, color: '142,226,229', morphDur: '8s',  morphDelay: '-2s'  },
  { r:  85, w: 170, h: 150, opacity: 0.10, blur: 36, color: '75,210,229',  morphDur: '10s', morphDelay: '-4s'  },
  { r:  48, w:  96, h:  86, opacity: 0.09, blur: 24, color: '142,226,229', morphDur: '7s',  morphDelay: '-1s'  },
] as const;

type BlobState = {
  x: number; y: number;
  vx: number; vy: number;
  r: number; w: number; h: number;
};

// Deterministic initial positions spread around the hero
const INIT_ANGLES = [0, 1.05, 2.09, 3.14, 4.19, 5.24]; // 0, 60, 120, 180, 240, 300 deg

export function SistemasHeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef     = useRef<BlobState[]>([]);
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;
    const cx = W / 2, cy = H / 2;
    const spread = Math.min(W, H) * 0.26;

    // Init state — deterministic positions in a ring
    stateRef.current = DEFS.map((def, i) => {
      const angle = INIT_ANGLES[i];
      const px = cx + Math.cos(angle) * spread - def.w / 2;
      const py = cy + Math.sin(angle) * spread * 0.7 - def.h / 2;
      const speed = 0.28 + i * 0.06;
      const va = angle + Math.PI * 0.5;
      return {
        x: Math.max(0, Math.min(W - def.w, px)),
        y: Math.max(0, Math.min(H - def.h, py)),
        vx: Math.cos(va) * speed,
        vy: Math.sin(va) * speed,
        r: def.r, w: def.w, h: def.h,
      };
    });

    const MAX_SPEED = 0.55;

    const tick = (t: number) => {
      const blobs = stateRef.current;
      const W = container.clientWidth;
      const H = container.clientHeight;

      // Wander — smooth sinusoidal nudge per blob (no Math.random)
      blobs.forEach((b, i) => {
        b.vx += Math.sin(t * 0.00018 + i * 1.7) * 0.009;
        b.vy += Math.cos(t * 0.00014 + i * 1.1) * 0.009;
      });

      // Blob–blob repulsion
      for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) {
          const a = blobs[i], b = blobs[j];
          const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
          const bx = b.x + b.w / 2, by = b.y + b.h / 2;
          const dx = bx - ax, dy = by - ay;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minD = a.r + b.r;
          if (dist < minD) {
            const f = (minD - dist) / minD * 0.05;
            const nx = dx / dist, ny = dy / dist;
            a.vx -= nx * f; a.vy -= ny * f;
            b.vx += nx * f; b.vy += ny * f;
          }
        }
      }

      // Boundary soft bounce + speed clamp + damping
      blobs.forEach((b) => {
        if (b.x < 0)          { b.x = 0;          b.vx = Math.abs(b.vx) * 0.7; }
        if (b.y < 0)          { b.y = 0;          b.vy = Math.abs(b.vy) * 0.7; }
        if (b.x + b.w > W)   { b.x = W - b.w;   b.vx = -Math.abs(b.vx) * 0.7; }
        if (b.y + b.h > H)   { b.y = H - b.h;   b.vy = -Math.abs(b.vy) * 0.7; }

        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }

        b.vx *= 0.996;
        b.vy *= 0.996;
        b.x  += b.vx;
        b.y  += b.vy;
      });

      // Apply to DOM
      blobs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (el) el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {DEFS.map((def, i) => (
        <div
          key={i}
          ref={(el) => { blobRefs.current[i] = el; }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: def.w,
            height: def.h,
            background: `radial-gradient(ellipse, rgba(${def.color},${def.opacity}) 0%, rgba(${def.color},${+(def.opacity * 0.35).toFixed(2)}) 50%, transparent 75%)`,
            filter: `blur(${def.blur}px)`,
            willChange: 'transform',
            animation: `morph-shape ${def.morphDur} ease-in-out ${def.morphDelay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
