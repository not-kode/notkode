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
    '/sites': {
      pt: '/sites',
      en: '/websites',
    },
    '/ecommerce': '/ecommerce',
    '/brandbook': '/brandbook',
    '/apps': '/apps',
    // Os dois produtos que a gente distribui direto, sem loja no meio. O slug é o
    // nome do app nos dois idiomas — é assim que as pessoas procuram por eles.
    '/apps/simbos': '/apps/simbos',
    '/apps/fala-que-eu-te-escuto': '/apps/fala-que-eu-te-escuto',
    '/parcerias': {
      pt: '/parcerias',
      en: '/partners',
    },
    '/cases': '/cases',
    '/cases/[slug]': '/cases/[slug]',
    '/sobre': {
      pt: '/sobre',
      en: '/about',
    },
    '/blog': '/blog',
    '/politica-privacidade': {
      pt: '/politica-privacidade',
      en: '/privacy-policy',
    },
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
