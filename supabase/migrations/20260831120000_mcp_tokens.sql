-- Token do MCP por pessoa.
--
-- Até aqui o servidor MCP conferia um único MCP_TOKEN de ambiente: quem tivesse
-- o valor tinha o CRM inteiro, não dava para cortar o acesso de uma pessoa só e
-- o servidor não sabia quem estava do outro lado (toda tarefa criada pelo
-- terminal nascia no nome da Camila). Agora cada acesso do /admin pode ter o
-- seu token, e o que a pessoa faz pelo terminal sai no nome dela.
--
-- O token em si não fica guardado: só o SHA-256 dele. Como token é aleatório e
-- longo, hash simples basta (não é senha de humano, não sofre dicionário) e o
-- servidor acha o dono num índice, sem varrer a tabela.
create table if not exists public.mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_users (id) on delete cascade,
  -- SHA-256 do token em hex minúsculo.
  token_hash text not null unique,
  -- Só para a pessoa se reconhecer na lista ("notebook", "casa").
  apelido text,
  criado_em timestamptz not null default now(),
  ultimo_uso timestamptz,
  revogado_em timestamptz
);

comment on table public.mcp_tokens is
  'Tokens do servidor MCP (/api/mcp), um por pessoa do admin_users. Guarda só o hash: o valor aparece uma vez, na hora de gerar.';

-- Um token valendo por pessoa. Gerar de novo revoga o anterior, então não
-- sobra credencial esquecida por aí; os revogados ficam de histórico.
create unique index if not exists mcp_tokens_um_ativo_por_pessoa
  on public.mcp_tokens (admin_user_id)
  where revogado_em is null;

create index if not exists mcp_tokens_ativos
  on public.mcp_tokens (token_hash)
  where revogado_em is null;

alter table public.mcp_tokens enable row level security;
-- Sem policy: só o service-role do servidor lê e escreve, como em admin_users.
