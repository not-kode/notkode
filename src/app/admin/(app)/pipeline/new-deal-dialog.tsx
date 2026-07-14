'use client';

import { useState, useTransition } from 'react';
import { createDeal } from './actions';
import { PIPELINE_STAGES, STAGE_LABELS } from './stages';

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

// value = service_tag gravado no deal; label = texto legível.
const SERVICES: { value: string; label: string }[] = [
  { value: '', label: '—' },
  { value: 'sistemas-ia', label: 'Sistema com IA' },
  { value: 'sites', label: 'Site / Landing Page' },
  { value: 'agentes-automacao', label: 'Agentes & Automação' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'identidade', label: 'Identidade & Brandbook' },
  { value: 'manutencao', label: 'Plano de Manutenção' },
];

function Field({
  label,
  name,
  placeholder,
  required = false,
  type = 'text',
  className = '',
}: {
  label: string;
  name: string;
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
      <input name={name} type={type} required={required} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

export function NewDealDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Novo negócio
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          {/* Overlay */}
          <button
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
          />

          {/* Card */}
          <div className="relative w-full max-w-[30rem] rounded-lg border border-black/[0.06] bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
              <div>
                <p className="eyebrow mb-1">
                  <span className="status-dot" />
                  Entrada manual
                </p>
                <h2 className="text-lg font-semibold leading-tight tracking-tight text-text-primary">
                  Novo negócio
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary"
                aria-label="Fechar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              action={(fd) =>
                startTransition(async () => {
                  await createDeal(fd);
                  setOpen(false);
                })
              }
              className="flex flex-col gap-4 px-5 py-4"
            >
              <Field label="Contato" name="name" placeholder="Nome da pessoa" required />
              <Field label="Empresa" name="company" placeholder="Opcional" />

              <div className="grid grid-cols-2 gap-3">
                <Field label="WhatsApp" name="whatsapp" placeholder="(00) 00000-0000" />
                <Field label="E-mail" name="email" type="email" placeholder="opcional" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Serviço</label>
                  <select name="service_tag" defaultValue="" className={inputCls}>
                    {SERVICES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label="Valor (R$)" name="valor_pontual" placeholder="0" />
              </div>

              <div>
                <label className={labelCls}>Estágio</label>
                <select name="stage" defaultValue="novo" className={inputCls}>
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Notas</label>
                <textarea
                  name="notes"
                  rows={3}
                  className={inputCls + ' resize-y'}
                  placeholder="Contexto do projeto, origem da indicação, próximos passos…"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {pending ? 'Criando…' : 'Criar negócio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
