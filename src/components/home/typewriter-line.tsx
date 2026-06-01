'use client';

import { useEffect, useRef, useState } from 'react';

type Segment = { text: string; className?: string };

interface TypewriterLineProps {
  segments: Segment[];
  /** Classes applied to the whole line (size, weight, layout). */
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Delay before typing starts once the line is visible. */
  startDelay?: number;
}

export function TypewriterLine({
  segments,
  className = '',
  speed = 45,
  startDelay = 650,
}: TypewriterLineProps) {
  const full = segments.map((s) => s.text).join('');
  const [count, setCount] = useState(0);
  const [armed, setArmed] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Arm when the line scrolls into view (or immediately if reduced motion)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(full.length);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [full.length]);

  // Type out one character at a time
  useEffect(() => {
    if (!armed) return;
    let i = 0;
    let tick: ReturnType<typeof setTimeout>;
    const start = setTimeout(function step() {
      i += 1;
      setCount(i);
      if (i < full.length) tick = setTimeout(step, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(tick);
    };
  }, [armed, full.length, speed, startDelay]);

  const done = count >= full.length;

  // Render typed characters across segments
  let remaining = count;
  const typed = segments.map((seg, idx) => {
    const shown = Math.max(0, Math.min(seg.text.length, remaining));
    remaining -= seg.text.length;
    return (
      <span key={idx} className={seg.className}>
        {seg.text.slice(0, shown)}
      </span>
    );
  });

  return (
    <span ref={ref} className={`inline-grid justify-items-center ${className}`} aria-label={full}>
      {/* invisible sizer reserves full width so centered text doesn't jump */}
      <span className="col-start-1 row-start-1 invisible" aria-hidden>
        {segments.map((seg, idx) => (
          <span key={idx} className={seg.className}>
            {seg.text}
          </span>
        ))}
      </span>
      {/* typed overlay */}
      <span className="col-start-1 row-start-1" aria-hidden>
        {typed}
        {!done && <span className="cursor-blink">_</span>}
      </span>
    </span>
  );
}
