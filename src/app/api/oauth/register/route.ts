// Cadastro do cliente MCP, sem ninguém no meio (RFC 7591).
//
// O Claude Code (ou outro cliente) chega aqui sozinho, na primeira vez que
// alguém aponta para o nosso MCP, e sai com um client_id. Não é acesso ao CRM:
// é só a identidade de quem vai pedir autorização depois, na tela. O acesso de
// verdade só existe quando uma pessoa logada confirma em /admin/autorizar.

import { NextResponse } from 'next/server';
import { redirectValido, registrarCliente } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const erro = (descricao: string, codigo = 'invalid_client_metadata') =>
  NextResponse.json({ error: codigo, error_description: descricao }, { status: 400, headers: cors });

export async function POST(req: Request) {
  let corpo: Record<string, unknown>;
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return erro('Corpo inválido.');
  }

  const uris = Array.isArray(corpo.redirect_uris) ? corpo.redirect_uris.map(String) : [];
  if (!uris.length) return erro('Falta "redirect_uris".', 'invalid_redirect_uri');
  if (!uris.every(redirectValido)) {
    return erro('Endereço de volta precisa ser HTTPS ou localhost, e sem fragmento.', 'invalid_redirect_uri');
  }

  const nome = typeof corpo.client_name === 'string' ? corpo.client_name : null;
  const cliente = await registrarCliente(nome, uris);

  return NextResponse.json(
    {
      client_id: cliente.clientId,
      client_name: cliente.nome,
      redirect_uris: cliente.redirectUris,
      // Cliente público: não emitimos segredo, e o PKCE é que protege a troca.
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code'],
      response_types: ['code'],
      client_id_issued_at: Math.floor(Date.now() / 1000),
    },
    { status: 201, headers: cors },
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}
