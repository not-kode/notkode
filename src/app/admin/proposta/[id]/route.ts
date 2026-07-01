import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Abre a proposta anexada a um contrato via URL assinada (bucket privado).
// Protegida pelo middleware do /admin (exige login).
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

  const { data, error } = await supabase.storage
    .from('propostas')
    .createSignedUrl(eng.proposal_path, 60);

  if (error || !data) {
    return new NextResponse('Não foi possível gerar o link da proposta.', { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
