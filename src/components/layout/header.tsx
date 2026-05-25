import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/logo';
import { LanguageToggle } from './language-toggle';
import { ServicesMenu } from './services-menu';
import { MobileMenu } from './mobile-menu';

export function Header() {
  const t = useTranslations('Nav');

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-black/10">
      <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-5 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo variant="horizontal-dark" width={120} priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          <Link href="/sistemas-ia" className="text-text-secondary hover:text-primary transition-colors font-medium">
            {t('sistemasIA')}
          </Link>
          <ServicesMenu />
          <Link href="/parcerias" className="text-text-secondary hover:text-primary transition-colors">
            {t('parcerias')}
          </Link>
          <Link href="/sobre" className="text-text-secondary hover:text-primary transition-colors">
            {t('sobre')}
          </Link>
        </nav>

        {/* Right side: language + mobile menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          <LanguageToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
