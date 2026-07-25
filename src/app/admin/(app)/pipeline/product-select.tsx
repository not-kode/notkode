'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createProduct } from './actions';

export type ProductOption = { key: string; label: string };

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';

/**
 * Seletor de produto/serviço: um campo fechado que mostra o que está marcado e
 * abre a lista só quando precisa — a grade de checkboxes ocupava meia tela.
 * Aceita vários e cria produto novo ali dentro, sem sair para o "gerenciar".
 *
 * O valor sai em inputs escondidos com `name`, então o form continua enviando
 * as tags do mesmo jeito.
 */
export function ProductSelect({ options, defaultSelected = [], name, onManage, onChangeSelection }: {
  options: ProductOption[];
  defaultSelected?: string[];
  name: string;
  onManage?: () => void;
  /** Marcar/desmarcar não dispara evento de formulário: quem salva sozinho usa isto. */
  onChangeSelection?: () => void;
}) {
  const [opts, setOpts] = useState(options);
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [novo, setNovo] = useState('');
  const [pending, start] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  // A lista pode crescer no servidor (outro produto criado); mantém em dia sem
  // perder o que já está marcado.
  useEffect(() => {
    setOpts((cur) => {
      const extras = cur.filter((o) => !options.some((n) => n.key === o.key));
      return [...options, ...extras];
    });
  }, [options]);

  // Fecha ao clicar fora ou no Esc — comportamento esperado de um dropdown.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (key: string) =>
    setSelected((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));

  // Avisa depois que os inputs escondidos já refletem a seleção — avisar dentro
  // do toggle mandaria o valor anterior para o servidor.
  const primeiroRender = useRef(true);
  useEffect(() => {
    if (primeiroRender.current) { primeiroRender.current = false; return; }
    onChangeSelection?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const criar = () => {
    const nome = novo.trim();
    if (!nome) return;
    const fd = new FormData();
    fd.set('name', nome);
    start(async () => {
      const p = await createProduct(fd);
      if (!p) return;
      setOpts((cur) => (cur.some((o) => o.key === p.key) ? cur : [...cur, { key: p.key, label: p.name }]));
      setSelected((cur) => (cur.includes(p.key) ? cur : [...cur, p.key]));
      setNovo('');
      setBusca('');
    });
  };

  const filtradas = busca.trim()
    ? opts.filter((o) => o.label.toLowerCase().includes(busca.trim().toLowerCase()))
    : opts;
  const marcados = opts.filter((o) => selected.includes(o.key));
  const nomeIgual = opts.some((o) => o.label.trim().toLowerCase() === novo.trim().toLowerCase());

  return (
    <div ref={boxRef} className="relative">
      {selected.map((key) => <input key={key} type="hidden" name={name} value={key} />)}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-left transition-colors hover:border-primary/40"
      >
        {marcados.length === 0 ? (
          <span className="text-sm text-text-muted">Selecionar produto / serviço</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {marcados.slice(0, 3).map((o) => (
              <span key={o.key} className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">{o.label}</span>
            ))}
            {marcados.length > 3 && <span className="px-1 py-0.5 text-xs text-text-muted">+{marcados.length - 3}</span>}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 rounded-md border border-black/[0.08] bg-white p-2 shadow-lg">
          {opts.length > 6 && (
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar…"
              className={inputCls + ' mb-2'}
            />
          )}

          <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
            {filtradas.length === 0 ? (
              <p className="px-1 py-2 text-xs text-text-muted">Nenhum produto com esse nome. Crie abaixo.</p>
            ) : (
              filtradas.map((o) => {
                const on = selected.includes(o.key);
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => toggle(o.key)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/[0.03] ${on ? 'text-text-primary' : 'text-text-secondary'}`}
                  >
                    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${on ? 'border-primary bg-primary text-white' : 'border-black/20'}`}>
                      {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
                    </span>
                    {o.label}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5 border-t border-black/[0.06] pt-2">
            <input
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); criar(); } }}
              placeholder="Novo produto / serviço"
              className={inputCls}
            />
            <button
              type="button"
              onClick={criar}
              disabled={pending || !novo.trim() || nomeIgual}
              className="shrink-0 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {pending ? '…' : 'Criar'}
            </button>
          </div>
          {nomeIgual && novo.trim() && <p className="mt-1 px-1 font-label text-[10px] text-text-muted">Esse produto já está na lista.</p>}

          {onManage && (
            <button
              type="button"
              onClick={() => { setOpen(false); onManage(); }}
              className="mt-2 w-full rounded px-2 py-1 text-left font-label text-[10px] uppercase tracking-wider text-text-muted underline decoration-dotted transition-colors hover:text-primary"
            >
              renomear / desativar produtos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
