import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { CASES } from '@/data/cases';
import { absoluteUrl } from '@/lib/seo';

type Href = Parameters<typeof absoluteUrl>[1];

// Data de última mudança real de conteúdo. Antes isto era `new Date()`, então
// todo deploy reescrevia as 52 entradas com a data da build, mesmo quando nada
// tinha mudado. O Google compara o lastmod com o que ele vê na página, percebe
// que a data não corresponde a mudança nenhuma e passa a ignorar o campo. É
// para editar à mão quando as páginas mudarem de verdade.
const CONTENT_UPDATED = new Date('2026-08-10T00:00:00Z');

// Rotas estáticas do site (sem o /blog que ainda é placeholder e está noindex).
// O path é sempre o de português e o absoluteUrl traduz por locale. Montar a URL
// na mão colocava /en/sistemas-ia no sitemap, que responde 307 para /en/ai-systems
// e virava "página com redirecionamento" no Search Console.
const ROUTES: Array<{ path: Href; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '/',                     changeFrequency: 'monthly', priority: 1.0 },
  { path: '/sistemas-ia',          changeFrequency: 'monthly', priority: 0.9 },
  { path: '/ecommerce',            changeFrequency: 'monthly', priority: 0.9 },
  { path: '/agentes-automacao',    changeFrequency: 'monthly', priority: 0.9 },
  { path: '/sites',                changeFrequency: 'monthly', priority: 0.9 },
  { path: '/brandbook',            changeFrequency: 'monthly', priority: 0.8 },
  { path: '/apps',                 changeFrequency: 'monthly', priority: 0.8 },
  { path: '/apps/simbos',          changeFrequency: 'monthly', priority: 0.7 },
  { path: '/apps/fala-que-eu-te-escuto', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/apps/ubt/privacy',     changeFrequency: 'yearly',  priority: 0.2 },
  { path: '/parcerias',            changeFrequency: 'monthly', priority: 0.7 },
  { path: '/cases',                changeFrequency: 'monthly', priority: 0.8 },
  { path: '/sobre',                changeFrequency: 'monthly', priority: 0.7 },
  { path: '/politica-privacidade', changeFrequency: 'yearly',  priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = (
    href: Href,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number
  ) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, href),
      lastModified: CONTENT_UPDATED,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, href)])),
      },
    }));

  return [
    ...ROUTES.flatMap((r) => entries(r.path, r.changeFrequency, r.priority)),
    ...CASES.flatMap((c) => entries({ pathname: '/cases/[slug]', params: { slug: c.slug } }, 'monthly', 0.6)),
  ];
}
