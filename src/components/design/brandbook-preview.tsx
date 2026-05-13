'use client';

import { useState, useRef, useEffect } from 'react';
import { Maximize2, FileText } from 'lucide-react';

const PAGES = [
  { id: 'capa',         label: 'Capa' },
  { id: 'logo',         label: 'Logo' },
  { id: 'cores',        label: 'Cores' },
  { id: 'tipografia',   label: 'Tipografia' },
  { id: 'componentes',  label: 'Componentes' },
  { id: 'aplicacoes',   label: 'Aplicações' },
];

export function BrandbookPreview() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Update active page based on scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const sections = el.querySelectorAll('[data-page]');
      const containerCenter = el.scrollTop + el.clientHeight / 3;
      let bestIdx = 0;
      sections.forEach((sec, i) => {
        const top = (sec as HTMLElement).offsetTop;
        if (top <= containerCenter) bestIdx = i;
      });
      setActive(bestIdx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToPage = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelectorAll('[data-page]')[idx] as HTMLElement;
    if (target) el.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Soft glow behind */}
      <div
        className="absolute -inset-12 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      <div
        className="relative rounded-2xl overflow-hidden border border-black/[0.10] shadow-2xl"
        style={{
          boxShadow: '0 30px 80px -30px rgba(59,130,246,0.20), 0 16px 40px -16px rgba(0,0,0,0.12)',
        }}
      >
        {/* Chrome bar */}
        <div className="flex items-center justify-between gap-3 px-5 h-11 border-b border-black/[0.06]" style={{ background: 'rgba(25,25,24,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-2 px-3 h-6 rounded-md" style={{ background: 'rgba(25,25,24,0.05)' }}>
              <FileText className="w-3 h-3 text-text-dim" strokeWidth={2} />
              <span className="font-mono text-[10px] text-text-secondary">brandbook-notkode.pdf</span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-text-dim">página {active + 1} de {PAGES.length}</span>
        </div>

        {/* Body — sidebar + content */}
        <div className="flex" style={{ background: 'hsl(55 100% 97%)' }}>
          {/* Page index sidebar */}
          <aside className="hidden md:flex flex-col w-[180px] shrink-0 border-r border-black/[0.06] py-5" style={{ background: 'rgba(25,25,24,0.02)' }}>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest px-4 mb-3">
              Índice
            </p>
            <nav className="space-y-0.5">
              {PAGES.map((p, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={p.id}
                    onClick={() => scrollToPage(i)}
                    className="w-full flex items-center gap-2 px-4 py-1.5 text-left transition-colors"
                    style={{
                      background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                      borderLeft: isActive ? '2px solid #3B82F6' : '2px solid transparent',
                    }}
                  >
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: isActive ? '#3B82F6' : 'rgba(25,25,24,0.35)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: isActive ? '#3B82F6' : 'rgba(25,25,24,0.55)' }}
                    >
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 px-4">
              <Maximize2 className="w-3.5 h-3.5 text-text-dim mb-2" strokeWidth={1.8} />
              <p className="font-mono text-[9px] text-text-dim">
                role para navegar entre as páginas
              </p>
            </div>
          </aside>

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            style={{ height: '520px' }}
          >
            {/* PAGE 01 — Cover */}
            <section data-page="capa" className="min-h-[520px] flex flex-col justify-center px-8 lg:px-16 py-10">
              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-6">
                ❯ notkode / brandbook / v1.0
              </p>
              <h3 className="font-bricolage text-[2.5rem] lg:text-[3.5rem] font-bold leading-[1.05] tracking-[-0.03em] mb-4">
                Brandbook
              </h3>
              <h3 className="text-[2rem] lg:text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.025em] mb-8">
                Sua Empresa Exemplo
              </h3>
              <div className="font-mono text-[11px] text-text-muted space-y-1">
                <p>v1.0 · entregue por Notkode</p>
                <p>Maio 2026 · Para uso interno e parceiros</p>
              </div>
              <div className="mt-12 inline-flex items-center gap-3 px-4 py-2 rounded-full self-start" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest">documento oficial</span>
              </div>
            </section>

            {/* PAGE 02 — Logo */}
            <section data-page="logo" className="min-h-[520px] px-8 lg:px-16 py-10 border-t border-black/[0.05]">
              <SectionHeader number="01" title="Logo" />

              {/* Logo principal */}
              <div className="rounded-xl p-10 mb-6 flex items-center justify-center" style={{ background: 'rgba(25,25,24,0.03)' }}>
                <span className="font-bricolage text-[3rem] lg:text-[3.5rem] font-bold tracking-[-0.04em]">
                  empresa<span className="text-primary">.</span>
                </span>
              </div>

              {/* Variações */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <LogoVariation bg="hsl(55 100% 97%)" textColor="#191918" label="principal" content="empresa." />
                <LogoVariation bg="#191918" textColor="white" label="negativa" content="empresa." />
                <LogoVariation bg="#3B82F6" textColor="white" label="marca" content="e." mono />
              </div>

              <p className="text-[12px] text-text-secondary leading-relaxed">
                <strong className="text-text-primary">Três variações</strong> para todos os contextos: aplicação principal, fundo escuro e versão reduzida (monograma).
              </p>
            </section>

            {/* PAGE 03 — Cores */}
            <section data-page="cores" className="min-h-[520px] px-8 lg:px-16 py-10 border-t border-black/[0.05]">
              <SectionHeader number="02" title="Sistema de cores" />

              <div className="grid grid-cols-2 gap-3 mb-5">
                <ColorSwatch hex="#3B82F6" name="Primary" desc="Cor principal" />
                <ColorSwatch hex="#93C5FD" name="Primary Soft" desc="Acento suave" />
              </div>

              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">Neutros</p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                <ColorSwatch hex="#FFFEF2" name="Cream" small />
                <ColorSwatch hex="#F3F2E7" name="Elevated" small />
                <ColorSwatch hex="#191918" name="Ink" small />
                <ColorSwatch hex="#6B6A65" name="Muted" small />
              </div>

              <p className="text-[12px] text-text-secondary leading-relaxed">
                Paleta enxuta de 6 cores. Use <strong className="text-text-primary">Primary</strong> apenas para ênfase — máx. 15% da composição.
              </p>
            </section>

            {/* PAGE 04 — Tipografia */}
            <section data-page="tipografia" className="min-h-[520px] px-8 lg:px-16 py-10 border-t border-black/[0.05]">
              <SectionHeader number="03" title="Tipografia" />

              <div className="rounded-xl p-6 mb-3" style={{ background: 'rgba(25,25,24,0.03)' }}>
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Display · Parabole · Bold</p>
                <p className="font-bricolage text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em]">
                  Cabeçalhos.
                </p>
              </div>

              <div className="rounded-xl p-6 mb-3" style={{ background: 'rgba(25,25,24,0.03)' }}>
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Body · DM Sans · Regular</p>
                <p className="text-[16px] leading-[1.6] text-text-primary">
                  Texto de corpo em DM Sans, otimizado para leitura em telas. Tamanho base 16px com 1.6 de altura de linha.
                </p>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'rgba(25,25,24,0.03)' }}>
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Mono · JetBrains Mono</p>
                <p className="font-mono text-[12px] text-text-secondary">
                  // labels, eyebrows, metadados técnicos
                </p>
              </div>
            </section>

            {/* PAGE 05 — Componentes */}
            <section data-page="componentes" className="min-h-[520px] px-8 lg:px-16 py-10 border-t border-black/[0.05]">
              <SectionHeader number="04" title="Componentes" />

              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Botões</p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide">
                  Primary
                </span>
                <span className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[12px] uppercase tracking-wide">
                  Secondary
                </span>
                <span className="font-mono inline-flex items-center gap-2 px-3 py-2.5 text-primary font-semibold text-[12px]">
                  Link →
                </span>
              </div>

              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Cards</p>
              <div className="rounded-2xl border border-black/[0.08] p-5" style={{ background: 'hsl(55 100% 97%)' }}>
                <div className="w-9 h-9 rounded-lg bg-primary/10 mb-3" />
                <p className="text-[13px] font-semibold text-text-primary mb-1">Título do card</p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Descrição com peso médio e contraste reduzido.
                </p>
              </div>
            </section>

            {/* PAGE 06 — Aplicações */}
            <section data-page="aplicacoes" className="min-h-[520px] px-8 lg:px-16 py-10 border-t border-black/[0.05] pb-16">
              <SectionHeader number="05" title="Aplicações" />

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="aspect-[3/2] rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                  <span className="font-bricolage text-[1.4rem] font-bold">empresa<span className="opacity-60">.</span></span>
                </div>
                <div className="aspect-[3/2] rounded-xl flex flex-col items-start justify-end p-4 border border-black/[0.08]" style={{ background: 'hsl(55 100% 97%)' }}>
                  <p className="font-mono text-[8px] text-text-dim uppercase tracking-widest">post · ig</p>
                  <p className="font-bricolage text-[1rem] font-bold leading-tight mt-1">Algo que faz<br />sentido.</p>
                </div>
              </div>

              <div className="rounded-xl p-4 border border-black/[0.08] mb-5" style={{ background: 'hsl(55 100% 97%)' }}>
                <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-2">Cartão · 9×5cm</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bricolage text-[1.1rem] font-bold leading-tight mb-1">Nome Sobrenome</p>
                    <p className="font-mono text-[9px] text-text-secondary">cargo · empresa</p>
                  </div>
                  <span className="font-bricolage text-[1.5rem] font-bold text-primary">e<span className="opacity-60">.</span></span>
                </div>
              </div>

              <p className="text-[12px] text-text-secondary leading-relaxed">
                Templates editáveis para social media, cartão de visita, papelaria e apresentações — todos no Figma, prontos para usar.
              </p>
            </section>

            {/* Bottom marker */}
            <div className="px-8 lg:px-16 py-6 text-center" style={{ background: 'rgba(25,25,24,0.02)' }}>
              <p className="font-mono text-[10px] text-text-dim">— fim do brandbook · v1.0 —</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-black/[0.06] flex items-center justify-between" style={{ background: 'rgba(25,25,24,0.02)' }}>
          <span className="font-mono text-[10px] text-text-secondary">brandbook-notkode.pdf · 6 páginas · 2.4mb</span>
          <span className="font-mono text-[10px] text-primary">↑ exemplo real de entrega</span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-black/[0.06]">
      <span className="font-mono text-[12px] text-primary">{number}</span>
      <h4 className="text-[18px] font-semibold tracking-tight text-text-primary">{title}</h4>
    </div>
  );
}

function LogoVariation({ bg, textColor, label, content, mono }: { bg: string; textColor: string; label: string; content: string; mono?: boolean }) {
  return (
    <div>
      <div className="aspect-[3/2] rounded-lg flex items-center justify-center mb-1.5" style={{ background: bg, border: '1px solid rgba(25,25,24,0.06)' }}>
        <span
          className={mono ? 'font-bricolage text-[1.4rem] font-bold' : 'font-bricolage text-[1rem] font-bold tracking-[-0.04em]'}
          style={{ color: textColor }}
        >
          {content}
        </span>
      </div>
      <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest text-center">{label}</p>
    </div>
  );
}

function ColorSwatch({ hex, name, desc, small }: { hex: string; name: string; desc?: string; small?: boolean }) {
  return (
    <div className={`rounded-xl overflow-hidden ${small ? '' : ''}`} style={{ border: '1px solid rgba(25,25,24,0.08)' }}>
      <div className={small ? 'h-12' : 'h-20'} style={{ background: hex }} />
      <div className="px-3 py-2" style={{ background: 'hsl(55 100% 97%)' }}>
        <p className={`font-semibold ${small ? 'text-[10px]' : 'text-[12px]'} text-text-primary mb-0.5`}>{name}</p>
        <p className="font-mono text-[9px] text-text-dim">{hex}</p>
        {desc && !small && <p className="font-mono text-[9px] text-text-secondary mt-1">{desc}</p>}
      </div>
    </div>
  );
}
