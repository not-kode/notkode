import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { DotPattern } from './dot-pattern';

type CompanionLabel = 'site' | 'sistema' | 'loja';

export function BrandbookCombo({
  companion,
  surface = 'base',
}: {
  companion: CompanionLabel;
  surface?: 'base' | 'elevated';
}) {
  return (
    <section className={`relative overflow-hidden ${surface === 'elevated' ? 'bg-surface-elevated' : 'bg-surface-base'}`}>
      <DotPattern opacity={0.04} />

      {/* Acento de cor no topo — linha azul que dá destaque visual à seção */}
      <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(59,130,246,0.50) 30%, rgba(59,130,246,0.50) 70%, transparent 100%)' }} />

      {/* Glow sutil centrado */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div style={{ width: 600, height: 300, background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] text-primary uppercase tracking-[0.2em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            opcional · combo
          </span>
          <h3 className="text-[1.5rem] md:text-[1.875rem] lg:text-[2rem] font-semibold tracking-tight text-text-primary leading-snug mb-4">
            Vai precisar de identidade visual{' '}
            <span className="font-bricolage">também?</span>
          </h3>
          <p className="text-[14px] lg:text-[15px] text-text-secondary leading-relaxed mb-7 max-w-lg mx-auto">
            A gente faz o brandbook (logo, paleta, tipografia e manual) junto com o seu {companion}. O combo sai com desconto e a identidade chega aplicada sem reinterpretação.
          </p>
          <Link
            href="/brandbook"
            className="font-bricolage inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/25 hover:bg-primary/15 text-primary font-bold text-[13px] uppercase tracking-wide transition-all duration-200 hover:-translate-y-px"
          >
            Ver brandbook
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
