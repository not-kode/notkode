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
    // Revela assim que QUALQUER parte do bloco encosta na área de detecção, e
    // antecipa 200px abaixo da dobra para o conteúdo já chegar pronto ao entrar na
    // tela. Antes exigia 15% do bloco visível e ainda encolhia a área em 80px, então
    // blocos altos ficavam em branco por um bom tempo mesmo já estando na viewport —
    // é o que dava a sensação de página lenta ou quebrada.
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: '0px 0px 200px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        // Teto no delay em cascata: alguns blocos pediam 400ms, que somado à
        // transição fazia o conteúdo levar quase um segundo para ficar legível.
        // O escalonamento continua existindo, só não atrasa a leitura.
        transitionDelay: `${Math.min(delay, 180)}ms`,
        transform: visible ? 'none' : dirMap[direction](distance),
        opacity: visible ? 1 : 0,
      }}
      className={cn(
        // 800ms era longo demais para conteúdo de leitura: somado ao delay em cascata,
        // dava mais de 1s até o texto ficar legível.
        'transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
        className
      )}
    >
      {children}
    </div>
  );
}
