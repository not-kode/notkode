import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { acharPorCodigo } from '@/lib/assinatura/servico';
import { BUCKET } from '@/lib/assinatura/nucleo';
import { documentoEmPdf, nomeDoArquivo } from '@/lib/assinatura/pdf';

// Baixar e abrir o Chromium não cabe nos 10s padrão da função.
export const maxDuration = 60;

// O PDF do documento assinado. Normalmente já foi gerado na conclusão; se
// aquela geração falhou (Chrome fora do ar, por exemplo), gera agora a partir
// do mesmo HTML, para o link nunca ficar quebrado.
export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const achado = await acharPorCodigo(codigo);
  if (!achado) return new NextResponse('Documento não encontrado.', { status: 404 });

  const { request } = achado;
  if (request.status !== 'assinado' || !request.assinado_path) {
    return new NextResponse('Este documento ainda não foi assinado por todas as partes.', { status: 404 });
  }

  const db = getSupabaseAdmin();
  const nome = nomeDoArquivo(request.titulo ?? 'Documento');

  if (request.assinado_pdf_path) {
    const { data } = await db.storage.from(BUCKET).download(request.assinado_pdf_path);
    if (data) return respostaPdf(await data.arrayBuffer(), nome);
  }

  const { data: html } = await db.storage.from(BUCKET).download(request.assinado_path);
  if (!html) return new NextResponse('Não foi possível abrir o documento.', { status: 500 });

  const pdf = await documentoEmPdf(await html.text());
  if (!pdf) return new NextResponse('Não foi possível gerar o PDF agora.', { status: 503 });

  // Guarda para a próxima vez não precisar renderizar de novo.
  const caminho = request.assinado_path.replace(/\.html$/, '.pdf');
  await db.storage.from(BUCKET).upload(caminho, new Blob([pdf as BlobPart], { type: 'application/pdf' }), {
    contentType: 'application/pdf', upsert: true,
  });
  await db.from('signature_requests').update({ assinado_pdf_path: caminho }).eq('id', request.id);

  return respostaPdf(pdf as unknown as ArrayBuffer, nome);
}

function respostaPdf(corpo: ArrayBuffer, nome: string) {
  return new NextResponse(corpo, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nome}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
