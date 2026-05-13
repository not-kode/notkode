'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChevronDown, Bot, Boxes, Palette, ArrowUpRight, Sparkles, ArrowRight } from 'lucide-react';

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

  const services = [
    {
      href: '/agentes-automacao' as const,
      icon: Bot,
      title: t('agentesAutomacao'),
      desc: t('agentesAutomacaoDesc'),
      tag: 'self-service',
    },
    {
      href: '/produtos-digitais' as const,
      icon: Boxes,
      title: t('produtosDigitais'),
      desc: t('produtosDigitaisDesc'),
      tag: 'consultivo',
    },
    {
      href: '/design' as const,
      icon: Palette,
      title: t('design'),
      desc: t('designDesc'),
      tag: 'self-service',
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
          className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[820px] z-50"
          style={{ maxWidth: 'calc(100vw - 40px)' }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'hsl(55 100% 97%)',
              border: '1px solid rgba(25,25,24,0.08)',
              boxShadow: '0 30px 80px -20px rgba(59,130,246,0.15), 0 16px 40px -16px rgba(0,0,0,0.12)',
            }}
          >
            <div className="grid lg:grid-cols-[1.8fr_1fr]">

              {/* LEFT — services list */}
              <div className="p-5 lg:p-6">
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4 px-2">
                  ❯ outros serviços
                </p>

                <div className="space-y-1">
                  {services.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-start gap-4 p-3.5 rounded-xl hover:bg-black/[0.03] transition-colors duration-200"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
                        style={{ background: 'rgba(59,130,246,0.08)' }}
                      >
                        <s.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[14px] font-semibold text-text-primary group-hover:text-primary transition-colors">
                            {s.title}
                          </span>
                          <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'rgba(25,25,24,0.05)' }}>
                            {s.tag}
                          </span>
                        </div>
                        <p className="text-[12px] text-text-secondary leading-snug">
                          {s.desc}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-text-dim shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-200" strokeWidth={1.8} />
                    </Link>
                  ))}
                </div>

                {/* Footer link to cases */}
                <div className="mt-4 pt-4 border-t border-black/[0.06] px-2">
                  <Link
                    href="/cases"
                    onClick={() => setOpen(false)}
                    className="group inline-flex items-center gap-2 text-[12px] text-text-secondary hover:text-primary transition-colors"
                  >
                    <span>Ver todos os 12+ projetos entregues</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* RIGHT — featured / CTA */}
              <div
                className="relative p-5 lg:p-6"
                style={{ background: 'rgba(59,130,246,0.04)', borderLeft: '1px solid rgba(25,25,24,0.06)' }}
              >
                {/* Subtle pattern */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.18) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />

                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full mb-4" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Sparkles className="w-3 h-3 text-primary" strokeWidth={2} />
                    <span className="font-mono text-[9px] text-primary uppercase tracking-widest font-semibold">Produto âncora</span>
                  </div>

                  <h3 className="text-[16px] font-semibold tracking-tight text-text-primary mb-2 leading-tight">
                    Sistemas internos<br />com IA dentro.
                  </h3>
                  <p className="text-[12px] text-text-secondary leading-relaxed mb-5">
                    Substitua dezenas de ferramentas por um sistema sob medida — feito pro jeito que sua empresa funciona.
                  </p>

                  <Link
                    href="/sistemas-ia"
                    onClick={() => setOpen(false)}
                    className="font-bricolage w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-[11px] uppercase tracking-wide hover:bg-primary/90 transition-colors mb-3"
                  >
                    Conhecer sistema
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/contato"
                    onClick={() => setOpen(false)}
                    className="block text-center font-mono text-[10px] text-primary hover:underline"
                  >
                    ou agendar diagnóstico grátis →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
