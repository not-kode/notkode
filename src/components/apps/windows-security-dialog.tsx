'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Download, ShieldAlert, X } from 'lucide-react';

/**
 * Aviso que aparece antes do download no Windows.
 *
 * Os instaladores não são assinados, então o SmartScreen bloqueia a primeira
 * execução e a pessoa fica com um arquivo que "não abre". Quem descobre isso
 * só depois de baixar costuma desistir, então o clique em baixar abre este
 * pop-up primeiro: o download de verdade é o botão daqui de dentro, e quem
 * não quiser seguir fecha e não leva um arquivo que não vai conseguir rodar.
 */
export type WindowsSecurityDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Endereço do instalador. O botão de confirmar é o download de verdade. */
  href: string;
  /** Rótulo de analytics do download confirmado. */
  cta: string;
  /** Arquivo .zip pede um passo a mais: extrair antes de executar. */
  zipped?: boolean;
};

export function WindowsSecurityDialog({
  open,
  onClose,
  href,
  cta,
  zipped = false,
}: WindowsSecurityDialogProps) {
  const t = useTranslations('Downloads.windowsWarning');
  const [mounted, setMounted] = useState(false);
  const confirmRef = useRef<HTMLAnchorElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // O portal só existe depois da montagem: no servidor não há document.
  useEffect(() => setMounted(true), []);

  // Trava a rolagem de fundo, leva o foco para o botão de baixar e devolve o
  // foco para quem abriu quando fecha, para quem navega por teclado não voltar
  // ao topo da página.
  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    confirmRef.current?.focus();

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
      openerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const steps = [zipped ? 'unzip' : 'open', 'moreInfo', 'runAnyway'] as const;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[110]"
        style={{
          background: 'rgba(25,25,24,0.35)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        aria-hidden
      />

      <div className="fixed inset-0 z-[111] flex items-center justify-center p-5 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-warning-title"
          className="pointer-events-auto relative w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-2xl p-6 lg:p-8 animate-fade-up [animation-duration:260ms]"
          style={{
            background: 'hsl(55 100% 97%)',
            border: '1px solid rgba(25,25,24,0.10)',
            boxShadow: '0 40px 90px -30px rgba(0,0,0,0.35)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-black/[0.05]"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>

          <ShieldAlert className="w-7 h-7 mb-4" strokeWidth={1.6} style={{ color: '#F59E0B' }} />

          <h3
            id="win-warning-title"
            className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-3 pr-8"
          >
            {t('title')}
          </h3>

          {/* Duas coisas diferentes, separadas de propósito: que a build é
              experimental (o que ela é) e que o SmartScreen vai barrar (o que
              vai acontecer). Emendadas num parágrafo só, a primeira se perde. */}
          <p
            className="text-[14px] leading-[1.55] text-text-primary rounded-xl px-4 py-3 mb-4"
            style={{ background: 'rgba(245,158,11,0.12)' }}
          >
            {t('experimental')}
          </p>

          <p className="text-[15px] text-text-primary leading-[1.6] mb-6">{t('intro')}</p>

          <ol className="space-y-3 mb-6">
            {steps.map((k, i) => (
              <li key={k} className="flex gap-3">
                <span
                  className="shrink-0 w-6 h-6 rounded-md font-mono text-[11px] flex items-center justify-center text-primary"
                  style={{ background: 'rgba(59,130,246,0.12)' }}
                >
                  {i + 1}
                </span>
                <span className="text-[15px] text-text-primary leading-[1.5]">
                  {t(`steps.${k}`)}
                </span>
              </li>
            ))}
          </ol>

          <p className="text-[14px] text-text-secondary leading-[1.6] mb-7">{t('note')}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              ref={confirmRef}
              href={href}
              data-cta={cta}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bricolage text-[13px] font-bold uppercase tracking-wide text-white transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: '#3B82F6' }}
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              {t('confirm')}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-bricolage text-[13px] font-bold uppercase tracking-wide text-text-primary transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: 'rgba(25,25,24,0.05)' }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
