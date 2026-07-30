import { getPathname, routing } from '@/i18n/routing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

/** Rota interna no formato do next-intl: '/sobre' ou { pathname: '/cases/[slug]', params }. */
type Href = Parameters<typeof getPathname>[0]['href'];

/** URL absoluta já com o pathname traduzido do locale (ex.: en + '/sobre' → /en/about). */
export function absoluteUrl(locale: string, href: Href): string {
  return `${SITE_URL}${getPathname({ locale, href })}`;
}

/**
 * Canonical + hreflang de uma rota. Sem isso o Google trata /pt/x e /en/x como
 * cópias e escolhe a canônica sozinho, um dos erros apontados pelo Search
 * Console. Passe sempre o href em português; a tradução do path sai do routing.
 */
export function seoAlternates(locale: string, href: Href) {
  return {
    canonical: absoluteUrl(locale, href),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, href)])),
      'x-default': absoluteUrl(routing.defaultLocale, href),
    },
  };
}
