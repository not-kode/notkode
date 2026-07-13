'use client';

// Filtro de período do dashboard — presets rápidos + intervalo personalizado.
// Atualiza a URL (?range= ou ?from=&to=) e o server component recarrega os dados.
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PRESETS } from './period';

export function PeriodFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const activeRange = sp.get('range');
  const hasCustom = !!(sp.get('from') && sp.get('to'));
  const activeKey = hasCustom ? 'custom' : (activeRange ?? '30d');

  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(sp.get('from') ?? '');
  const [to, setTo] = useState(sp.get('to') ?? '');

  const setPreset = (key: string) => {
    setOpen(false);
    router.push(key === '30d' ? '/admin' : `/admin?range=${key}`, { scroll: false });
  };
  const applyCustom = () => {
    if (!from || !to) return;
    const [a, b] = from <= to ? [from, to] : [to, from];
    setOpen(false);
    router.push(`/admin?from=${a}&to=${b}`, { scroll: false });
  };

  const chip = (active: boolean) =>
    `rounded-md px-2.5 py-1 font-mono text-[11px] tracking-tight transition-colors ${
      active ? 'bg-navy text-white' : 'bg-[#191918]/[0.05] text-text-secondary hover:bg-[#191918]/[0.09]'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PRESETS.map((p) => (
        <button key={p.key} type="button" onClick={() => setPreset(p.key)} className={chip(activeKey === p.key)}>
          {p.label}
        </button>
      ))}

      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} className={chip(activeKey === 'custom')}>
          {hasCustom ? `${sp.get('from')} → ${sp.get('to')}` : 'Personalizado ▾'}
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1.5 flex flex-col gap-2 rounded-md border border-[#191918]/[0.12] bg-surface-base p-3 shadow-md">
            <label className="flex items-center justify-between gap-3 text-xs text-text-secondary">
              De <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded border border-[#191918]/[0.15] bg-transparent px-2 py-1 font-mono text-xs" />
            </label>
            <label className="flex items-center justify-between gap-3 text-xs text-text-secondary">
              Até <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded border border-[#191918]/[0.15] bg-transparent px-2 py-1 font-mono text-xs" />
            </label>
            <button type="button" onClick={applyCustom} disabled={!from || !to} className="mt-1 rounded-md bg-navy px-3 py-1.5 font-mono text-[11px] text-white disabled:opacity-40">
              Aplicar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
