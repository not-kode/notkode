// Site e Instagram do cliente são digitados de qualquer jeito ("@fulano",
// "instagram.com/fulano", "www.fulano.com.br"). Aqui vira link clicável sem
// obrigar ninguém a digitar https:// na mão.

/** Endereço completo do site a partir do que foi digitado. */
export function siteHref(site: string | null | undefined): string | null {
  const v = (site ?? '').trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Só o @ do perfil, sem URL nem arroba — é o que cabe na tela. */
export function instagramHandle(instagram: string | null | undefined): string | null {
  const v = (instagram ?? '').trim();
  if (!v) return null;
  const semUrl = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '');
  const limpo = semUrl.replace(/[/?].*$/, '').trim();
  return limpo || null;
}

/** Endereço do perfil no Instagram. */
export function instagramHref(instagram: string | null | undefined): string | null {
  const handle = instagramHandle(instagram);
  return handle ? `https://instagram.com/${handle}` : null;
}
