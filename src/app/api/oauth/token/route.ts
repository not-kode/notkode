// Troca o código de autorização pelo token de acesso ao MCP.
//
// Chega aqui o cliente, não o navegador: a pessoa já disse "sim" na tela e
// aquele "sim" virou um código de vida curta. Este endpoint confere o código, o
// PKCE e o endereço de volta, e devolve o token que vale no /api/mcp.
//
// O token não expira, igual ao que a tela de acessos gera à mão: quem corta é a
// pessoa, revogando em /admin/usuarios (ou sendo desativada no CRM, o que
// derruba os tokens dela junto). É uma escolha consciente, para o time não ser
// desconectado no meio do trabalho por um refresh que falhou.

import { NextResponse } from 'next/server';
import { limparCodigosVelhos, resgatarCodigo } from '@/lib/oauth';
import { criarTokenPara } from '@/lib/mcp-token';

export const dynamic = 'force-dynamic';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const erro = (codigo: string, descricao: string, status = 400) =>
  NextResponse.json({ error: codigo, error_description: descricao }, { status, headers: cors });

export async function POST(req: Request) {
  // O token endpoint fala formulário, não JSON (OAuth 2.1, seção 4.1.3).
  let form: URLSearchParams;
  try {
    form = new URLSearchParams(await req.text());
  } catch {
    return erro('invalid_request', 'Corpo inválido.');
  }

  const campo = (nome: string) => form.get(nome)?.trim() || null;

  if (campo('grant_type') !== 'authorization_code') {
    return erro('unsupported_grant_type', 'Só "authorization_code" por aqui.');
  }

  const code = campo('code');
  const clientId = campo('client_id');
  const redirectUri = campo('redirect_uri');
  const codeVerifier = campo('code_verifier');

  if (!code || !clientId || !redirectUri) return erro('invalid_request', 'Falta code, client_id ou redirect_uri.');
  if (!codeVerifier) return erro('invalid_request', 'Falta o code_verifier: o PKCE é obrigatório aqui.');

  const resgate = await resgatarCodigo({
    code,
    clientId,
    redirectUri,
    codeVerifier,
    resource: campo('resource'),
  });
  if ('erro' in resgate) return erro(resgate.erro, resgate.descricao);

  const token = await criarTokenPara(resgate.usuarioId, { origem: 'oauth', clientId });
  void limparCodigosVelhos();

  return NextResponse.json(
    { access_token: token, token_type: 'Bearer' },
    { status: 200, headers: { ...cors, 'Cache-Control': 'no-store' } },
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}
