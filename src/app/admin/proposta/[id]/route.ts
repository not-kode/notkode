import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { mimeDaProposta } from '@/lib/proposta-mime';

// Abre a proposta anexada a um contrato (bucket privado 'propostas').
// Protegida pelo middleware do /admin (exige login).
// Serve o arquivo aqui em vez de redirecionar para a URL assinada: o storage
// devolve o tipo gravado no upload, e as propostas já anexadas vieram com tipo
// genérico — o navegador mostrava o HTML como texto, com os acentos quebrados.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: eng } = await supabase
    .from('engagements')
    .select('proposal_path')
    .eq('id', id)
    .single();

  if (!eng?.proposal_path) {
    return new NextResponse('Proposta não encontrada.', { status: 404 });
  }

  const { data, error } = await supabase.storage.from('propostas').download(eng.proposal_path);

  if (error || !data) {
    return new NextResponse('Não foi possível abrir a proposta.', { status: 500 });
  }

  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      'Content-Type': mimeDaProposta(eng.proposal_path),
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
    },
  });
}
