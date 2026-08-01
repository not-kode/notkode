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

export const SIMBOS_VERSION = '0.1.0';

export const SIMBOS_DOWNLOADS: AppDownload[] = [
  {
    target: 'mac-arm',
    url: `/downloads/simbos/SimbOS-${SIMBOS_VERSION}-arm64.dmg`,
    format: '.dmg',
    size: '123 MB',
    requirement: 'macOS 11+',
  },
  {
    target: 'mac-intel',
    url: `/downloads/simbos/SimbOS-${SIMBOS_VERSION}.dmg`,
    format: '.dmg',
    size: '128 MB',
    requirement: 'macOS 11+',
  },
  {
    target: 'windows',
    url: `/downloads/simbos/SimbOS Setup ${SIMBOS_VERSION}.exe`,
    format: '.exe',
    size: '104 MB',
    requirement: 'Windows 10/11 (x64)',
    beta: true,
  },
];
