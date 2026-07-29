'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Clique, PaginaHeatmap } from './heatmap-data';

// A página real entra num iframe (mesmo domínio, então dá para medir a altura
// dela) e o calor é pintado por cima, num canvas do mesmo tamanho.
//
// Cor: rampa quente âmbar → vermelho, os mesmos tokens de warning e danger da
// marca. Sequencial de verdade, sem arco-íris. O azul da marca ficaria de fora
// aqui de propósito: o site é azul, e calor azul sobre botão azul não se lê.

const LARGURA = { desktop: 1440, mobile: 390 } as const;
type Dispositivo = keyof typeof LARGURA;
type Modo = 'cliques' | 'rolagem';

/** Raio da mancha de cada clique, em px do documento de referência. */
const RAIO = 44;

/** Rampa de calor: para uma intensidade 0..1, devolve [r, g, b]. */
function rampa(t: number): [number, number, number] {
  // #F59E0B (âmbar) → #EF4444 (vermelho), interpolado em RGB simples: as duas
  // pontas têm luminosidade próxima, então o degradê não cria banda escura.
  const de = [245, 158, 11];
  const ate = [239, 68, 68];
  return [
    Math.round(de[0] + (ate[0] - de[0]) * t),
    Math.round(de[1] + (ate[1] - de[1]) * t),
    Math.round(de[2] + (ate[2] - de[2]) * t),
  ];
}

function desenharCalor(canvas: HTMLCanvasElement, cliques: Clique[], largura: number, altura: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = largura;
  canvas.height = altura;
  ctx.clearRect(0, 0, largura, altura);
  if (cliques.length === 0) return;

  // Passo 1: acumula densidade em escala de cinza (alpha somado).
  ctx.globalCompositeOperation = 'lighter';
  for (const c of cliques) {
    const x = c.xRel * largura;
    const y = c.yDoc;
    if (y < 0 || y > altura) continue;
    const g = ctx.createRadialGradient(x, y, 0, x, y, RAIO);
    g.addColorStop(0, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, RAIO, 0, Math.PI * 2);
    ctx.fill();
  }

  // Passo 2: troca o cinza acumulado pela rampa de cor.
  ctx.globalCompositeOperation = 'source-over';
  const img = ctx.getImageData(0, 0, largura, altura);
  const px = img.data;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3];
    if (a === 0) continue;
    const t = Math.min(1, a / 255);
    const [r, g, b] = rampa(t);
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    // Teto de opacidade: o conteúdo da página tem que continuar visível embaixo.
    px[i + 3] = Math.round(Math.min(255, a * 1.6) * 0.72);
  }
  ctx.putImageData(img, 0, 0);
}

