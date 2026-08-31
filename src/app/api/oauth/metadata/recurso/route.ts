// Metadata do recurso protegido (RFC 9728). Servida em
// /.well-known/oauth-protected-resource pelos rewrites do next.config.
//
// É a primeira coisa que o cliente MCP lê depois de tomar 401: daqui ele
// descobre que quem manda na autorização é o próprio site.

import { NextResponse } from 'next/server';
import { metadataDoRecurso } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

const semCache = {
  // O cliente lê isto antes de ter qualquer credencial: é público de propósito,
  // e o CORS liberado porque alguns clientes buscam do próprio navegador.
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=3600',
};

export async function GET() {
  return NextResponse.json(metadataDoRecurso(), { headers: semCache });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...semCache, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': '*' },
  });
}
