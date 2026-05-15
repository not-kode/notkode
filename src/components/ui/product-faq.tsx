'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

export type FAQItem = { q: string; a: string };

interface ProductFAQProps {
  eyebrow?: string;
  title: React.ReactNode;
  faqs: FAQItem[];
  surface?: 'base' | 'elevated';
}

function Item({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.07] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <div className="flex items-start gap-4">
          <span className="font-mono text-[10px] text-text-dim mt-0.5 shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[15px] font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
            {q}
          </span>
        </div>
        <div className="shrink-0 w-6 h-6 rounded-full border border-black/[0.1] flex items-center justify-center mt-0.5 group-hover:border-primary/40 transition-colors duration-200">
          {open
            ? <Minus className="w-3 h-3 text-primary" strokeWidth={2} />
            : <Plus className="w-3 h-3 text-text-muted" strokeWidth={2} />}
        </div>
      </button>
      {open && (
        <div className="pb-5 pl-8 pr-10">
          <p className="text-[15px] text-text-secondary leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export function ProductFAQ({ eyebrow, title, faqs, surface = 'elevated' }: ProductFAQProps) {
  return (
    <section className={surface === 'elevated' ? 'bg-surface-elevated' : 'bg-surface-base'}>
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <div className="max-w-2xl mx-auto mb-12">
            {eyebrow && (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim mb-4">
                {eyebrow}
              </p>
            )}
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em]">
              {title}
            </h2>
          </div>
        </Reveal>
        <div className="max-w-2xl mx-auto">
          {faqs.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Item q={item.q} a={item.a} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
