// Markdown lido, não interpretado por biblioteca: as notas e os briefings do
// sistema são escritos em markdown por gente e por IA, e mostrar o texto cru
// (com asterisco e sustenido no meio) é ruim de ler.
//
// Cobre o que aparece nesses textos: títulos, listas, citação, blocos de código,
// negrito, itálico, `código`, links e regras horizontais. Nada de HTML embutido
// — o conteúdo vira elemento React, então nenhuma marcação escrita na nota é
// interpretada como página.

import { Fragment, type ReactNode } from 'react';

/** Negrito, itálico, código e link dentro de uma linha. */
function inline(texto: string, chave: string): ReactNode[] {
  const partes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let ultimo = 0;
  let achado: RegExpExecArray | null;
  let i = 0;

  while ((achado = regex.exec(texto))) {
    if (achado.index > ultimo) partes.push(texto.slice(ultimo, achado.index));
    const t = achado[0];
    const k = `${chave}-${i++}`;

    if (t.startsWith('**') || t.startsWith('__')) {
      partes.push(<strong key={k} className="font-semibold text-text-primary">{t.slice(2, -2)}</strong>);
    } else if (t.startsWith('`')) {
      partes.push(
        <code key={k} className="rounded bg-black/[0.05] px-1 py-0.5 font-mono text-[0.9em]">{t.slice(1, -1)}</code>,
      );
    } else if (t.startsWith('[')) {
      const corte = t.indexOf('](');
      const href = t.slice(corte + 2, -1);
      partes.push(
        <a
          key={k}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
        >
          {t.slice(1, corte)}
        </a>,
      );
    } else {
      partes.push(<em key={k}>{t.slice(1, -1)}</em>);
    }
    ultimo = achado.index + t.length;
  }

  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

export function Markdown({ texto }: { texto: string }) {
  const linhas = texto.replace(/\r\n/g, '\n').split('\n');
  const blocos: ReactNode[] = [];

  // Uma passada só, guardando o que está aberto: lista, bloco de código ou
  // parágrafo. É o suficiente para markdown de nota, que não aninha.
  let paragrafo: string[] = [];
  let lista: { ordenada: boolean; itens: string[] } | null = null;
  let codigo: string[] | null = null;

  const fecharParagrafo = () => {
    if (!paragrafo.length) return;
    const i = blocos.length;
    blocos.push(
      <p key={`p-${i}`} className="text-[13px] leading-relaxed text-text-secondary">
        {inline(paragrafo.join(' '), `p-${i}`)}
      </p>,
    );
    paragrafo = [];
  };

  const fecharLista = () => {
    if (!lista) return;
    const i = blocos.length;
    const { ordenada, itens } = lista;
    const Tag = ordenada ? 'ol' : 'ul';
    blocos.push(
      <Tag
        key={`l-${i}`}
        className={`flex flex-col gap-1 pl-5 text-[13px] leading-relaxed text-text-secondary ${
          ordenada ? 'list-decimal' : 'list-disc'
        }`}
      >
        {itens.map((item, j) => (
          <li key={j} className="marker:text-text-muted">{inline(item, `l-${i}-${j}`)}</li>
        ))}
      </Tag>,
    );
    lista = null;
  };

  const fechar = () => { fecharParagrafo(); fecharLista(); };

  for (const linha of linhas) {
    if (linha.trimStart().startsWith('```')) {
      if (codigo) {
        blocos.push(
          <pre
            key={`c-${blocos.length}`}
            className="overflow-x-auto rounded-md bg-[#F4F5F7] px-3 py-2 font-mono text-[12px] leading-relaxed text-text-primary"
          >
            {codigo.join('\n')}
          </pre>,
        );
        codigo = null;
      } else {
        fechar();
        codigo = [];
      }
      continue;
    }
    if (codigo) { codigo.push(linha); continue; }

    if (!linha.trim()) { fechar(); continue; }

    const titulo = /^(#{1,4})\s+(.*)$/.exec(linha);
    if (titulo) {
      fechar();
      const nivel = titulo[1].length;
      const tamanho = nivel === 1 ? 'text-[15px]' : nivel === 2 ? 'text-[14px]' : 'text-[13px]';
      blocos.push(
        <p key={`h-${blocos.length}`} className={`${tamanho} font-semibold text-text-primary`}>
          {inline(titulo[2], `h-${blocos.length}`)}
        </p>,
      );
      continue;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(linha)) {
      fechar();
      blocos.push(<hr key={`hr-${blocos.length}`} className="border-black/[0.08]" />);
      continue;
    }

    const citacao = /^>\s?(.*)$/.exec(linha);
    if (citacao) {
      fechar();
      blocos.push(
        <p
          key={`q-${blocos.length}`}
          className="border-l-2 border-black/[0.12] pl-3 text-[13px] italic leading-relaxed text-text-muted"
        >
          {inline(citacao[1], `q-${blocos.length}`)}
        </p>,
      );
      continue;
    }

    const item = /^\s*[-*+]\s+(.*)$/.exec(linha);
    const numerado = /^\s*\d+[.)]\s+(.*)$/.exec(linha);
    if (item || numerado) {
      fecharParagrafo();
      const ordenada = !!numerado;
      if (lista && lista.ordenada !== ordenada) fecharLista();
      if (!lista) lista = { ordenada, itens: [] };
      lista.itens.push((item ?? numerado)![1]);
      continue;
    }

    fecharLista();
    paragrafo.push(linha.trim());
  }

  fechar();
  if (codigo) {
    blocos.push(
      <pre key="c-fim" className="overflow-x-auto rounded-md bg-[#F4F5F7] px-3 py-2 font-mono text-[12px] text-text-primary">
        {codigo.join('\n')}
      </pre>,
    );
  }

  return <div className="flex flex-col gap-2.5">{blocos.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}
