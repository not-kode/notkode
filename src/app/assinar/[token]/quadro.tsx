'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type QuadroHandle = {
  temTraco: () => boolean;
  paraPng: () => string | null;
  limpar: () => void;
};

/**
 * Quadro de assinatura à mão: funciona com dedo, caneta e mouse.
 * O traço é opcional — quem preferir assina só com o nome digitado.
 */
export const QuadroDeAssinatura = forwardRef<QuadroHandle>(function QuadroDeAssinatura(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [temTraco, setTemTraco] = useState(false);

  // O canvas é dimensionado em pixels reais do dispositivo para o traço não sair borrado.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ajustar = () => {
      const escala = window.devicePixelRatio || 1;
      const largura = canvas.clientWidth;
      const altura = canvas.clientHeight;
      canvas.width = largura * escala;
      canvas.height = altura * escala;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(escala, escala);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#191918';
    };

    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, []);

  useImperativeHandle(ref, () => ({
    temTraco: () => temTraco,
    paraPng: () => canvasRef.current?.toDataURL('image/png') ?? null,
    limpar: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setTemTraco(false);
    },
  }), [temTraco]);

  function ponto(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function comecar(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    desenhando.current = true;
    const p = ponto(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = ponto(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!temTraco) setTemTraco(true);
  }

  function parar() {
    desenhando.current = false;
  }

  function limpar() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTemTraco(false);
  }

  return (
    <div className="mt-1">
      <canvas
        ref={canvasRef}
        onPointerDown={comecar}
        onPointerMove={mover}
        onPointerUp={parar}
        onPointerLeave={parar}
        className="h-32 w-full touch-none rounded-lg border border-dashed border-black/20 bg-white"
      />
      <button
        type="button"
        onClick={limpar}
        className="mt-1 font-label text-[10px] uppercase tracking-wider text-neutral-500 underline decoration-dotted hover:text-primary"
      >
        Limpar traço
      </button>
    </div>
  );
});
