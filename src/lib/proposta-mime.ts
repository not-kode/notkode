// O tipo do arquivo da proposta sai da extensão, não do que o navegador informa
// no upload: sem isso o HTML volta do storage como texto e a proposta abre em
// código-fonte, com os acentos quebrados (falta o charset).
const TIPOS: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  txt: 'text/plain; charset=utf-8',
};

export function mimeDaProposta(nomeOuCaminho: string, fallback = 'application/octet-stream'): string {
  const ext = (nomeOuCaminho.split('.').pop() ?? '').toLowerCase();
  return TIPOS[ext] ?? fallback;
}
