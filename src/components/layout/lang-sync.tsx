'use client';

import { useEffect } from 'react';

// Keeps the <html lang> attribute in sync with the current locale,
// since the root layout is static and can't read params.
export function LangSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
  }, [locale]);

  return null;
}
