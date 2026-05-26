import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { DotPattern } from './dot-pattern';

type CompanionLabel = 'site' | 'sistema' | 'loja';

export async function BrandbookCombo({
  companion,
  surface = 'base',
}: {
  companion: CompanionLabel;
  surface?: 'base' | 'elevated';
}) {
  const t = await getTranslations('BrandbookCombo');
  const companionKey =
    companion === 'site' ? 'companionSite' : companion === 'sistema' ? 'companionSistema' : 'companionLoja';
  const companionWord = t(companionKey);

  return (
    <section className={`relative overflow-hidden ${surface === 'elevated' ? 'bg-surface-elevated' : 'bg-surface-base'}`}>
      <DotPattern opacity={0.04} />

      <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(59,130,246,0.50) 30%, rgba(59,130,246,0.50) 70%, transparent 100%)' }} />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div style={{ width: 600, height: 300, background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] text-primary uppercase tracking-[0.2em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {t('eyebrow')}
          </span>
          <h3 className="text-[1.5rem] md:text-[1.875rem] lg:text-[2rem] font-semibold tracking-tight text-text-primary leading-snug mb-4">
            {t('titleLine1')}{' '}
            <span className="font-bricolage">{t('titleAccent')}</span>
          </h3>
          <p className="text-[14px] lg:text-[15px] text-text-secondary leading-relaxed mb-7 max-w-lg mx-auto">
            {t('body', { companion: companionWord })}
          </p>
          <Link
            href="/brandbook"
            className="font-bricolage inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/25 hover:bg-primary/15 text-primary font-bold text-[13px] uppercase tracking-wide transition-all duration-200 hover:-translate-y-px"
          >
            {t('cta')}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
