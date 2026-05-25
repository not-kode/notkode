'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface Step {
  iconNode: ReactNode;
  number: string;
  title: string;
  desc: string;
}

interface ProcessTimelineProps {
  steps: Step[];
  className?: string;
}

export function ProcessTimeline({ steps, className }: ProcessTimelineProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [lineWidth, setLineWidth] = useState(0);
  const triggered = useRef(false);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLineWidth(100);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;

        const start = performance.now();
        const duration = 1400;

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 2);
          setLineWidth(eased * 100);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Linha conectora — de centro a centro dos ícones (top-8 = metade do w-16 h-16) */}
      <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-black/[0.07]">
        <div
          ref={lineRef}
          className="absolute inset-y-0 left-0 bg-primary/50 transition-none"
          style={{ width: `${lineWidth}%` }}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 140}>
            <article className="relative flex flex-col items-center text-center">

              {/* Ícone — maior, mais presença */}
              <div className="relative mb-6 shrink-0 z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {step.iconNode}
                </div>
                {/* Badge de número */}
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-primary text-white font-mono text-[10px] flex items-center justify-center font-bold shadow-sm">
                  {step.number}
                </span>
              </div>

              <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2.5">
                {step.title}
              </h3>
              <p className="text-[14px] lg:text-[15px] text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
