// Metadata do servidor de autorização (RFC 8414). Servida em
// /.well-known/oauth-authorization-server pelos rewrites do next.config.
//
// Diz ao cliente onde mandar a pessoa para autorizar, onde trocar o código por
// token e como se cadastrar sozinho.

import { NextResponse } from 'next/server';
import { metadataDoServidor } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

const cabecalhos = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=3600',
};

export async function GET() {
  return NextResponse.json(metadataDoServidor(), { headers: cabecalhos });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...cabecalhos, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': '*' },
  });
}
