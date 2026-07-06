'use client';

import { useTransition } from 'react';
import { updateDeal, winDeal } from './actions';
import { STAGE_LABELS } from './stages';
import { OrgFiscalFields } from '../_shared/org-fiscal-fields';
import type { BoardDeal } from './board';

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  className = '',
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      <input name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

export function DealDrawer({ deal, onClose }: { deal: BoardDeal; onClose: () => void }) {
  const [savePending, startSave] = useTransition();
  const [winPending, startWin] = useTransition();
  const org = deal.org;
  const isWon = deal.stage === 'ganho';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
      />

      {/* Painel */}
      <aside className="relative flex h-full w-full max-w-[26rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-white px-5 py-4">
          <div>
            <p className="eyebrow mb-1">
              <span className="status-dot" />
              {STAGE_LABELS[deal.stage]}
            </p>
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-text-primary">
              {org?.name ?? deal.name ?? 'Negócio'}
            </h2>
            {deal.name && org?.name && (
              <p className="font-label text-xs text-text-muted">{deal.name}</p>
            )}

            {/* Toggle Ganhar negócio — cria o contrato no financeiro ao ligar */}
            <button
              type="button"
              role="switch"
              aria-checked={isWon}
              disabled={isWon || winPending}
              onClick={() => {
                const fd = new FormData();
                fd.set('id', deal.id);
                startWin(() => winDeal(fd));
              }}
              title={isWon ? 'Negócio ganho' : `Marcar como ganho — cria o contrato${deal.valor_pontual ? ` de ${brl(deal.valor_pontual)}` : ''} no financeiro`}
              className="mt-2.5 inline-flex items-center gap-2 disabled:cursor-default"
            >
              <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isWon ? 'bg-success' : 'bg-black/[0.15]'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isWon ? 'left-[1.15rem]' : 'left-0.5'}`} />
              </span>
              <span className={`font-label text-[11px] uppercase tracking-wider ${isWon ? 'text-success' : 'text-text-secondary'}`}>
                {winPending ? 'Fechando…' : isWon ? 'Ganho' : 'Ganhar negócio'}
              </span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desfecho ganho + próximo passo */}
        {isWon && (
          <div className="mx-5 mt-4 rounded-md border border-success/25 bg-success/[0.06] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Negócio ganho
            </p>
            <p className="mt-1 font-label text-[11px] text-text-secondary">
              Próximo passo: preparar o contrato com os dados abaixo.
            </p>
            <button
              type="button"
              disabled
              title="Disponível na próxima etapa"
              className="mt-2.5 inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-black/[0.08] bg-black/[0.02] px-3 py-1.5 font-label text-[11px] uppercase tracking-wider text-text-muted"
            >
              Gerar contrato · em breve
            </button>
          </div>
        )}

        {/* Form de edição */}
        <form
          action={(fd) => startSave(() => updateDeal(fd))}
          className="flex flex-col gap-4 px-5 py-4"
        >
          <input type="hidden" name="id" value={deal.id} />
          <input type="hidden" name="organization_id" value={deal.organization_id ?? ''} />

          <Field
            label="Valor do negócio (R$)"
            name="valor_pontual"
            defaultValue={deal.valor_pontual != null ? String(deal.valor_pontual) : ''}
            placeholder="0"
          />

          <div className="flex flex-col gap-4 border-t border-black/[0.06] pt-4">
            <OrgFiscalFields org={org} includeRepCpf={false} />
          </div>

          <div className="border-t border-black/[0.06] pt-4">
            <label className={labelCls}>Notas</label>
            <textarea
              name="notes"
              defaultValue={deal.notes ?? ''}
              rows={4}
              className={inputCls + ' resize-y'}
              placeholder="Contexto do negócio, condições, próximos passos…"
            />
          </div>

          <button
            type="submit"
            disabled={savePending}
            className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {savePending ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </aside>
    </div>
  );
}
