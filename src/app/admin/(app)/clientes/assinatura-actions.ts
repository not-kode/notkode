'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cancelarPedido, criarPedido, type NovoSignatario } from '@/lib/assinatura/servico';
import { CONTRATADA } from '@/app/admin/contrato/documento';
import { origemDaRequisicao } from '@/lib/assinatura/nucleo';

/** Quem assina pela Notkode. Vai como CONTRATADA em todo contrato. */
const EMAIL_CONTRATADA = process.env.ASSINATURA_EMAIL_CONTRATADA ?? 'camila@notkode.com.br';

export type EnvioResultado = { ok: boolean; erro?: string; aviso?: string };

/**
 * Envia o contrato para assinatura: congela o documento, cria os signatários e
 * dispara os convites. O signatário do cliente vem do formulário; a Notkode
 * entra sempre, para o documento ter as duas assinaturas.
 */
export async function enviarParaAssinatura(formData: FormData): Promise<EnvioResultado> {
  const id = String(formData.get('id') ?? '');
  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const documento = String(formData.get('documento') ?? '').trim();
  if (!id) return { ok: false, erro: 'Contrato não informado.' };
  if (!nome || !email.includes('@')) return { ok: false, erro: 'Preencha nome e e-mail de quem assina pelo cliente.' };

  const signatarios: NovoSignatario[] = [
    { nome, email, documento: documento || null, papel: 'contratante' },
    { nome: CONTRATADA.rep, email: EMAIL_CONTRATADA, documento: CONTRATADA.cpf, papel: 'contratada' },
  ];

  const { ip, userAgent } = origemDaRequisicao(await headers());
  const r = await criarPedido(id, signatarios, { ip, userAgent });
  revalidatePath('/admin/clientes');

  if (!r.ok) return { ok: false, erro: r.erro };
  return {
    ok: true,
    aviso: r.falhas.length ? `Enviado, mas houve falha de e-mail: ${r.falhas.join('; ')}` : undefined,
  };
}

/** Cancela o pedido em aberto (por exemplo, para corrigir o contrato e reenviar). */
export async function cancelarAssinatura(formData: FormData): Promise<EnvioResultado> {
  const requestId = String(formData.get('request_id') ?? '');
  if (!requestId) return { ok: false, erro: 'Pedido não informado.' };
  await cancelarPedido(requestId, 'cancelado no admin');
  revalidatePath('/admin/clientes');
  return { ok: true };
}

/** Reenvia o convite para quem ainda não assinou. */
export async function reenviarConvite(formData: FormData): Promise<EnvioResultado> {
  const signerId = String(formData.get('signer_id') ?? '');
  if (!signerId) return { ok: false, erro: 'Signatário não informado.' };

  const db = getSupabaseAdmin();
  const { data: signer } = await db
    .from('signature_signers')
    .select('id, nome, email, token, status, request_id')
    .eq('id', signerId)
    .maybeSingle();
  if (!signer) return { ok: false, erro: 'Signatário não encontrado.' };
  if (signer.status === 'assinado') return { ok: false, erro: 'Essa pessoa já assinou.' };

  const { data: req } = await db
    .from('signature_requests').select('titulo, status').eq('id', signer.request_id).maybeSingle();
  if (!req || req.status !== 'enviado') return { ok: false, erro: 'Este pedido não está mais aberto.' };

  const { enviarConvite } = await import('@/lib/assinatura/emails');
  const erro = await enviarConvite({
    para: signer.email, nome: signer.nome, titulo: req.titulo ?? 'Documento', token: signer.token,
  });
  if (erro) return { ok: false, erro: `Não deu para reenviar: ${erro}` };

  const { registrarEvento } = await import('@/lib/assinatura/nucleo');
  await registrarEvento(signer.request_id, 'enviado', {
    signerId: signer.id, detalhe: { email: signer.email, reenvio: true },
  });
  return { ok: true };
}
