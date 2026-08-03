// As operações da assinatura, do envio até a conclusão.
// Toda escrita passa por aqui para a trilha de auditoria não depender de quem chamou.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  BUCKET, codigoDeAcesso, codigoDeVerificacao, congelarContrato, paginaHtml,
  registrarEvento, sha256, tokenSecreto, type Papel,
} from './nucleo';
import { FOLHA_CSS, folhaDeAssinaturasHtml, type SignerAssinado } from './folha';
import { enviarCodigo, enviarConvite, enviarCopiaFinal, enviarReciboDeAssinatura, avisarInterno } from './emails';

const OTP_VALIDADE_MIN = 15;
const OTP_MAX_TENTATIVAS = 5;

export type Request = {
  id: string; created_at: string; engagement_id: string; organization_id: string | null;
  titulo: string | null; documento_path: string; documento_hash: string; codigo: string;
  status: string; expires_at: string | null; completed_at: string | null;
  assinado_path: string | null; assinado_hash: string | null;
};
export type Signer = {
  id: string; request_id: string; nome: string; email: string; documento: string | null;
  papel: Papel; ordem: number; token: string; otp_hash: string | null; otp_expires_at: string | null;
  otp_tentativas: number; otp_enviado_em: string | null; status: string;
  assinatura_nome: string | null; assinatura_imagem: string | null;
  assinado_em: string | null; assinado_ip: string | null; assinado_user_agent: string | null;
  recusado_em: string | null; recusa_motivo: string | null;
};

export type NovoSignatario = { nome: string; email: string; documento?: string | null; papel: Papel };

/**
 * Congela o contrato, cria o pedido e os signatários e dispara os convites.
 * Um contrato pode ter só um pedido em aberto: o anterior é cancelado antes.
 */
export async function criarPedido(
  engagementId: string,
  signatarios: NovoSignatario[],
  origem: { ip?: string | null; userAgent?: string | null } = {},
): Promise<{ ok: true; requestId: string; codigo: string; falhas: string[] } | { ok: false; erro: string }> {
  if (signatarios.length === 0) return { ok: false, erro: 'Informe ao menos um signatário.' };
  const semEmail = signatarios.find((s) => !s.email?.includes('@') || !s.nome?.trim());
  if (semEmail) return { ok: false, erro: 'Todo signatário precisa de nome e e-mail válido.' };

  const congelado = await congelarContrato(engagementId);
  if (!congelado) return { ok: false, erro: 'Contrato não encontrado.' };

  const db = getSupabaseAdmin();

  const { data: engRow } = await db
    .from('engagements')
    .select('organization_id')
    .eq('id', engagementId)
    .maybeSingle();

  await cancelarPedidosAbertos(engagementId, 'substituído por um novo envio');

  const codigo = codigoDeVerificacao();
  const documentoPath = `${engagementId}/${Date.now()}-documento.html`;

  const { error: upErro } = await db.storage.from(BUCKET).upload(
    documentoPath,
    new Blob([congelado.html], { type: 'text/html; charset=utf-8' }),
    { contentType: 'text/html; charset=utf-8', upsert: false },
  );
  if (upErro) return { ok: false, erro: `Não deu para guardar o documento: ${upErro.message}` };

  const { data: pedido, error } = await db
    .from('signature_requests')
    .insert({
      engagement_id: engagementId,
      organization_id: engRow?.organization_id ?? null,
      titulo: congelado.titulo,
      documento_path: documentoPath,
      documento_hash: congelado.hash,
      codigo,
      status: 'enviado',
    })
    .select('id')
    .single();

  if (error || !pedido) {
    await db.storage.from(BUCKET).remove([documentoPath]);
    return { ok: false, erro: `Não deu para criar o pedido: ${error?.message ?? 'erro desconhecido'}` };
  }

  const linhas = signatarios.map((s, i) => ({
    request_id: pedido.id,
    nome: s.nome.trim(),
    email: s.email.trim().toLowerCase(),
    documento: s.documento?.trim() || null,
    papel: s.papel,
    ordem: i + 1,
    token: tokenSecreto(),
  }));

  const { data: criados, error: erroSigners } = await db
    .from('signature_signers')
    .insert(linhas)
    .select('id, nome, email, token');

  if (erroSigners || !criados) {
    await db.from('signature_requests').delete().eq('id', pedido.id);
    await db.storage.from(BUCKET).remove([documentoPath]);
    return { ok: false, erro: `Não deu para criar os signatários: ${erroSigners?.message ?? 'erro desconhecido'}` };
  }

  await registrarEvento(pedido.id, 'criado', {
    ip: origem.ip, userAgent: origem.userAgent,
    detalhe: { hash: congelado.hash, signatarios: linhas.length },
  });

  const falhas: string[] = [];
  for (const s of criados as { id: string; nome: string; email: string; token: string }[]) {
    const erroEnvio = await enviarConvite({
      para: s.email, nome: s.nome, titulo: congelado.titulo, token: s.token,
    });
    if (erroEnvio) falhas.push(`${s.email}: ${erroEnvio}`);
    else await registrarEvento(pedido.id, 'enviado', { signerId: s.id, detalhe: { email: s.email } });
  }

  return { ok: true, requestId: pedido.id, codigo, falhas };
}

