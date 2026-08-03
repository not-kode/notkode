import { NextResponse } from 'next/server';
import { carregarContrato, dataPorExtenso } from '@/lib/contrato/dados';
import { contratoHtml } from '../../documento';
import { gerarPdf, nomeDoArquivo } from '@/lib/assinatura/pdf';
import { paginaHtml } from '@/lib/assinatura/nucleo';

// Baixar e abrir o Chromium não cabe nos 10s padrão da função.
export const maxDuration = 60;

// PDF do contrato como ele está agora, para anexar em e-mail ou guardar.
// Protegida pelo middleware do /admin. É o mesmo documento da tela: não
// substitui o congelado da assinatura, que é o único que o hash protege.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dados = await carregarContrato(id);
  if (!dados) return new NextResponse('Contrato não encontrado.', { status: 404 });

  const titulo = `Contrato ${dados.eng.title ?? ''}`.trim();
  // paginaHtml já embute o CSS do contrato.
  const html = paginaHtml(
    titulo,
    contratoHtml({
      eng: dados.eng,
      parcelas: dados.parcelas,
      modelo: dados.modelo,
      dataDoDocumento: dataPorExtenso(),
    }),
  );

  const { pdf, erro } = await gerarPdf(html);
  if (!pdf) return new NextResponse(`Não foi possível gerar o PDF agora.\n\n${erro ?? ''}`, { status: 503 });

  return new NextResponse(pdf as unknown as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nomeDoArquivo(titulo).replace('-assinado', '')}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
