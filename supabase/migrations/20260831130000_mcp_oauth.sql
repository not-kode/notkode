-- OAuth do servidor MCP.
--
-- Antes, ligar o terminal ao CRM exigia gerar um token na tela e mandar o valor
-- para a pessoa por fora. Agora ela só informa o endereço do servidor: o cliente
-- MCP descobre sozinho onde autenticar, o navegador abre no login do /admin e
-- ela confirma o acesso numa tela. O token nasce dali, sem ninguém copiar nada.
--
-- O site faz os dois papéis do OAuth: é o servidor de autorização (login, tela
-- de consentimento, emissão) e o recurso protegido (/api/mcp).

-- Quem pede acesso: o Claude Code e afins se cadastram sozinhos, sem ninguém
-- criar cliente à mão (Dynamic Client Registration, RFC 7591). São clientes
-- públicos: não têm segredo, e por isso o PKCE é obrigatório na troca do código.
create table if not exists public.oauth_clients (
  client_id text primary key,
  nome text,
  -- Para onde o navegador pode voltar depois da autorização. Conferido inteiro,
  -- sem casamento por prefixo: é o que impede mandarem a pessoa para outro site.
  redirect_uris text[] not null,
  criado_em timestamptz not null default now()
);

comment on table public.oauth_clients is
  'Clientes MCP que se registraram sozinhos para pedir acesso ao CRM. Público, sem segredo: a segurança está no PKCE e no redirect_uri exato.';

-- O código que a tela de consentimento devolve, válido por poucos minutos e uma
-- vez só. Guarda o desafio do PKCE para conferir na hora de trocar por token.
create table if not exists public.oauth_codes (
  code_hash text primary key,
  client_id text not null references public.oauth_clients (client_id) on delete cascade,
  admin_user_id uuid not null references public.admin_users (id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  -- Para qual servidor o token está sendo pedido (RFC 8707). Confere com o
  -- pedido do token para o token não valer em outro lugar.
  resource text,
  expira_em timestamptz not null,
  usado_em timestamptz,
  criado_em timestamptz not null default now()
);

comment on table public.oauth_codes is
  'Códigos de autorização em trânsito, de vida curta. Trocado por token uma única vez; o valor fica em hash.';

create index if not exists oauth_codes_limpeza on public.oauth_codes (expira_em);

alter table public.oauth_clients enable row level security;
alter table public.oauth_codes enable row level security;
-- Sem policy: quem lê e escreve é só o service-role do servidor.

-- O token emitido pelo OAuth mora na mesma tabela do token gerado à mão: para
-- quem olha a tela de acessos, os dois são "o terminal da pessoa", e revogar
-- funciona igual nos dois casos.
alter table public.mcp_tokens
  add column if not exists origem text not null default 'manual'
    check (origem in ('manual', 'oauth')),
  add column if not exists client_id text references public.oauth_clients (client_id) on delete set null;

comment on column public.mcp_tokens.origem is
  'manual = gerado na tela de acessos e copiado à mão; oauth = emitido para um cliente MCP depois da tela de autorização.';

-- Um token manual por pessoa continua valendo, mas o limite não alcança o
-- OAuth: cada aparelho que a pessoa autoriza ganha o seu, e ela pode ter o
-- notebook e o computador de casa ligados ao mesmo tempo.
drop index if exists mcp_tokens_um_ativo_por_pessoa;
create unique index if not exists mcp_tokens_um_manual_por_pessoa
  on public.mcp_tokens (admin_user_id)
  where revogado_em is null and origem = 'manual';
