// Produtos próprios da Notkode publicados nas lojas e na web.
// Os textos (nome, tagline, descrição) ficam em messages/{pt,en}.json no namespace
// `Apps.items.<id>` — aqui mora só o que não é traduzível: links, plataformas e prova.

export type AppPlatform = 'ios' | 'android' | 'mac' | 'windows' | 'web';

export type NotkodeApp = {
  /** Casa com a chave em `Apps.items.<id>` nas mensagens. */
  id: string;
  /** Link principal do card. */
  href: string;
  platforms: AppPlatform[];
  /** Ícone real do app, em `public/images/apps/`. Baixado da loja ou do site do produto. */
  icon: string;
  /** Avaliação pública da loja, quando existe. Prova social real, nunca estimada. */
  rating?: { score: string; count: string };
};

export const APPS: NotkodeApp[] = [
  {
    id: 'creia',
    href: 'https://apps.apple.com/br/app/creia-devocional-di%C3%A1rio/id6761137167',
    platforms: ['ios'],
    icon: '/images/apps/creia.png',
    rating: { score: '4,7', count: '280' },
  },
  {
    id: 'fala',
    href: 'https://fala.up.railway.app/',
    platforms: ['mac', 'windows'],
    icon: '/images/apps/fala.png',
  },
  {
    id: 'simbos',
    href: 'https://simbos.vercel.app/',
    platforms: ['web'],
    icon: '/images/apps/simbos.png',
  },
  {
    id: 'easycoexistence',
    href: 'https://easycoexistence-web-production.up.railway.app/',
    platforms: ['web'],
    icon: '/images/apps/easycoexistence.png',
  },
];