/** Fecha pedidos que ainda estavam em aberto para o mesmo contrato. */
export async function cancelarPedidosAbertos(engagementId: string, motivo: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { data: abertos } = await db
    .from('signature_requests')
    .select('id')
    .eq('engagement_id', engagementId)
    .eq('status', 'enviado');

  for (const p of (abertos ?? []) as { id: string }[]) {
    await db.from('signature_requests')
      .update({ status: 'cancelado', updated_at: new Date().toISOString() })
      .eq('id', p.id);
    await registrarEvento(p.id, 'cancelado', { detalhe: { motivo } });
  }
}

export async function cancelarPedido(requestId: string, motivo: string): Promise<void> {
  const db = getSupabaseAdmin();
  await db.from('signature_requests')
    .update({ status: 'cancelado', updated_at: new Date().toISOString() })
    .eq('id', requestId);
  await registrarEvento(requestId, 'cancelado', { detalhe: { motivo } });
}

/** O signatário e o pedido dele, a partir do token do link. */
export async function acharPorToken(token: string): Promise<{ signer: Signer; request: Request } | null> {
  const db = getSupabaseAdmin();
  const { data: signer } = await db.from('signature_signers').select('*').eq('token', token).maybeSingle();
  if (!signer) return null;

  const { data: request } = await db
    .from('signature_requests').select('*').eq('id', (signer as Signer).request_id).maybeSingle();
  if (!request) return null;

  return { signer: signer as Signer, request: request as Request };
}

