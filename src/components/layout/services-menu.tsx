'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChevronDown, Bot, Boxes, Palette } from 'lucide-react';

export function ServicesMenu() {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const items = [
    {
      href: '/agentes-automacao' as const,
      icon: Bot,
      title: t('agentesAutomacao'),
      desc: t('agentesAutomacaoDesc'),
    },
    {
      href: '/produtos-digitais' as const,
      icon: Boxes,
      title: t('produtosDigitais'),
      desc: t('produtosDigitaisDesc'),
    },
    {
      href: '/design' as const,
      icon: Palette,
      title: t('design'),
      desc: t('designDesc'),
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
        className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors text-sm"
      >
        {t('servicos')}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute top-full right-0 pt-3 w-[420px] z-50"
        >
          <div className="glass-strong rounded-xl p-2 shadow-glass">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-black/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