export function HeatmapView({ paginas }: { paginas: PaginaHeatmap[] }) {
  const [path, setPath] = useState(paginas[0]?.path ?? '/pt');
  const [disp, setDisp] = useState<Dispositivo>('desktop');
  const [modo, setModo] = useState<Modo>('cliques');
  const [alturaPagina, setAlturaPagina] = useState(2400);
  const [escala, setEscala] = useState(1);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const pagina = paginas.find((p) => p.path === path) ?? paginas[0];
  const dados = pagina?.[disp];
  const largura = LARGURA[disp];

  // A moldura encolhe a página inteira para caber na largura disponível.
  useEffect(() => {
    const ajustar = () => {
      const box = boxRef.current;
      if (box) setEscala(Math.min(1, box.clientWidth / largura));
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, [largura]);

  // Mede a altura real da página carregada (mesmo domínio, então dá para ler).
  const aoCarregar = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const h = Math.max(doc.body?.scrollHeight ?? 0, doc.documentElement?.scrollHeight ?? 0);
    if (h > 0) setAlturaPagina(h);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dados) return;
    if (modo === 'cliques') desenharCalor(canvas, dados.cliques, largura, alturaPagina);
    else canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }, [dados, modo, largura, alturaPagina]);

  // Mapa de rolagem: para cada faixa da página, quantas sessões chegaram até lá.
  const faixas = useMemo(() => {
    if (!dados || dados.alcances.length === 0) return [];
    const total = dados.alcances.length;
    const PASSO = 40;
    const out: { topo: number; altura: number; pct: number }[] = [];
    for (let y = 0; y < alturaPagina; y += PASSO) {
      const chegaram = dados.alcances.filter((a) => a >= y).length;
      out.push({ topo: y, altura: PASSO, pct: chegaram / total });
    }
    return out;
  }, [dados, alturaPagina]);

  // Onde metade das pessoas parou: a linha que resume a página inteira.
  const linhaMetade = useMemo(() => faixas.find((f) => f.pct <= 0.5)?.topo ?? null, [faixas]);

  if (!pagina) {
    return (
      <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
        Nenhuma gravação com clique ou rolagem ainda. Assim que alguém navegar no site, o mapa aparece aqui.
      </p>
    );
  }

  const totalCliques = dados?.cliques.length ?? 0;
  const totalSessoes = dados?.sessoes ?? 0;

  return (
    <div>
      {/* Filtros numa linha só, acima do gráfico. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="rounded-md border border-black/[0.12] bg-white px-2.5 py-1.5 text-sm text-text-primary"
        >
          {paginas.map((p) => (
            <option key={p.path} value={p.path}>
              {p.path} · {p.desktop.cliques.length + p.mobile.cliques.length} cliques
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
          {(['desktop', 'mobile'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDisp(d)}
              className={`rounded-sm px-3 py-1 text-[12px] font-medium capitalize transition-colors ${
                disp === d ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
          {([['cliques', 'Cliques'], ['rolagem', 'Rolagem']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`rounded-sm px-3 py-1 text-[12px] font-medium transition-colors ${
                modo === m ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[12px] text-text-muted">
          {modo === 'cliques'
            ? `${totalCliques} clique${totalCliques === 1 ? '' : 's'} · ${totalSessoes} sessõe${totalSessoes === 1 ? '' : 's'}`
            : `${totalSessoes} sessõe${totalSessoes === 1 ? '' : 's'} medidas`}
        </span>
      </div>

      {totalCliques === 0 && modo === 'cliques' && (
        <p className="mb-3 rounded-md border border-warning/30 bg-warning/[0.06] px-3 py-2 text-[12px] text-[#B45309]">
          Nenhum clique gravado nesta página em {disp}. Troque de dispositivo ou de página.
        </p>
      )}

      {/* Legenda: sem ela a rampa não significa nada. */}
      <div className="mb-3 flex items-center gap-3 text-[11px] text-text-muted">
        {modo === 'cliques' ? (
          <>
            <span>menos cliques</span>
            <span className="h-2 w-32 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.35), rgba(239,68,68,0.95))' }} />
            <span>mais cliques</span>
          </>
        ) : (
          <>
            <span>todo mundo passou</span>
            <span className="h-2 w-32 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.10), rgba(239,68,68,0.75))' }} />
            <span>quase ninguém chegou</span>
          </>
        )}
      </div>

      <div ref={boxRef} className="overflow-hidden rounded-lg border border-black/[0.08] bg-white">
        <div
          className="relative origin-top-left"
          style={{ width: largura, height: alturaPagina, transform: `scale(${escala})` }}
        >
          <iframe
            ref={iframeRef}
            src={path}
            onLoad={aoCarregar}
            title={`Página ${path}`}
            className="pointer-events-none absolute inset-0 border-0"
            style={{ width: largura, height: alturaPagina }}
          />

          {modo === 'cliques' ? (
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ width: largura, height: alturaPagina }} />
          ) : (
            <div className="pointer-events-none absolute inset-0">
              {faixas.map((f) => (
                <div
                  key={f.topo}
                  className="absolute left-0 w-full"
                  style={{
                    top: f.topo,
                    height: f.altura,
                    // Quanto MENOS gente chegou, mais escuro: o vermelho marca
                    // o trecho que ninguém viu, que é a informação acionável.
                    background: `rgba(239,68,68,${((1 - f.pct) * 0.75).toFixed(3)})`,
                  }}
                />
              ))}
              {linhaMetade != null && (
                <div className="absolute left-0 w-full border-t-2 border-dashed border-white" style={{ top: linhaMetade }}>
                  <span className="ml-3 inline-block -translate-y-1/2 rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                    metade das pessoas parou aqui
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Altura de referência: a moldura mostra a página inteira, encolhida. */}
      <p className="mt-2 text-[11px] text-text-muted">
        Página renderizada com {largura}px de largura e {Math.round(alturaPagina)}px de altura, reduzida a{' '}
        {Math.round(escala * 100)}% para caber na tela. Os cliques foram normalizados pela largura da tela de cada visitante.
      </p>
    </div>
  );
}
