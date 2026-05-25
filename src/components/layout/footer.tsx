import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand/logo';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="relative overflow-hidden border-t border-black/[0.06]">
      {/* Gradient mesh de fundo — azul suave que emerge do canto */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          style={{
            position: 'absolute',
            width: '70%',
            height: '300%',
            bottom: '-80%',
            left: '-10%',
            background:
              'radial-gradient(ellipse 55% 50% at 30% 70%, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 55%, transparent 75%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '55%',
            height: '250%',
            bottom: '-70%',
            right: '-5%',
            background:
              'radial-gradient(ellipse at center, rgba(147,197,253,0.10) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-5 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 text-sm text-text-muted">
        <div className="flex items-center gap-4">
          <Logo variant="horizontal-dark" width={96} />
          <span className="font-mono text-[11px] lowercase tracking-tight">
            {t('tagline').toLowerCase()}
          </span>
        </div>
        <div className="flex flex-col md:items-end gap-1 font-mono text-[11px] text-text-dim">
          <span>{t('rights')}</span>
          <span>{t('cnpj')} · {t('location')}</span>
          <Link href="/politica-privacidade" className="hover:text-primary transition-colors mt-1">
            política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
