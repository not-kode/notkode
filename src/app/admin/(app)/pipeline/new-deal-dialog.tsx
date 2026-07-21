'use client';

import { useState } from 'react';
import { DealDrawer } from './deal-drawer';
import { type OrgOption, type Product } from './orgs';

/** Botão "+ Novo negócio": abre a MESMA gaveta lateral do card, em modo criação. */
export function NewDealDialog({ orgOptions, products }: { orgOptions: OrgOption[]; products: Product[] }) {
  const [open, setOpen] = useState(false);

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

      {open && <DealDrawer deal={null} orgOptions={orgOptions} products={products} onClose={() => setOpen(false)} />}
    </>
  );
}
