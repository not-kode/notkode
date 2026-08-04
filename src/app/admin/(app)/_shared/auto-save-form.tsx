'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Estado = 'parado' | 'salvando' | 'salvo';

/**
 * Formulário que salva sozinho: digitar dispara o salvamento depois de uma
 * pausa; mexer em select, checkbox ou data salva na hora. Não tem botão de
 * salvar — o aviso de "salvando/salvo" aparece no canto e some.
 *
 * `flushRef` deixa quem abriu (um drawer, por exemplo) forçar o salvamento do
 * que ficou pendente antes de fechar. Ele devolve uma promessa: quem vai gravar
 * outra coisa no mesmo registro logo em seguida precisa ESPERAR, senão as duas
 * gravações correm juntas e a mais lenta é que fica valendo.
 */
export function AutoSaveForm({ action, children, className, delay = 800, flushRef, onSaved, auto = true, id }: {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  delay?: number;
  flushRef?: { current: (() => void | Promise<void>) | null };
  onSaved?: () => void;
  /** Com `false` vira um formulário comum (criação, que precisa de confirmação). */
  auto?: boolean;
  id?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [estado, setEstado] = useState<Estado>('parado');

  const submitNow = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const form = formRef.current;
    if (!form) return;
    // Campo obrigatório vazio no meio da digitação não vira balão de erro: só
    // não salva ainda. A próxima alteração válida grava.
    if (!form.checkValidity()) return;
    form.requestSubmit();
  };

  // Mesmo salvamento, mas chamando a ação na mão para poder ser aguardado
  // (requestSubmit não devolve nada).
  const enviarAgora = async () => {
    const form = formRef.current;
    if (!form || !form.checkValidity()) return;
    if (auto) setEstado('salvando');
    await action(new FormData(form));
    if (auto) setEstado('salvo');
    onSaved?.();
  };

  const agendar = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(submitNow, delay);
  };

  useEffect(() => {
    if (!flushRef) return;
    flushRef.current = async () => {
      if (!timer.current) return; // nada esperando a pausa: não regrava à toa
      clearTimeout(timer.current);
      timer.current = null;
      await enviarAgora();
    };
    return () => { flushRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushRef]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // "salvo" some sozinho para não virar ruído permanente na tela.
  useEffect(() => {
    if (estado !== 'salvo') return;
    const t = setTimeout(() => setEstado('parado'), 1600);
    return () => clearTimeout(t);
  }, [estado]);

  const digitavel = (el: EventTarget | null) => {
    const t = el as HTMLElement | null;
    if (!t) return false;
    if (t.tagName === 'TEXTAREA') return true;
    if (t.tagName !== 'INPUT') return false;
    const tipo = (t as HTMLInputElement).type;
    return tipo === 'text' || tipo === 'email' || tipo === 'tel' || tipo === 'number' || tipo === 'search' || tipo === 'url';
  };

  return (
    <>
      <form
        ref={formRef}
        id={id}
        action={async (fd) => {
          if (auto) setEstado('salvando');
          await action(fd);
          if (auto) setEstado('salvo');
          onSaved?.();
        }}
        onInput={(e) => { if (auto && digitavel(e.target)) agendar(); }}
        onChange={(e) => { if (auto && !digitavel(e.target)) submitNow(); }}
        onBlur={() => { if (auto && timer.current) submitNow(); }}
        className={className}
      >
        {children}
      </form>

      {auto && estado !== 'parado' && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[70] rounded-full bg-text-primary/90 px-3 py-1.5 font-label text-[10px] uppercase tracking-wider text-white shadow-lg">
          {estado === 'salvando' ? 'salvando…' : 'salvo'}
        </div>
      )}
    </>
  );
}
