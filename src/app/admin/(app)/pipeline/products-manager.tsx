'use client';

import { addProduct, renameProduct, toggleProduct } from './actions';
import { type Product } from './orgs';

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';

/**
 * Diálogo de gestão da lista de produtos/serviços (tabela products).
 * Renomear salva ao sair do campo; desativar tira das opções de negócios novos
 * sem apagar o histórico dos que já usam a tag.
 */
export function ProductsManager({ products, onClose }: { products: Product[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

      <div className="relative w-full max-w-sm rounded-lg border border-black/[0.06] bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">
              <span className="status-dot" />
              Produtos / serviços
            </p>
            <h3 className="text-base font-semibold tracking-tight text-text-primary">Gerenciar lista</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="flex max-h-[50vh] flex-col gap-1.5 overflow-y-auto">
          {products.map((p) => (
            <li key={p.key} className="flex items-center gap-2">
              <form
                action={renameProduct}
                className="flex-1"
                onBlur={(e) => {
                  const input = e.currentTarget.querySelector('input[name="name"]') as HTMLInputElement | null;
                  if (input && input.value.trim() && input.value.trim() !== p.name) e.currentTarget.requestSubmit();
                }}
              >
                <input type="hidden" name="key" value={p.key} />
                <input
                  name="name"
                  defaultValue={p.name}
                  className={inputCls + (p.active ? '' : ' opacity-50 line-through')}
                />
              </form>
              <form action={toggleProduct}>
                <input type="hidden" name="key" value={p.key} />
                <button
                  type="submit"
                  className="shrink-0 font-label text-[10px] uppercase tracking-wider text-text-muted underline decoration-dotted transition-colors hover:text-primary"
                >
                  {p.active ? 'desativar' : 'reativar'}
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={addProduct} className="mt-3 flex flex-col gap-2 border-t border-black/[0.06] pt-3">
          <p className="font-label text-[10px] uppercase tracking-[0.12em] text-text-muted">Adicionar produto</p>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <input name="name" required placeholder="Nome do produto" className={inputCls} />
            <select name="billing_type" defaultValue="pontual" className={inputCls}>
              <option value="pontual">Pontual</option>
              <option value="recorrente">Recorrente</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </form>

        <p className="mt-2 font-label text-[10px] text-text-muted">
          Renomear salva ao sair do campo. Desativar esconde das opções sem perder o histórico.
        </p>
      </div>
    </div>
  );
}
