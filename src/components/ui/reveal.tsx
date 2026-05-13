'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  /** Delay in milliseconds before the reveal animation kicks in. */
  delay?: number;
  /** Direction of the entry translate. Default 'up'. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  /** Distance translated before revealing (px). Default 24. */
  distance?: number;
}

const dirMap: Record<NonNullable<RevealProps['direction']>, (d: number) => string> = {
  up: (d) => `translateY(${d}px)`,
  down: (d) => `translateY(-${d}px)`,
  left: (d) => `translateX(${d}px)`,
  right: (d) => `translateX(-${d}px)`,
  none: () => 'none',
};

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? 'none' : dirMap[direction](distance),
        opacity: visible ? 1 : 0,
      }}
      className={cn(
        'transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
        className
      )}
    >
      {children}
    </div>
  );
}
