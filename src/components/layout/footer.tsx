import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand/logo';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t border-black/10">
      <div className="container mx-auto px-5 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 text-sm text-text-muted">
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
