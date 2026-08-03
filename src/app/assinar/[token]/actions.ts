'use server';

import { headers } from 'next/headers';
import { assinar, enviarCodigoDeAcesso, recusar } from '@/lib/assinatura/servico';
import { origemDaRequisicao } from '@/lib/assinatura/nucleo';

export type Resultado = { ok: boolean; erro?: string };

export async function pedirCodigo(token: string): Promise<Resultado> {
  const { ip, userAgent } = origemDaRequisicao(await headers());
  return enviarCodigoDeAcesso(token, { ip, userAgent });
}

export async function assinarDocumento(dados: {
  token: string;
  codigo: string;
  nome: string;
  traco: string | null;
}): Promise<Resultado> {
  const { ip, userAgent } = origemDaRequisicao(await headers());
  const r = await assinar({
    token: dados.token,
    codigo: dados.codigo,
    assinaturaNome: dados.nome,
    // Traço muito grande é sinal de imagem colada, não de assinatura à mão.
    assinaturaImagem: dados.traco && dados.traco.length < 400_000 ? dados.traco : null,
    ip,
    userAgent,
  });
  return r.ok ? { ok: true } : { ok: false, erro: r.erro };
}

export async function recusarDocumento(token: string, motivo: string): Promise<Resultado> {
  const { ip, userAgent } = origemDaRequisicao(await headers());
  return recusar({ token, motivo, ip, userAgent });
}
