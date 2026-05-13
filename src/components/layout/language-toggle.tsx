'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = locale === 'pt' ? 'en' : 'pt';

  return (
    <button
      onClick={() =>
        startTransition(() => {
          router.replace(pathname, { locale: switchTo });
        })
      }
      disabled={isPending}
      className="font-label text-xs uppercase tracking-[0.12em] text-text-secondary hover:text-primary transition-colors px-2 py-1"
    >
      {locale === 'pt' ? 'EN' : 'PT'}
    </button>
  );
}
