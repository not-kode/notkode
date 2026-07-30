import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite rodar um segundo `next dev` em paralelo (ex.: conferir uma mudança sem
  // derrubar o servidor que já está aberto). Dois processos na mesma pasta .next
  // corrompem o cache e um deles morre. Sem a env, nada muda.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  experimental: {
    // Uploads de proposta (HTML/PDF) via server action — libera acima do 1MB padrão.
    serverActions: { bodySizeLimit: '10mb' },
  },
  // O mapa de calor virou sub-aba de Comportamento; a rota antiga não fica 404
  // para quem tiver a aba aberta.
  async redirects() {
    return [
      { source: '/admin/mapa-de-calor', destination: '/admin/sessoes?ver=calor', permanent: false },

      // Rotas do site antigo (React Router) que o Google ainda tem indexadas. Sem
      // isso elas caem no middleware do next-intl, viram /pt/companies e dão 404,
      // o motivo "não encontrado (404)" no Search Console. /blog/:slug fica de fora
      // de propósito: nunca houve post publicado, 404 ali é a resposta correta.
      { source: '/companies', destination: '/pt', permanent: true },
      { source: '/agencies', destination: '/pt/parcerias', permanent: true },
      { source: '/about-us', destination: '/pt/sobre', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'cdn.weweb.io' },
    ],
  },
};

export default withNextIntl(nextConfig);
