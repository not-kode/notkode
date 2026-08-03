import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { acharPorToken } from '@/lib/assinatura/servico';
import { BUCKET } from '@/lib/assinatura/nucleo';

// O documento congelado que o signatário está lendo, servido pelo token do link
// dele. Bucket privado: o arquivo nunca é exposto direto.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const achado = await acharPorToken(token);
  if (!achado) return new NextResponse('Documento não encontrado.', { status: 404 });

  // Depois de tudo assinado, o link do signatário passa a mostrar a versão final.
  const caminho = achado.request.assinado_path ?? achado.request.documento_path;
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(caminho);
  if (error || !data) return new NextResponse('Não foi possível abrir o documento.', { status: 500 });

  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
