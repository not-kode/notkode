import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { acharPorToken } from '@/lib/assinatura/servico';
import { origemDaRequisicao, registrarEvento, linkDeVerificacao } from '@/lib/assinatura/nucleo';
import { PainelDeAssinatura } from './painel';

// Página pública de assinatura, aberta por link com token e sem login.

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Assinar documento',
  robots: { index: false, follow: false },
};

export default async function AssinarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const achado = await acharPorToken(token);

  // Token inválido ou revogado: 404 seco, sem dizer se já existiu.
  if (!achado) notFound();

  const { signer, request } = achado;
  const { ip, userAgent } = origemDaRequisicao(await headers());
  await registrarEvento(request.id, 'aberto', { signerId: signer.id, ip, userAgent });

  return (
    <PainelDeAssinatura
      token={token}
      titulo={request.titulo ?? 'Documento'}
      nome={signer.nome}
      email={signer.email}
      papel={signer.papel}
      documentoUrl={`/assinar/${token}/documento`}
      jaAssinou={signer.status === 'assinado'}
      encerrado={request.status !== 'enviado'}
      statusDoPedido={request.status}
      linkVerificacao={linkDeVerificacao(request.codigo)}
    />
  );
}
