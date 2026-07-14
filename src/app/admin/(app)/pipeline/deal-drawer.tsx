'use client';

import { useTransition } from 'react';
import { createDeal, updateDeal, winDeal } from './actions';
import { PIPELINE_STAGES, STAGE_LABELS, SERVICE_TAGS, SERVICE_LABELS } from './stages';
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
  required = false,
  type = 'text',
  className = '',
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        className={inputCls}
      />
    </div>
  );
}

/**
 * Gaveta lateral única do pipeline: cria (deal = null) ou edita um negócio.
 * A EMPRESA é o campo principal/obrigatório; o contato é opcional.
 */
export function DealDrawer({ deal, onClose }: { deal: BoardDeal | null; onClose: () => void }) {
  const isNew = deal === null;
  const [savePending, startSave] = useTransition();
  const [winPending, startWin] = useTransition();

  const isWon = deal?.stage === 'ganho';
  const currentStage = deal?.stage ?? 'novo';
  // Ganho/perdido saem das colunas; ainda assim mostramos o estágio atual no select.
  const stageOptions = PIPELINE_STAGES.includes(currentStage as (typeof PIPELINE_STAGES)[number])
    ? [...PIPELINE_STAGES]
    : [currentStage, ...PIPELINE_STAGES];

  const title = isNew ? 'Novo negócio' : deal!.org?.name ?? deal!.name ?? 'Negócio';
  const eyebrow = isNew ? 'Entrada manual' : STAGE_LABELS[deal!.stage];

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
              {eyebrow}
            </p>
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-text-primary">{title}</h2>

            {/* Toggle Ganhar negócio — só na edição; cria o contrato no financeiro ao ligar */}
            {!isNew && (
              <button
                type="button"
                role="switch"
                aria-checked={isWon}
                disabled={isWon || winPending}
                onClick={() => {
                  const fd = new FormData();
                  fd.set('id', deal!.id);
                  startWin(() => winDeal(fd));
                }}
                title={isWon ? 'Negócio ganho' : `Marcar como ganho — cria o contrato${deal!.valor_pontual ? ` de ${brl(deal!.valor_pontual)}` : ''} no financeiro`}
                className="mt-2.5 inline-flex items-center gap-2 disabled:cursor-default"
              >
                <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isWon ? 'bg-success' : 'bg-black/[0.15]'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isWon ? 'left-[1.15rem]' : 'left-0.5'}`} />
                </span>
                <span className={`font-label text-[11px] uppercase tracking-wider ${isWon ? 'text-success' : 'text-text-secondary'}`}>
                  {winPending ? 'Fechando…' : isWon ? 'Ganho' : 'Ganhar negócio'}
                </span>
              </button>
            )}
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
              Próximo passo: preencher os dados cadastrais e o contrato na aba <strong className="font-semibold">Clientes</strong>.
            </p>
          </div>
        )}

        {/* Form — mesmos campos para criar e editar */}
        <form
          action={(fd) =>
            startSave(async () => {
              if (isNew) {
                await createDeal(fd);
                onClose();
              } else {
                await updateDeal(fd);
              }
            })
          }
          className="flex flex-col gap-4 px-5 py-4"
        >
          {!isNew && (
            <>
              <input type="hidden" name="id" value={deal!.id} />
              <input type="hidden" name="organization_id" value={deal!.organization_id ?? ''} />
              <input type="hidden" name="contact_id" value={deal!.contact_id ?? ''} />
            </>
          )}

          <Field
            label="Empresa"
            name="company"
            defaultValue={deal?.org?.name}
            placeholder="Nome da empresa"
            required
          />

          <Field
            label="Contato (opcional)"
            name="name"
            defaultValue={deal?.name}
            placeholder="Quem você fala (pode ser um terceiro)"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp" name="whatsapp" defaultValue={deal?.whatsapp} placeholder="(00) 00000-0000" />
            <Field label="E-mail" name="email" type="email" defaultValue={deal?.email} placeholder="opcional" />
          </div>

          <div>
            <label className={labelCls}>Produto / serviço</label>
            <select name="service_tag" defaultValue={deal?.service_tag ?? ''} className={inputCls}>
              <option value="">—</option>
              {SERVICE_TAGS.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Valor (R$)"
              name="valor_pontual"
              defaultValue={deal?.valor_pontual != null ? String(deal.valor_pontual) : ''}
              placeholder="0"
            />
            <div>
              <label className={labelCls}>Estágio</label>
              <select name="stage" defaultValue={currentStage} className={inputCls}>
                {stageOptions.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea
              name="notes"
              defaultValue={deal?.notes ?? ''}
              rows={5}
              className={inputCls + ' resize-y'}
              placeholder="Contexto do negócio, origem da indicação, condições, próximos passos…"
            />
          </div>

          <button
            type="submit"
            disabled={savePending}
            className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {savePending ? (isNew ? 'Criando…' : 'Salvando…') : isNew ? 'Criar negócio' : 'Salvar'}
          </button>
        </form>
      </aside>
    </div>
  );
}