/** Gera e manda o código de 6 dígitos para o e-mail do signatário. */
export async function enviarCodigoDeAcesso(
  token: string,
  origem: { ip?: string | null; userAgent?: string | null } = {},
): Promise<{ ok: boolean; erro?: string }> {
  const achado = await acharPorToken(token);
  if (!achado) return { ok: false, erro: 'Link inválido.' };

  const { signer, request } = achado;
  if (request.status !== 'enviado') return { ok: false, erro: 'Este documento não está mais aberto para assinatura.' };
  if (signer.status === 'assinado') return { ok: false, erro: 'Você já assinou este documento.' };

  const codigo = codigoDeAcesso();
  const db = getSupabaseAdmin();

  await db.from('signature_signers').update({
    otp_hash: await sha256(codigo),
    otp_expires_at: new Date(Date.now() + OTP_VALIDADE_MIN * 60_000).toISOString(),
    otp_tentativas: 0,
    otp_enviado_em: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', signer.id);

  const erro = await enviarCodigo({
    para: signer.email, nome: signer.nome, codigo, titulo: request.titulo ?? 'Documento',
  });
  if (erro) return { ok: false, erro: 'Não conseguimos enviar o código agora. Tente de novo em instantes.' };

  await registrarEvento(request.id, 'otp_enviado', {
    signerId: signer.id, ip: origem.ip, userAgent: origem.userAgent,
  });
  return { ok: true };
}

/**
 * Confere o código e registra a assinatura. Quando é o último signatário, monta
 * o documento final com a folha de assinaturas e manda a cópia para todos.
 */
export async function assinar(opcoes: {
  token: string;
  codigo: string;
  assinaturaNome: string;
  assinaturaImagem: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{ ok: true; codigoVerificacao: string } | { ok: false; erro: string }> {
  const achado = await acharPorToken(opcoes.token);
  if (!achado) return { ok: false, erro: 'Link inválido.' };

  const { signer, request } = achado;
  if (request.status !== 'enviado') return { ok: false, erro: 'Este documento não está mais aberto para assinatura.' };
  if (signer.status === 'assinado') return { ok: false, erro: 'Você já assinou este documento.' };
  if (!signer.otp_hash || !signer.otp_expires_at) return { ok: false, erro: 'Peça um código antes de assinar.' };
  if (new Date(signer.otp_expires_at).getTime() < Date.now()) return { ok: false, erro: 'O código expirou. Peça um novo.' };
  if (signer.otp_tentativas >= OTP_MAX_TENTATIVAS) return { ok: false, erro: 'Muitas tentativas. Peça um código novo.' };
  if (!opcoes.assinaturaNome.trim()) return { ok: false, erro: 'Escreva seu nome completo para assinar.' };

  const db = getSupabaseAdmin();

  if (await sha256(opcoes.codigo.trim()) !== signer.otp_hash) {
    await db.from('signature_signers')
      .update({ otp_tentativas: signer.otp_tentativas + 1, updated_at: new Date().toISOString() })
      .eq('id', signer.id);
    await registrarEvento(request.id, 'otp_falhou', {
      signerId: signer.id, ip: opcoes.ip, userAgent: opcoes.userAgent,
      detalhe: { tentativa: signer.otp_tentativas + 1 },
    });
    return { ok: false, erro: 'Código incorreto.' };
  }

  await registrarEvento(request.id, 'otp_validado', {
    signerId: signer.id, ip: opcoes.ip, userAgent: opcoes.userAgent,
  });

  const agora = new Date().toISOString();
  await db.from('signature_signers').update({
    status: 'assinado',
    assinatura_nome: opcoes.assinaturaNome.trim(),
    assinatura_imagem: opcoes.assinaturaImagem,
    assinado_em: agora,
    assinado_ip: opcoes.ip ?? null,
    assinado_user_agent: opcoes.userAgent ?? null,
    otp_hash: null,
    otp_expires_at: null,
    updated_at: agora,
  }).eq('id', signer.id);

  await registrarEvento(request.id, 'assinado', {
    signerId: signer.id, ip: opcoes.ip, userAgent: opcoes.userAgent,
    detalhe: { nome: signer.nome, email: signer.email },
  });

  const { data: todos } = await db
    .from('signature_signers').select('*').eq('request_id', request.id).order('ordem');
  const pendentes = ((todos ?? []) as Signer[]).filter((s) => s.status !== 'assinado');

  // Recibo na hora para quem assinou: entre a primeira assinatura e a última
  // pode levar dias, e o registro do ato precisa chegar na mesma hora.
  await enviarReciboDeAssinatura({
    para: signer.email,
    nome: signer.nome,
    titulo: request.titulo ?? 'Documento',
    codigo: request.codigo,
    hash: request.documento_hash,
    quando: agora,
    ip: opcoes.ip ?? null,
    dispositivo: opcoes.userAgent ?? null,
    faltam: pendentes.length,
  });
  await avisarInterno(
    `Assinou: ${signer.nome} · ${request.titulo ?? 'Documento'}`,
    `${signer.nome} (${signer.email}) assinou em ${agora}, IP ${opcoes.ip ?? '—'}. `
    + (pendentes.length ? `Faltam ${pendentes.length}.` : 'Era o último signatário.'),
  );

  if (pendentes.length === 0) await concluir(request, (todos ?? []) as Signer[]);

  return { ok: true, codigoVerificacao: request.codigo };
}

/** Monta o documento final, guarda e avisa todo mundo. */
async function concluir(request: Request, signatarios: Signer[]): Promise<void> {
  const db = getSupabaseAdmin();
  const agora = new Date().toISOString();

  const { data: baixado } = await db.storage.from(BUCKET).download(request.documento_path);
  if (!baixado) {
    console.error('[assinatura] documento congelado não encontrado:', request.documento_path);
    return;
  }
  const original = await baixado.text();

  const folha = folhaDeAssinaturasHtml({
    titulo: request.titulo ?? 'Documento',
    codigo: request.codigo,
    documentoHash: request.documento_hash,
    criadoEm: request.created_at,
    concluidoEm: agora,
    signatarios: signatarios as unknown as SignerAssinado[],
  });

  // O miolo é o congelado, palavra por palavra: só entra a folha no fim.
  const corpo = original
    .replace(/^[\s\S]*?<div class="doc">/, '')
    .replace(/<\/div>\s*<\/body>[\s\S]*$/, '');
  const finalHtml = paginaHtml(`${request.titulo ?? 'Documento'} (assinado)`, corpo + folha, FOLHA_CSS);

  const assinadoPath = request.documento_path.replace(/-documento\.html$/, '-assinado.html');
  await db.storage.from(BUCKET).upload(
    assinadoPath,
    new Blob([finalHtml], { type: 'text/html; charset=utf-8' }),
    { contentType: 'text/html; charset=utf-8', upsert: true },
  );

  await db.from('signature_requests').update({
    status: 'assinado',
    completed_at: agora,
    assinado_path: assinadoPath,
    assinado_hash: await sha256(finalHtml),
    updated_at: agora,
  }).eq('id', request.id);

  await registrarEvento(request.id, 'concluido', { detalhe: { signatarios: signatarios.length } });

  const atos = signatarios.map((s) => ({
    nome: s.nome, email: s.email, quando: s.assinado_em, ip: s.assinado_ip, dispositivo: s.assinado_user_agent,
  }));
  for (const s of signatarios) {
    await enviarCopiaFinal({
      para: s.email, nome: s.nome,
      titulo: request.titulo ?? 'Documento',
      codigo: request.codigo,
      hash: request.documento_hash,
      atos,
    });
  }
  await avisarInterno(
    `Assinado: ${request.titulo ?? 'Documento'}`,
    `Todos os signatários assinaram. Verificação: ${request.codigo}`,
  );
}

/** Registra a recusa e encerra o pedido. */
export async function recusar(opcoes: {
  token: string; motivo: string; ip?: string | null; userAgent?: string | null;
}): Promise<{ ok: boolean; erro?: string }> {
  const achado = await acharPorToken(opcoes.token);
  if (!achado) return { ok: false, erro: 'Link inválido.' };
  const { signer, request } = achado;
  if (request.status !== 'enviado') return { ok: false, erro: 'Este documento não está mais aberto.' };

  const db = getSupabaseAdmin();
  const agora = new Date().toISOString();
  await db.from('signature_signers').update({
    status: 'recusado', recusado_em: agora, recusa_motivo: opcoes.motivo.trim() || null, updated_at: agora,
  }).eq('id', signer.id);
  await db.from('signature_requests').update({ status: 'cancelado', updated_at: agora }).eq('id', request.id);

  await registrarEvento(request.id, 'recusado', {
    signerId: signer.id, ip: opcoes.ip, userAgent: opcoes.userAgent,
    detalhe: { motivo: opcoes.motivo },
  });
  await avisarInterno(
    `Assinatura recusada: ${request.titulo ?? 'Documento'}`,
    `${signer.nome} (${signer.email}) recusou. Motivo: ${opcoes.motivo || 'não informado'}`,
  );
  return { ok: true };
}

/** O pedido pelo código público, para a página de verificação. */
export async function acharPorCodigo(codigo: string): Promise<{ request: Request; signatarios: Signer[] } | null> {
  const db = getSupabaseAdmin();
  const { data: request } = await db
    .from('signature_requests').select('*').eq('codigo', codigo.trim().toUpperCase()).maybeSingle();
  if (!request) return null;

  const { data: signatarios } = await db
    .from('signature_signers').select('*').eq('request_id', (request as Request).id).order('ordem');

  return { request: request as Request, signatarios: (signatarios ?? []) as Signer[] };
}

/** O pedido em aberto (ou o último concluído) de um contrato, para a tela do admin. */
export async function pedidoDoContrato(engagementId: string): Promise<{ request: Request; signatarios: Signer[] } | null> {
  const db = getSupabaseAdmin();
  const { data: pedidos } = await db
    .from('signature_requests')
    .select('*')
    .eq('engagement_id', engagementId)
    .in('status', ['enviado', 'assinado'])
    .order('created_at', { ascending: false })
    .limit(1);

  const request = ((pedidos ?? []) as Request[])[0];
  if (!request) return null;

  const { data: signatarios } = await db
    .from('signature_signers').select('*').eq('request_id', request.id).order('ordem');

  return { request, signatarios: (signatarios ?? []) as Signer[] };
}

/** Confere se o arquivo guardado ainda bate com o hash registrado no envio. */
export async function conferirIntegridade(request: Request): Promise<boolean> {
  const { data } = await getSupabaseAdmin().storage.from(BUCKET).download(request.documento_path);
  if (!data) return false;
  return (await sha256(await data.text())) === request.documento_hash;
}
