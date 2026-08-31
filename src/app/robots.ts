import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /_next/ ficou de fora do disallow de propósito: é onde o Next serve o
        // CSS e o JS, e bloquear isso faz o Googlebot renderizar a página sem
        // estilo nenhum na hora de avaliar layout, mobile e Core Web Vitals. O
        // Google pede explicitamente que esses arquivos fiquem liberados.
        disallow: ['/api/', '/blog'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
