'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { ChevronDown, Download, ShieldAlert, TriangleAlert, X } from 'lucide-react';

/**
 * Aviso que aparece antes do download no Windows.
 *
 * Os instaladores não são assinados, então o Windows bloqueia a primeira
 * execução e a pessoa fica com um arquivo que "não abre". Quem descobre isso
 * só depois de baixar costuma desistir, então o clique em baixar abre este
 * pop-up primeiro: o download de verdade é o botão daqui de dentro, e quem
 * não quiser seguir fecha e não leva um arquivo que não vai conseguir rodar.
 *
 * São dois bloqueios diferentes, e por isso a explicação tem dois níveis:
 *
 * 1. O SmartScreen (a tela azul), que oferece "Executar assim mesmo". Resolve
 *    para a maioria e fica à vista.
 * 2. O Controle Inteligente de Aplicativos do Windows 11, que bloqueia sem
 *    oferecer saída nenhuma e só é contornável desligando o recurso nas
 *    configurações. Isso é irreversível sem reinstalar o sistema, então mora
 *    numa seção fechada: quem não precisa não é empurrado a mexer nisso, e
 *    quem precisa lê o alerta junto com o passo a passo.
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

/** Passo numerado, no mesmo desenho nas duas listas. */
function Passo({ n, children, tone }: { n: number; children: string; tone: 'blue' | 'amber' }) {
  return (
    <li className="flex gap-3">
      <span
        className="shrink-0 w-[22px] h-[22px] rounded-full font-mono text-[11px] flex items-center justify-center mt-[1px]"
        style={
          tone === 'blue'
            ? { background: 'rgba(59,130,246,0.14)', color: '#2563EB' }
            : { background: 'rgba(245,158,11,0.18)', color: '#B45309' }
        }
      >
        {n}
      </span>
      <span className="text-[14.5px] text-text-primary leading-[1.55]">{children}</span>
    </li>
  );
}

export function WindowsSecurityDialog({
  open,
  onClose,
  href,
  cta,
  zipped = false,
}: WindowsSecurityDialogProps) {
  const t = useTranslations('Downloads.windowsWarning');
  const [mounted, setMounted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
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

  // A seção do Controle Inteligente reabre fechada a cada vez: ela é a exceção,
  // não o caminho padrão.
  useEffect(() => {
    if (!open) setShowFallback(false);
  }, [open]);

  if (!mounted || !open) return null;

  const passos = [zipped ? 'unzip' : 'open', 'moreInfo', 'runAnyway'] as const;
  const passosFallback = ['security', 'appControl', 'settings', 'turnOff'] as const;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[110]"
        style={{
          background: 'rgba(25,25,24,0.42)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
        aria-hidden
      />

      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 sm:p-5 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-warning-title"
          className="pointer-events-auto relative w-full max-w-[560px] max-h-[88vh] overflow-y-auto rounded-2xl animate-fade-up [animation-duration:260ms]"
          style={{
            background: 'hsl(55 100% 97%)',
            border: '1px solid rgba(25,25,24,0.10)',
            boxShadow: '0 40px 90px -30px rgba(0,0,0,0.4)',
          }}
        >
          {/* Cabeçalho: faixa âmbar para o assunto se anunciar antes da leitura. */}
          <div
            className="relative px-6 lg:px-8 pt-7 pb-6"
            style={{
              background:
                'linear-gradient(180deg, rgba(245,158,11,0.13) 0%, rgba(245,158,11,0) 100%)',
              borderBottom: '1px solid rgba(25,25,24,0.07)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t('close')}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-black/[0.06]"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.16)' }}
              >
                <ShieldAlert className="w-[22px] h-[22px]" strokeWidth={1.7} style={{ color: '#B45309' }} />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary mb-1.5">
                  {t('eyebrow')}
                </p>
                <h3
                  id="win-warning-title"
                  className="text-[20px] lg:text-[22px] font-semibold tracking-tight leading-[1.25] text-text-primary"
                >
                  {t('title')}
                </h3>
              </div>
            </div>
          </div>

          <div className="px-6 lg:px-8 py-6">
            <p className="text-[15px] text-text-primary leading-[1.6] mb-4">{t('intro')}</p>

            <p className="text-[14px] text-text-secondary leading-[1.55] mb-6">
              {t('experimental')}
            </p>

            <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3.5">
              {t('stepsTitle')}
            </p>
            <ol className="space-y-3 mb-6">
              {passos.map((k, i) => (
                <Passo key={k} n={i + 1} tone="blue">
                  {t(`steps.${k}`)}
                </Passo>
              ))}
            </ol>

            <p className="text-[13.5px] text-text-secondary leading-[1.55] mb-6">{t('note')}</p>

            {/* Controle Inteligente de Aplicativos: fechado por padrão. */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(245,158,11,0.35)' }}
            >
              <button
                type="button"
                onClick={() => setShowFallback((v) => !v)}
                aria-expanded={showFallback}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.02]"
              >
                <span className="text-[14.5px] font-semibold text-text-primary leading-snug">
                  {t('fallbackToggle')}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-text-secondary transition-transform duration-200 ${
                    showFallback ? 'rotate-180' : ''
                  }`}
                  strokeWidth={2}
                />
              </button>

              {showFallback && (
                <div
                  className="px-4 pb-4 pt-1"
                  style={{ borderTop: '1px solid rgba(245,158,11,0.22)' }}
                >
                  <p className="text-[14px] text-text-primary leading-[1.6] mt-3 mb-4">
                    {t('fallbackIntro')}
                  </p>

                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary mb-3">
                    {t('fallbackPathLabel')}
                  </p>
                  <ol className="space-y-3 mb-4">
                    {passosFallback.map((k, i) => (
                      <Passo key={k} n={i + 1} tone="amber">
                        {t(`fallbackSteps.${k}`)}
                      </Passo>
                    ))}
                  </ol>

                  <div
                    className="flex gap-2.5 rounded-lg px-3.5 py-3"
                    style={{ background: 'rgba(245,158,11,0.14)' }}
                  >
                    <TriangleAlert
                      className="w-4 h-4 shrink-0 mt-0.5"
                      strokeWidth={2}
                      style={{ color: '#B45309' }}
                    />
                    <p className="text-[13.5px] text-text-primary leading-[1.55]">
                      {t('fallbackWarning')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-3 px-6 lg:px-8 py-5"
            style={{
              borderTop: '1px solid rgba(25,25,24,0.07)',
              background: 'rgba(25,25,24,0.02)',
            }}
          >
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
              style={{ background: 'rgba(25,25,24,0.06)' }}
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
