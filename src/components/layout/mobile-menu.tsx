'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Menu, X, Bot, Boxes, Palette, ArrowUpRight, ChevronDown, Sparkles } from 'lucide-react';

export function MobileMenu() {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on escape
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  const close = () => { setOpen(false); setServicesOpen(false); };

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden w-10 h-10 -mr-2 flex items-center justify-center text-text-primary hover:text-primary transition-colors"
      >
        <Menu className="w-6 h-6" strokeWidth={1.8} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-[60] backdrop-blur-sm"
          style={{ background: 'rgba(25,25,24,0.30)' }}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[380px] overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          background: 'hsl(55 100% 97%)',
          borderLeft: '1px solid rgba(25,25,24,0.08)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: open ? '-30px 0 80px -20px rgba(0,0,0,0.20)' : 'none',
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 h-16 border-b border-black/[0.06]" style={{ background: 'hsl(55 100% 97%)' }}>
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">menu</span>
          <button
            onClick={close}
            aria-label="Fechar menu"
            className="w-10 h-10 -mr-2 flex items-center justify-center text-text-primary hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="px-5 py-6">
          <ul className="space-y-1">
            <MobileNavItem href="/sistemas-ia" label={t('sistemasIA')} onClick={close} featured />

            {/* Outros Serviços — expandable */}
            <li>
              <button
                onClick={() => setServicesOpen((v) => !v)}
                className="w-full flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-black/[0.03] transition-colors text-text-primary"
              >
                <span className="text-[15px] font-semibold">{t('servicos')}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2}
                />
              </button>
              {servicesOpen && (
                <ul className="mt-1 pb-2 pl-2 space-y-1">
                  <MobileSubItem
                    href="/agentes-automacao"
                    icon={Bot}
                    title={t('agentesAutomacao')}
                    desc={t('agentesAutomacaoDesc')}
                    onClick={close}
                  />
                  <MobileSubItem
                    href="/produtos-digitais"
                    icon={Boxes}
                    title={t('produtosDigitais')}
                    desc={t('produtosDigitaisDesc')}
                    onClick={close}
                  />
                  <MobileSubItem
                    href="/design"
                    icon={Palette}
                    title={t('design')}
                    desc={t('designDesc')}
                    onClick={close}
                  />
                </ul>
              )}
            </li>

            <MobileNavItem href="/cases"     label={t('cases')}     onClick={close} />
            <MobileNavItem href="/parcerias" label={t('parcerias')} onClick={close} />
            <MobileNavItem href="/sobre"     label={t('sobre')}     onClick={close} />
          </ul>
        </nav>

        {/* Featured promo */}
        <div className="px-5 pb-6">
          <Link
            href="/sistemas-ia"
            onClick={close}
            className="block relative rounded-2xl p-5 overflow-hidden"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.20) 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full mb-3" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <Sparkles className="w-3 h-3 text-primary" strokeWidth={2} />
                <span className="font-mono text-[9px] text-primary uppercase tracking-widest font-semibold">produto âncora</span>
              </div>
              <p className="text-[14px] font-semibold text-text-primary mb-1 leading-tight">Sistemas com IA</p>
              <p className="text-[12px] text-text-secondary leading-snug mb-3">
                Tudo da sua operação num sistema só. Sob medida.
              </p>
              <span className="font-mono text-[11px] text-primary inline-flex items-center gap-1">
                Conhecer <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* CTA at bottom */}
        <div className="px-5 pb-8 border-t border-black/[0.06] pt-6">
          <Link
            href="/contato"
            onClick={close}
            className="font-bricolage w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:bg-primary/90 transition-colors"
          >
            {t('contato')}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <p className="font-mono text-[10px] text-text-dim text-center mt-3">
            resposta em até 24h · sem compromisso
          </p>
        </div>
      </aside>
    </>
  );
}

function MobileNavItem({ href, label, onClick, featured = false }: { href: '/sistemas-ia' | '/cases' | '/parcerias' | '/sobre'; label: string; onClick: () => void; featured?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-black/[0.03] transition-colors"
      >
        <span
          className={`text-[15px] font-semibold ${featured ? 'text-primary' : 'text-text-primary'}`}
        >
          {label}
        </span>
        <ArrowUpRight className="w-4 h-4 text-text-dim" strokeWidth={1.8} />
      </Link>
    </li>
  );
}

function MobileSubItem({
  href, icon: Icon, title, desc, onClick,
}: {
  href: '/agentes-automacao' | '/produtos-digitais' | '/design';
  icon: typeof Bot;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-black/[0.03] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(59,130,246,0.10)' }}>
          <Icon className="w-4 h-4 text-primary" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-text-primary leading-tight mb-0.5">{title}</p>
          <p className="text-[11px] text-text-secondary leading-snug">{desc}</p>
        </div>
      </Link>
    </li>
  );
}
