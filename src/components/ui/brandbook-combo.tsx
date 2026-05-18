import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

type CompanionLabel = 'site' | 'sistema' | 'loja';

export function BrandbookCombo({
  companion,
  surface = 'base',
}: {
  companion: CompanionLabel;
  surface?: 'base' | 'elevated';
}) {
  return (
    <section className={surface === 'elevated' ? 'bg-surface-elevated' : 'bg-surface-base'}>
      <div className="container mx-auto px-5 lg:px-8 py-14 lg:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">
            opcional · combo
          </p>
          <h3 className="text-[1.25rem] md:text-[1.5rem] font-semibold tracking-tight text-text-primary leading-snug mb-3">
            Vai precisar de identidade visual{' '}
            <span className="font-bricolage">também?</span>
          </h3>
          <p className="text-[14px] lg:text-[15px] text-text-secondary leading-relaxed mb-6 max-w-lg mx-auto">
            A gente faz o brandbook (logo, paleta, tipografia e manual) junto com o seu {companion}. O combo sai com desconto e a identidade chega aplicada sem reinterpretação.
          </p>
          <Link
            href="/brandbook"
            className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/[0.12] bg-white/60 hover:bg-white/90 text-text-primary font-semibold text-[12px] uppercase tracking-wide transition-all duration-200"
          >
            Ver brandbook
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
