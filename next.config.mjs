import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Geração de PDF do contrato usa chromium headless — não empacotar no bundle.
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  experimental: {
    // Uploads de proposta (HTML/PDF) via server action — libera acima do 1MB padrão.
    serverActions: { bodySizeLimit: '10mb' },
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
