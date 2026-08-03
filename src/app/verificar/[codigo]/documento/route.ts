import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { acharPorCodigo } from '@/lib/assinatura/servico';
import { BUCKET } from '@/lib/assinatura/nucleo';

// O documento assinado, aberto pelo código público de verificação. Só existe
// depois que todas as partes assinaram: antes disso, não há o que verificar.
export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const achado = await acharPorCodigo(codigo);
  if (!achado) return new NextResponse('Documento não encontrado.', { status: 404 });

  const caminho = achado.request.assinado_path;
  if (!caminho || achado.request.status !== 'assinado') {
    return new NextResponse('Este documento ainda não foi assinado por todas as partes.', { status: 404 });
  }

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
