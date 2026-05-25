'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: string;
  duration?: number;
  className?: string;
}

function parseValue(raw: string): { prefix: string; number: number; suffix: string } | null {
  const m = raw.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], number: parseFloat(m[2]), suffix: m[3] };
}

export function CountUp({ value, duration = 1400, className }: CountUpProps) {
  const parsed = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(parsed ? `${parsed.prefix}0${parsed.suffix}` : value);
  const triggered = useRef(false);

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;
        obs.disconnect();

        const start = performance.now();
        const target = parsed.number;

        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          const formatted = Number.isInteger(target)
            ? Math.round(current).toString()
            : current.toFixed(1);
          setDisplay(`${parsed!.prefix}${formatted}${parsed!.suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
