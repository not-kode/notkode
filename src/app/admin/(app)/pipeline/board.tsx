'use client';

import { useEffect, useState, useTransition } from 'react';
import { moveDealStage } from './actions';
import { DEAL_STAGES, STAGE_LABELS, type DealStage } from './stages';

export type BoardDeal = {
  id: string;
  stage: DealStage;
  service_tag: string | null;
  source: string | null;
  valor_pontual: number | null;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
};

// Filete de acento no topo de cada coluna — segue a paleta da marca.
const STAGE_ACCENT: Record<DealStage, string> = {
  novo: 'bg-neutral-300',
  qualificado: 'bg-cyan-400',
  diagnostico: 'bg-cyan-500',
  proposta: 'bg-cyan-600',
  negociacao: 'bg-warning',
  ganho: 'bg-success',
  perdido: 'bg-danger',
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function PipelineBoard({ initialDeals }: { initialDeals: BoardDeal[] }) {
  const [deals, setDeals] = useState(initialDeals);
  const [overStage, setOverStage] = useState<DealStage | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Mantém o servidor como fonte da verdade após revalidação.
  useEffect(() => setDeals(initialDeals), [initialDeals]);

  function move(id: string, toStage: DealStage) {
    const current = deals.find((d) => d.id === id);
    if (!current || current.stage === toStage) return;
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, stage: toStage } : d)));
    const fd = new FormData();
    fd.set('id', id);
    fd.set('stage', toStage);
    startTransition(() => {
      moveDealStage(fd);
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {DEAL_STAGES.map((stage) => {
        const cards = deals.filter((d) => d.stage === stage);
        const total = cards.reduce((s, d) => s + (d.valor_pontual ?? 0), 0);
        const isOver = overStage === stage;
        return (
          <section
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget === e.target) setOverStage(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain');
              if (id) move(id, stage);
              setOverStage(null);
              setDragId(null);
            }}
            className={[
              'flex w-[15.5rem] shrink-0 flex-col overflow-hidden rounded-md border transition-colors',
              isOver ? 'border-primary/50 bg-primary/[0.05]' : 'border-black/[0.04] bg-black/[0.02]',
            ].join(' ')}
          >
            <span className={`block h-0.5 w-full ${STAGE_ACCENT[stage]}`} />

            <div className="flex items-center justify-between px-3 pt-3">
              <span className="font-label text-[11px] uppercase tracking-[0.14em] text-text-secondary">
                {STAGE_LABELS[stage]}
              </span>
              <span className="rounded-full bg-black/[0.05] px-1.5 font-label text-[10px] text-text-muted">
                {cards.length}
              </span>
            </div>
            <p className="mb-2 px-3 font-label text-[10px] text-text-muted">{total > 0 ? brl(total) : '—'}</p>

            <div className="flex min-h-[80px] flex-1 flex-col gap-2 px-2 pb-3">
              {cards.map((deal) => (
                <article
                  key={deal.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', deal.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDragId(deal.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverStage(null);
                  }}
                  className={[
                    'cursor-grab rounded-md border border-black/[0.05] bg-white p-3 shadow-sm transition-all active:cursor-grabbing',
                    'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
                    dragId === deal.id ? 'opacity-40' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-tight text-text-primary">{deal.name ?? 'Sem contato'}</span>
                    {deal.valor_pontual ? (
                      <span className="shrink-0 font-label text-xs font-semibold text-primary">
                        {brl(deal.valor_pontual)}
                      </span>
                    ) : null}
                  </div>

                  {deal.service_tag && (
                    <span className="mt-1.5 inline-block rounded-full border border-black/[0.08] bg-black/[0.02] px-2 py-0.5 font-label text-[10px] uppercase tracking-wider text-text-secondary">
                      {deal.service_tag}
                    </span>
                  )}

                  {(deal.email || deal.whatsapp) && (
                    <div className="mt-2 space-y-0.5 border-t border-black/[0.06] pt-2">
                      {deal.email && <p className="truncate font-label text-[10px] text-text-muted">{deal.email}</p>}
                      {deal.whatsapp && <p className="font-label text-[10px] text-text-muted">{deal.whatsapp}</p>}
                    </div>
                  )}
                </article>
              ))}
              {cards.length === 0 && (
                <p className="select-none px-2 py-4 text-center font-label text-[10px] text-text-muted/50">
                  arraste aqui
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
