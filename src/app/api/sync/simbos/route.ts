// Gatilho de tempo da sincronização com o SimbOS. A lógica está em
// src/lib/simbos-sync.ts, porque o botão da tela chama a mesma coisa.
//
// Roda de 10 em 10 minutos pelo cron da Vercel (ver vercel.json). É esse
// intervalo que define o atraso máximo do sentido SimbOS → sistema; o sentido
// contrário é imediato, feito dentro da própria ação.

import { NextResponse } from 'next/server';
import { sincronizarComSimbos } from '@/lib/simbos-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function executar(request: Request) {
  const segredo = process.env.SYNC_SECRET;
  if (segredo) {
    const autorizado =
      request.headers.get('x-vercel-cron') !== null ||
      request.headers.get('authorization') === `Bearer ${segredo}`;
    if (!autorizado) return NextResponse.json({ ok: false }, { status: 401 });
  }

  const r = await sincronizarComSimbos();
  return NextResponse.json(r, { status: r.ok ? 200 : 502 });
}

export async function GET(request: Request) {
  return executar(request);
}
export async function POST(request: Request) {
  return executar(request);
}
