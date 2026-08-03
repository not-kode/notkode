import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { acharPorCodigo } from '@/lib/assinatura/servico';
import { BUCKET } from '@/lib/assinatura/nucleo';

// O token de carimbo de tempo, como veio da autoridade. Serve para conferência
// por fora do sistema, por exemplo:
//   openssl ts -reply -in carimbo.tsr -text
export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const achado = await acharPorCodigo(codigo);
  if (!achado?.request.carimbo_path) {
    return new NextResponse('Este documento não tem carimbo de tempo.', { status: 404 });
  }

  const { data } = await getSupabaseAdmin().storage.from(BUCKET).download(achado.request.carimbo_path);
  if (!data) return new NextResponse('Não foi possível abrir o carimbo.', { status: 500 });

  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      'Content-Type': 'application/timestamp-reply',
      'Content-Disposition': `attachment; filename="carimbo-${achado.request.codigo}.tsr"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
