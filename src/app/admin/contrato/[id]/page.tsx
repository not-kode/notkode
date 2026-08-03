import { notFound } from 'next/navigation';
import { PrintButton } from './print-button';
import { carregarContrato, dataPorExtenso } from '@/lib/contrato/dados';
import { CONTRATO_CSS, contratoHtml, dadosQueFaltam } from '../documento';

export const dynamic = 'force-dynamic';

export default async function ContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dados = await carregarContrato(id);
  if (!dados) notFound();

  const { eng, parcelas } = dados;
  const missing = dadosQueFaltam(eng.organizations);
  const html = contratoHtml({ eng, parcelas, dataDoDocumento: dataPorExtenso() });

  return (
    <div className="doc">
      <style>{CONTRATO_CSS}</style>
      <PrintButton />

      {missing.length > 0 && (
        <div className="no-print alert" style={{ maxWidth: 780, margin: '0 auto' }}>
          Faltam dados cadastrais deste cliente: <strong>{missing.join(', ')}</strong>. Preencha no cliente antes de assinar.
        </div>
      )}

      {/* O documento é gerado como HTML para ser idêntico ao que vai congelado
          para assinatura; todo dado do banco é escapado em contratoHtml. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
