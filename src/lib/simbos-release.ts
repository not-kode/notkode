// Qual versão do SimbOS o site oferece.
//
// A resposta vem do mesmo lugar que uma cópia já instalada consulta para saber
// se saiu versão nova: os manifestos latest.yml (Windows) e latest-mac.yml (Mac)
// que o electron-builder sobe junto com os instaladores. Enquanto o número era
// escrito à mão aqui no repositório, ele atrasou uma release inteira — o site
// entregava a 0.1.0 com a 0.2.3 publicada havia dias. Publicar um release agora
// basta: nada precisa ser editado no site.
//
// Os manifestos também trazem o tamanho exato de cada arquivo, então a linha de
// metadados do card acompanha sozinha.

import {
  SIMBOS_FALLBACK_DOWNLOADS,
  SIMBOS_FALLBACK_VERSION,
  type AppDownload,
  type DownloadTarget,
} from '@/data/downloads';

// Os manifestos são buscados na origem real, não em notkode.com.br/downloads,
// para o site não depender de si mesmo para se montar. Mesmo default do rewrite
// em next.config.mjs — se a origem mudar, mude nos dois lugares.
const ORIGIN =
  process.env.SIMBOS_DOWNLOADS_ORIGIN ?? 'https://simbos-downloads-production.up.railway.app';

/** De quanto em quanto tempo a página volta a perguntar. Release é manual e raro. */
const REVALIDATE_SECONDS = 3600;

type ManifestFile = { url: string; size: number };
type Manifest = { version: string; files: ManifestFile[] };

/**
 * Lê o pedaço que interessa de um manifesto do electron-builder.
 *
 * O formato é sempre o mesmo punhado de chaves, então um parser de linha resolve
 * e evita trazer um pacote de YAML só para isto:
 *
 *   version: 0.2.3
 *   files:
 *     - url: SimbOS Setup 0.2.3.exe
 *       sha512: ...
 *       size: 108785159
 */
function parseManifest(yaml: string): Manifest | null {
  const version = yaml.match(/^version:\s*'?([^'\r\n]+?)'?\s*$/m)?.[1];
  if (!version) return null;

  const files: ManifestFile[] = [];
  for (const raw of yaml.split('\n')) {
    const line = raw.trim();

    // Cada arquivo começa na sua linha `- url:`; o nome pode ter espaços.
    const url = line.match(/^-\s*url:\s*'?(.+?)'?$/);
    if (url) {
      files.push({ url: url[1], size: 0 });
      continue;
    }

    // `size` só existe dentro de files (o do blockmap é `blockMapSize`).
    const size = line.match(/^size:\s*(\d+)$/);
    if (size && files.length > 0) files[files.length - 1].size = Number(size[1]);
  }

  return files.length > 0 ? { version, files } : null;
}

async function fetchManifest(name: string): Promise<Manifest | null> {
  try {
    const res = await fetch(`${ORIGIN}/${name}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return parseManifest(await res.text());
  } catch {
    // Origem fora do ar ou lenta: a página sai com o plano B, não quebra.
    return null;
  }
}

/** Bytes → o mesmo formato curto que os cards já mostravam ("123 MB"). */
function formatSize(bytes: number): string {
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}

function findFile(manifest: Manifest | null, target: DownloadTarget): ManifestFile | undefined {
  if (!manifest) return undefined;

  if (target === 'windows') return manifest.files.find((f) => f.url.endsWith('.exe'));

  const dmgs = manifest.files.filter((f) => f.url.endsWith('.dmg'));
  return target === 'mac-arm'
    ? dmgs.find((f) => f.url.includes('arm64'))
    : dmgs.find((f) => !f.url.includes('arm64'));
}

/**
 * Versão e arquivos do SimbOS para a página do app.
 *
 * Cada plataforma segue o seu próprio manifesto, então uma release que sai só
 * para Mac deixa o card do Windows na versão anterior, que é o certo: é o que
 * está publicado para baixar. O rótulo de versão da página mostra a do Mac, a
 * plataforma principal, e só difere da outra nessa janela entre as duas.
 */
export async function getSimbosRelease(): Promise<{ version: string; downloads: AppDownload[] }> {
  const [mac, win] = await Promise.all([fetchManifest('latest-mac.yml'), fetchManifest('latest.yml')]);

  const downloads = SIMBOS_FALLBACK_DOWNLOADS.map((d) => {
    const file = findFile(d.target === 'windows' ? win : mac, d.target);
    if (!file) return d;

    return {
      ...d,
      url: `/downloads/simbos/${file.url}`,
      size: file.size > 0 ? formatSize(file.size) : d.size,
    };
  });

  return { version: mac?.version ?? win?.version ?? SIMBOS_FALLBACK_VERSION, downloads };
}
