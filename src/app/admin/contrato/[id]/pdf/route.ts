import { NextResponse } from 'next/server';
import { carregarContrato, dataPorExtenso } from '@/lib/contrato/dados';
import { CONTRATO_CSS, contratoHtml } from '../../documento';
import { documentoEmPdf, nomeDoArquivo } from '@/lib/assinatura/pdf';
import { paginaHtml } from '@/lib/assinatura/nucleo';

// PDF do contrato como ele está agora, para anexar em e-mail ou guardar.
// Protegida pelo middleware do /admin. É o mesmo documento da tela: não
// substitui o congelado da assinatura, que é o único que o hash protege.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dados = await carregarContrato(id);
  if (!dados) return new NextResponse('Contrato não encontrado.', { status: 404 });

  const titulo = `Contrato ${dados.eng.title ?? ''}`.trim();
  const html = paginaHtml(
    titulo,
    contratoHtml({
      eng: dados.eng,
      parcelas: dados.parcelas,
      modelo: dados.modelo,
      dataDoDocumento: dataPorExtenso(),
    }),
    CONTRATO_CSS,
  );

  const pdf = await documentoEmPdf(html);
  if (!pdf) return new NextResponse('Não foi possível gerar o PDF agora.', { status: 503 });

  return new NextResponse(pdf as unknown as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nomeDoArquivo(titulo).replace('-assinado', '')}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
