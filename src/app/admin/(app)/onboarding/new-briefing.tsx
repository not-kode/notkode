'use client';

import { useState, useTransition } from 'react';
import { createBriefing } from './actions';

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

type Org = { id: string; name: string };
type Template = { key: string; label: string };

/** Botão "+ Novo briefing": escolhe cliente, produto e o template de perguntas. */
export function NewBriefing({ orgs, templates }: { orgs: Org[]; templates: Template[] }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

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
        Novo briefing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Fechar" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

          <form
            action={(fd) =>
              start(async () => {
                await createBriefing(fd);
                setOpen(false);
              })
            }
            className="relative flex w-full max-w-sm flex-col gap-4 rounded-lg border border-black/[0.06] bg-white p-5 shadow-xl"
          >
            <div>
              <p className="eyebrow mb-1">
                <span className="status-dot" />
                Onboarding
              </p>
              <h3 className="text-base font-semibold tracking-tight text-text-primary">Novo briefing</h3>
            </div>

            <div>
              <label className={labelCls}>
                Cliente<span className="text-danger"> *</span>
              </label>
              <select name="organization_id" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Escolha o cliente…
                </option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                Template de perguntas<span className="text-danger"> *</span>
              </label>
              <select name="template_key" required defaultValue="produto" className={inputCls}>
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                Produto / projeto<span className="text-danger"> *</span>
              </label>
              <input name="product_name" required placeholder="Ex: site institucional, sistema de pedidos…" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Escopo (opcional)</label>
              <input name="scope" placeholder="Resumo do combinado, aparece na abertura do briefing" className={inputCls} />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? 'Criando…' : 'Criar briefing'}
            </button>
            <p className="font-label text-[10px] text-text-muted">
              Depois de criado, copie o link na tabela e mande pro cliente responder.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
