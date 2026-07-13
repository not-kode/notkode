'use client';

// Filtro de período — um dropdown único: mostra o período atual e, ao abrir,
// lista os presets + o intervalo personalizado. Atualiza a URL (?range= ou
// ?from=&to=) e o server component recarrega os dados. Padrão: "Este mês".
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PRESETS } from './period';

export function PeriodFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const hasCustom = !!(sp.get('from') && sp.get('to'));
  const activeKey = hasCustom ? 'custom' : (sp.get('range') ?? 'month');
  const activeLabel = hasCustom
    ? `${sp.get('from')} → ${sp.get('to')}`
    : (PRESETS.find((p) => p.key === activeKey)?.label ?? 'Este mês');

  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [from, setFrom] = useState(sp.get('from') ?? '');
  const [to, setTo] = useState(sp.get('to') ?? '');

  const close = () => { setOpen(false); setCustom(false); };
  const setPreset = (key: string) => {
    close();
    router.push(key === 'month' ? '/admin' : `/admin?range=${key}`, { scroll: false });
  };
  const applyCustom = () => {
    if (!from || !to) return;
    const [a, b] = from <= to ? [from, to] : [to, from];
    close();
    router.push(`/admin?from=${a}&to=${b}`, { scroll: false });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-[#191918]/[0.12] bg-surface-base px-3 py-1.5 font-mono text-xs text-text-primary hover:border-[#191918]/25"
      >
        <span className="text-text-muted">Período:</span>
        {activeLabel}
        <span className="text-text-muted">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute right-0 z-20 mt-1.5 w-52 rounded-md border border-[#191918]/[0.12] bg-surface-base p-1.5 shadow-md">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPreset(p.key)}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-mono text-xs transition-colors hover:bg-[#191918]/[0.05] ${
                  activeKey === p.key ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                {p.label}
                {activeKey === p.key && <span>•</span>}
              </button>
            ))}

            <div className="my-1.5 h-px bg-[#191918]/[0.08]" />

            {!custom ? (
              <button
                type="button"
                onClick={() => setCustom(true)}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-mono text-xs transition-colors hover:bg-[#191918]/[0.05] ${
                  activeKey === 'custom' ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                Personalizado…
                {activeKey === 'custom' && <span>•</span>}
              </button>
            ) : (
              <div className="flex flex-col gap-2 px-1.5 py-1">
                <label className="flex items-center justify-between gap-2 text-[11px] text-text-secondary">
                  De <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded border border-[#191918]/[0.15] bg-transparent px-1.5 py-1 font-mono text-[11px]" />
                </label>
                <label className="flex items-center justify-between gap-2 text-[11px] text-text-secondary">
                  Até <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded border border-[#191918]/[0.15] bg-transparent px-1.5 py-1 font-mono text-[11px]" />
                </label>
                <button type="button" onClick={applyCustom} disabled={!from || !to} className="mt-0.5 rounded bg-navy px-3 py-1.5 font-mono text-[11px] text-white disabled:opacity-40">
                  Aplicar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
