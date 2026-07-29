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
    return [{ source: '/admin/mapa-de-calor', destination: '/admin/sessoes?ver=calor', permanent: false }];
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
