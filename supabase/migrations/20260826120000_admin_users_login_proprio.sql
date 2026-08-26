-- Quem entra no /admin. Até aqui o acesso era uma senha única compartilhada
-- (ADMIN_PASSWORD): ninguém sabia quem tinha feito o quê. Agora cada pessoa tem
-- nome, e-mail e senha próprios.
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  -- PBKDF2-SHA256, formato "pbkdf2$<iteracoes>$<salt_b64url>$<hash_b64url>".
  -- Web Crypto porque o admin-auth também roda no Edge do middleware.
  senha_hash text not null,
  -- Já nasce aqui para não remexer no schema quando a restrição por papel
  -- existir de fato. Hoje ninguém lê este campo para decidir acesso.
  papel text not null default 'admin' check (papel in ('admin', 'equipe')),
  ativo boolean not null default true,
  ultimo_acesso timestamptz,
  criado_em timestamptz not null default now()
);

comment on table public.admin_users is
  'Quem entra no /admin, com senha própria. Lido só via service-role pelo servidor; sem policy anônima.';

-- E-mail é a chave de login: sem diferença de maiúscula.
create unique index if not exists admin_users_email_key
  on public.admin_users (lower(email));

alter table public.admin_users enable row level security;
