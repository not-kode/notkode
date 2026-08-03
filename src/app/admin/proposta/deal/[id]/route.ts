import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { mimeDaProposta } from '@/lib/proposta-mime';

// Abre a proposta anexada a um NEGÓCIO (pipeline), do bucket privado 'propostas'.
// Protegida pelo middleware do /admin (exige login). Serve o arquivo aqui pelo
// mesmo motivo da rota do contrato: o tipo gravado no storage não é confiável.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: deal } = await supabase
    .from('deals')
    .select('proposal_path')
    .eq('id', id)
    .single();

  if (!deal?.proposal_path) {
    return new NextResponse('Proposta não encontrada.', { status: 404 });
  }

  const { data, error } = await supabase.storage.from('propostas').download(deal.proposal_path);

  if (error || !data) {
    return new NextResponse('Não foi possível abrir a proposta.', { status: 500 });
  }

  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      'Content-Type': mimeDaProposta(deal.proposal_path),
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
    },
  });
}
