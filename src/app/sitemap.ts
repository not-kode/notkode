import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

// Rotas estáticas do site (sem o /blog que ainda é placeholder)
const ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '/',                     changeFrequency: 'monthly', priority: 1.0 },
  { path: '/sistemas-ia',          changeFrequency: 'monthly', priority: 0.9 },
  { path: '/ecommerce',            changeFrequency: 'monthly', priority: 0.9 },
  { path: '/agentes-automacao',    changeFrequency: 'monthly', priority: 0.9 },
  { path: '/sites',                changeFrequency: 'monthly', priority: 0.9 },
  { path: '/brandbook',            changeFrequency: 'monthly', priority: 0.8 },
  { path: '/parcerias',            changeFrequency: 'monthly', priority: 0.7 },
  { path: '/cases',                changeFrequency: 'monthly', priority: 0.8 },
  { path: '/sobre',                changeFrequency: 'monthly', priority: 0.7 },
  { path: '/politica-privacidade', changeFrequency: 'yearly',  priority: 0.2 },
];

const LOCALES = ['pt', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.flatMap((r) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${r.path === '/' ? '' : r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${r.path === '/' ? '' : r.path}`])
        ),
      },
    }))
  );
}
