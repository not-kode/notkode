import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Abre a proposta anexada a um NEGÓCIO (pipeline) via URL assinada (bucket privado).
// Protegida pelo middleware do /admin (exige login).
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

  const { data, error } = await supabase.storage
    .from('propostas')
    .createSignedUrl(deal.proposal_path, 60);

  if (error || !data) {
    return new NextResponse('Não foi possível gerar o link da proposta.', { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
