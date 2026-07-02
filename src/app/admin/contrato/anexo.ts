import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

// Embute a proposta HTML anexada dentro do próprio contrato, para que o
// "Salvar PDF" gere UM documento só (contrato + proposta) pronto p/ assinatura.
// Os estilos da proposta são escopados sob `.nk-anexo` para não vazarem no
// contrato (e vice-versa).

const SCOPE = '.nk-anexo';

/** Acha o índice do `}` que fecha o bloco aberto em openIdx (um `{`). */
function matchBrace(css: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return css.length - 1;
}

function prefixSelectorList(sel: string): string {
  return sel
    .split(',')
    .map((s) => {
      const t = s.trim();
      if (!t) return '';
      if (t === 'html' || t === 'body' || t === ':root') return SCOPE;
      if (t.startsWith('html ')) return SCOPE + t.slice(4);
      if (t.startsWith('body ')) return SCOPE + t.slice(4);
      return `${SCOPE} ${t}`;
    })
    .filter(Boolean)
    .join(', ');
}

/** Escopa todos os seletores do CSS sob `.nk-anexo`, tratando @media/@supports. */
function scopeCss(css: string): string {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let out = '';
  let idx = 0;
  while (idx < css.length) {
    const brace = css.indexOf('{', idx);
    if (brace === -1) break;
    const prelude = css.slice(idx, brace).trim();
    const close = matchBrace(css, brace);
    if (prelude.startsWith('@')) {
      if (/^@(media|supports|-moz-document)/i.test(prelude)) {
        const inner = css.slice(brace + 1, close);
        out += `${prelude} {\n${scopeCss(inner)}\n}\n`;
      } else {
        // @keyframes / @font-face — não escopar conteúdo interno.
        out += css.slice(idx, close + 1) + '\n';
      }
    } else {
      const body = css.slice(brace + 1, close);
      out += `${prefixSelectorList(prelude)} {${body}}\n`;
    }
    idx = close + 1;
  }
  return out;
}

export type Anexo = { css: string; body: string };

/** Baixa a proposta HTML anexada e devolve CSS escopado + corpo pronto p/ inline. */
export async function loadAnexoProposta(
  supabase: SupabaseClient,
  path: string | null,
): Promise<Anexo | null> {
  if (!path) return null;
  if (!/\.html?$/i.test(path)) return null; // só embute HTML; PDF não dá p/ inline

  const { data, error } = await supabase.storage.from('propostas').download(path);
  if (error || !data) return null;

  const raw = await data.text();

  // Remove scripts.
  const clean = raw.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Junta todos os <style>.
  let css = '';
  for (const m of clean.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css += '\n' + m[1];

  // Corpo.
  const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : clean;

  // Evita colisão da classe `.page` (contrato também usa `.page`).
  css = css.replace(/\.page\b/g, '.nkanexopage');
  body = body.replace(/class=("|')page\1/g, 'class="nkanexopage"');

  const scoped =
    `${SCOPE}{page-break-before:always;-webkit-print-color-adjust:exact;print-color-adjust:exact;}\n` +
    scopeCss(css);

  return { css: scoped, body };
}
