'use client';

// Peças compartilhadas pelas três visualizações de Entregas (Kanban, Lista e Gantt).

import { useEffect, useRef, useState } from 'react';

export const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';

export const fmtDate = (d: string | null | undefined) => {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y.slice(2)}`;
};

export const hoje = () => new Date().toISOString().slice(0, 10);

/** Diferença em dias entre duas datas AAAA-MM-DD (b − a). */
export const diffDias = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export const somaDias = (d: string, n: number) =>
  new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/**
 * Texto que vira campo ao clicar e salva ao sair. É assim que se renomeia uma
 * tarefa ou uma etapa: sem abrir modal, sem botão de salvar.
 */
export function InlineText({
  value, onSave, placeholder, className = '', title,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  className?: string;
  title?: string;
}) {
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setRascunho(value), [value]);
  useEffect(() => { if (editando) ref.current?.select(); }, [editando]);

  const confirmar = () => {
    setEditando(false);
    const limpo = rascunho.trim();
    if (limpo && limpo !== value) onSave(limpo);
    else setRascunho(value);
  };

  if (editando) {
    return (
      <input
        ref={ref}
        value={rascunho}
        onChange={(e) => setRascunho(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirmar();
          if (e.key === 'Escape') { setRascunho(value); setEditando(false); }
        }}
        className={`${inputCls} ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      onClick={() => setEditando(true)}
      title={title ?? 'Clique para renomear'}
      className={`min-w-0 truncate rounded px-1 py-0.5 text-left transition-colors hover:bg-black/[0.04] ${className}`}
    >
      {value || <span className="text-text-muted">{placeholder ?? '—'}</span>}
    </button>
  );
}

/** Campo de data enxuto: mostra a data formatada e abre o seletor nativo ao clicar. */
export function DateCell({ value, onSave, atrasada, placeholder = '—' }: {
  value: string | null;
  onSave: (v: string) => void;
  atrasada?: boolean;
  placeholder?: string;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <input
        type="date"
        autoFocus
        defaultValue={value ?? ''}
        onBlur={(e) => { setEditando(false); if (e.target.value !== (value ?? '')) onSave(e.target.value); }}
        className={`${inputCls} w-[8.5rem] py-1 text-xs`}
      />
    );
  }

  return (
    <button
      onClick={() => setEditando(true)}
      className={`rounded px-1 py-0.5 font-label text-[11px] tabular-nums transition-colors hover:bg-black/[0.04] ${
        atrasada ? 'font-semibold text-danger' : value ? 'text-text-secondary' : 'text-text-muted'
      }`}
    >
      {fmtDate(value) ?? placeholder}
    </button>
  );
}
