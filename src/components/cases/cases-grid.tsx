'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { CASES, type CaseItem, type CaseCategory } from '@/data/cases';

const FILTERS: (CaseCategory | 'Todos')[] = ['Todos', 'SaaS', 'E-commerce', 'Website'];

export function CasesGrid() {
  const [active, setActive] = useState<CaseCategory | 'Todos'>('Todos');

  const filtered = active === 'Todos' ? CASES : CASES.filter((c) => c.category === active);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-12">
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest mr-3">
          Filtrar:
        </span>
        {FILTERS.map((f) => {
          const count = f === 'Todos' ? CASES.length : CASES.filter((c) => c.category === f).length;
          const isActive = active === f;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="font-mono text-[12px] px-3.5 py-1.5 rounded-full transition-all duration-200 inline-flex items-center gap-2"
              style={{
                background: isActive ? '#3B82F6' : 'transparent',
                color: isActive ? 'white' : 'rgba(25,25,24,0.65)',
                border: isActive ? '1px solid #3B82F6' : '1px solid rgba(25,25,24,0.12)',
              }}
            >
              {f}
              <span className={isActive ? 'opacity-70' : 'opacity-40'}>
                {String(count).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {filtered.map((c, i) => (
          <CaseCard key={c.slug} item={c} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-12">Nenhum case nesta categoria.</p>
      )}
    </div>
  );
}

function CaseCard({ item, index }: { item: CaseItem; index: number }) {
  return (
    <Link
      href={{ pathname: '/cases/[slug]', params: { slug: item.slug } }}
      className="group relative rounded-2xl border border-black/[0.08] bg-surface-base overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
      style={{ animation: `case-fade-in 0.5s ease ${index * 60}ms both` }}
    >
      {/* Visual top — abstract gradient + initials */}
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${item.accentFrom} 0%, ${item.accentTo} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bricolage text-white/95 text-[3.5rem] font-bold tracking-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          >
            {item.initial}
          </span>
        </div>
        <span className="absolute top-3 right-3 font-mono text-[10px] text-white/75 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm">
          {item.year}
        </span>
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[17px] font-semibold tracking-tight text-text-primary">
            {item.name}
          </h3>
          <span className="font-mono text-[10px] text-text-dim shrink-0 mt-1 uppercase tracking-wider">
            {item.category}
          </span>
        </div>

        <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-black/[0.06]">
          <span className="font-bricolage text-[1.5rem] font-bold text-primary leading-none">
            {item.metric}
          </span>
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
            {item.metricLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {item.stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] text-text-muted px-2 py-1 rounded-md bg-black/[0.04]"
            >
              {tech}
            </span>
          ))}
          {item.stack.length > 4 && (
            <span className="font-mono text-[10px] text-text-dim px-2 py-1">
              +{item.stack.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
