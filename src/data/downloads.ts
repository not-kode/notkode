// Instaladores dos apps que a Notkode distribui direto, sem loja.
//
// Aqui mora só o que não é traduzível: endereço do arquivo, formato, tamanho e
// requisito de sistema. Os textos (nome da plataforma, descrição de quem deve
// baixar o quê) ficam em messages/{pt,en}.json, no namespace da página do app.

export type DownloadTarget = 'mac-arm' | 'mac-intel' | 'windows';

export type AppDownload = {
  target: DownloadTarget;
  url: string;
  /** Extensão mostrada na linha de metadados do card, ex.: ".dmg". */
  format: string;
  /** Tamanho aproximado do arquivo, já formatado. */
  size: string;
  /** Requisito mínimo de sistema, ex.: "macOS 11+". */
  requirement: string;
  /** Marca o card como beta — muda o rótulo do botão e mostra o selo. */
  beta?: boolean;
};

// ── Fala que eu te escuto ───────────────────────────────────────────────────
// Servidos pelo próprio site, em public/downloads/fala. São ~3 MB cada; o que
// pesa (o modelo de voz, ~574 MB) o app baixa sozinho na primeira execução.

export const FALA_VERSION = '0.1.20';

export const FALA_DOWNLOADS: AppDownload[] = [
  {
    target: 'mac-arm',
    url: '/downloads/fala/fala-aarch64-apple-darwin.dmg',
    format: '.dmg',
    size: '3 MB',
    requirement: 'macOS 11+',
  },
  {
    target: 'mac-intel',
    url: '/downloads/fala/fala-x86_64-apple-darwin.dmg',
    format: '.dmg',
    size: '3 MB',
    requirement: 'macOS 11+',
  },
  {
    target: 'windows',
    url: '/downloads/fala/fala-x86_64-pc-windows-msvc.zip',
    format: '.zip',
    size: '3 MB',
    requirement: 'Windows 10/11',
    beta: true,
  },
];

// ── SimbOS ──────────────────────────────────────────────────────────────────
// Grandes demais para o repositório (um Electron completo por plataforma), então
// vivem fora e o site redireciona — ver o rewrite de /downloads/simbos em
// next.config.mjs. O caminho público não pode mudar: cada cópia instalada lê
// latest-mac.yml / latest.yml dele para descobrir se saiu versão nova.
//
// Diferente do Fala, aqui a versão não é escrita à mão: a página lê esses mesmos
// manifestos e monta os cards a partir deles — ver src/lib/simbos-release.ts.
// O que está abaixo é o plano B, usado só quando os manifestos não respondem na
// hora de gerar a página. Ficou parado uma release inteira quando era a fonte da
// verdade: o site ainda oferecia a 0.1.0 com a 0.2.3 no ar há dias.

export const SIMBOS_FALLBACK_VERSION = '0.2.3';

export const SIMBOS_FALLBACK_DOWNLOADS: AppDownload[] = [
  {
    target: 'mac-arm',
    url: `/downloads/simbos/SimbOS-${SIMBOS_FALLBACK_VERSION}-arm64.dmg`,
    format: '.dmg',
    size: '123 MB',
    requirement: 'macOS 11+',
  },
  {
    target: 'mac-intel',
    url: `/downloads/simbos/SimbOS-${SIMBOS_FALLBACK_VERSION}.dmg`,
    format: '.dmg',
    size: '128 MB',
    requirement: 'macOS 11+',
  },
  {
    target: 'windows',
    url: `/downloads/simbos/SimbOS Setup ${SIMBOS_FALLBACK_VERSION}.exe`,
    format: '.exe',
    size: '104 MB',
    requirement: 'Windows 10/11 (x64)',
    beta: true,
  },
];
