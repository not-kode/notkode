import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/sistemas-ia': {
      pt: '/sistemas-ia',
      en: '/ai-systems',
    },
    '/agentes-automacao': {
      pt: '/agentes-automacao',
      en: '/ai-agents-automation',
    },
    '/produtos-digitais': {
      pt: '/produtos-digitais',
      en: '/digital-products',
    },
    '/design': '/design',
    '/parcerias': {
      pt: '/parcerias',
      en: '/partners',
    },
    '/cases': '/cases',
    '/sobre': {
      pt: '/sobre',
      en: '/about',
    },
    '/blog': '/blog',
    '/contato': {
      pt: '/contato',
      en: '/contact',
    },
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
