'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ChevronDown,
  Bot,
  Globe,
  ShoppingCart,
  Palette,
  ArrowUpRight,
  X,
} from 'lucide-react';

export function ServicesMenu() {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render portal after mount (avoids SSR document is not defined)
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  const services = [
    { href: '/sites' as const,             icon: Globe,        title: t('sites'),            desc: t('sitesDesc')            },
    { href: '/ecommerce' as const,         icon: ShoppingCart, title: t('ecommerce'),        desc: t('ecommerceDesc')        },
    { href: '/agentes-automacao' as const, icon: Bot,          title: t('agentesAutomacao'), desc: t('agentesAutomacaoDesc') },
    { href: '/brandbook' as const,         icon: Palette,      title: t('brandbook'),        desc: t('brandbookDesc')        },
  ];

  const overlay = (
    <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'hsl(55 100% 97%)',
        }}
        aria-hidden={!open}
      >
        {/* Decorative grid background */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Header bar */}
        <div className="relative flex items-center justify-between px-5 lg:px-8 h-16 lg:h-20 border-b border-black/[0.06]">
          <span className="font-mono text-[11px] text-text-dim uppercase tracking-widest">
            ❯ serviços / soluções
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="w-11 h-11 -mr-2 flex items-center justify-center text-text-primary hover:bg-black/[0.04] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Content */}
        <div className="relative h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="container mx-auto px-5 lg:px-8 py-10 lg:py-14 max-w-6xl">

            {/* 2x2 grid */}
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
              {services.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={() => setOpen(false)}
                  data-cta={`servico-card${s.href}`}
                  className="group relative rounded-2xl p-6 lg:p-7 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: 'hsl(55 100% 97%)',
                    border: '1px solid rgba(25,25,24,0.08)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
                      style={{ background: 'rgba(59,130,246,0.10)' }}
                    >
                      <s.icon className="w-6 h-6 text-primary" strokeWidth={1.7} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-[17px] lg:text-[18px] font-semibold tracking-tight text-text-primary group-hover:text-primary transition-colors">
                          {s.title}
                        </h4>
                        <ArrowUpRight
                          className="w-4 h-4 text-text-dim shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all"
                          strokeWidth={1.8}
                        />
                      </div>
                      <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
  );

  return (
    <>
      {/* Trigger button — sits in the header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-cta="nav-servicos"
        className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors text-sm"
      >
        {t('servicos')}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Fullscreen overlay rendered via Portal — escapes the header's containing block (created by backdrop-filter) */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
