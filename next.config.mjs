import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Onde os instaladores do SimbOS estão realmente hospedados: um bucket do
// Railway (projeto simbOS), servido pelo serviço `simbos-downloads`, porque
// bucket de lá é privado e não entrega arquivo direto ao público.
//
// Fica em variável porque este destino pode mudar sem que a URL pública mude, e
// ela não pode mudar nunca: é o endereço que cada cópia instalada do app
// consulta para saber se saiu versão nova.
const SIMBOS_DOWNLOADS_ORIGIN =
  process.env.SIMBOS_DOWNLOADS_ORIGIN ?? 'https://simbos-downloads-production.up.railway.app';

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
  // O PDF do documento assinado sai de um Chrome headless. O binário do
  // Chromium não pode passar pelo bundler: fica como dependência externa da
  // função, carregada do node_modules em tempo de execução.
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  // O mapa de calor virou sub-aba de Comportamento; a rota antiga não fica 404
  // para quem tiver a aba aberta.
  // Instaladores do SimbOS: o arquivo é buscado e devolvido por aqui, então quem
  // baixa nunca sai de notkode.com.br. Rewrite e não redirect de propósito — o
  // redirect jogava a pessoa num endereço `up.railway.app`, que é onde os
  // arquivos moram mas não é a cara que o download deve ter.
  //
  // O caminho público não pode mudar nunca: o electron-builder assa
  // `notkode.com.br/downloads/simbos` dentro do app, e cada cópia instalada lê
  // latest-mac.yml / latest.yml daqui para saber se saiu versão nova. Só a
  // origem é trocável, pela env, sem mexer no app de ninguém.
  //
  // Cuidado ao mexer na origem: ela precisa responder `Cache-Control: no-store`
  // nas respostas parciais (206). Quando servia as parciais com o mesmo cache
  // do arquivo inteiro, a CDN guardou um pedaço de 1 KB como se fosse o
  // recurso completo e passou a entregar aquilo para todo mundo, com status
  // 200. O instalador baixava truncado e nada no site indicava o problema.
  async rewrites() {
    return [
      {
        source: '/downloads/simbos/:file*',
        destination: `${SIMBOS_DOWNLOADS_ORIGIN}/:file*`,
      },
    ];
  },
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

      // Estas três aparecem no relatório de 404 do Search Console mas não estão
      // no App.tsx do _legacy, devem vir de uma versão anterior ainda. Apontam
      // para o serviço equivalente de hoje.
      { source: '/systems', destination: '/pt/sistemas-ia', permanent: true },
      { source: '/shop', destination: '/pt/ecommerce', permanent: true },
      { source: '/agents', destination: '/pt/agentes-automacao', permanent: true },
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
