-- Assinatura eletrônica dos contratos, dentro do próprio sistema.
--
-- A peça central é o documento CONGELADO: o contrato de /admin/contrato/[id] é
-- montado ao vivo a partir do banco, então, sem congelar, mexer numa parcela
-- mudaria o documento já assinado. No envio o HTML é gravado no bucket privado
-- 'assinaturas' e o sha256 dele fica aqui; é esse par que a verificação pública
-- confere depois.
--
-- Gravado via service-role (server actions e rotas do /admin). RLS ligado e sem
-- policy anônima, como em onboarding_briefings e lead_submissions.

create table if not exists public.signature_requests (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  engagement_id    uuid not null references public.engagements(id) on delete cascade,
  organization_id  uuid references public.organizations(id) on delete set null,
  titulo           text,
  documento_path   text not null,
  documento_hash   text not null,
  codigo           text not null unique,
  status           text not null default 'enviado',   -- enviado | assinado | cancelado | expirado
  expires_at       timestamptz,
  completed_at     timestamptz,
  assinado_path    text,
  assinado_hash    text
);

alter table public.signature_requests enable row level security;

comment on table public.signature_requests is
  'Pedido de assinatura de um contrato: o documento congelado no envio, o hash dele e o código público de verificação.';
comment on column public.signature_requests.documento_path is 'Caminho do HTML congelado no bucket privado "assinaturas".';
comment on column public.signature_requests.documento_hash is 'sha256 (hex) do documento congelado. É o que a página pública de verificação confere.';
comment on column public.signature_requests.codigo is 'Código curto do link público /verificar/[codigo].';
comment on column public.signature_requests.assinado_path is 'Documento final, com a página de assinaturas anexada, gravado quando o último signatário assina.';

create index if not exists signature_requests_engagement_idx on public.signature_requests (engagement_id);
create index if not exists signature_requests_status_idx on public.signature_requests (status);
create index if not exists signature_requests_created_idx on public.signature_requests (created_at desc);

-- Um por pessoa que assina. O token é o link individual; o código de 6 dígitos
-- vai por e-mail na hora de assinar e fica guardado só como hash.
create table if not exists public.signature_signers (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  request_id          uuid not null references public.signature_requests(id) on delete cascade,
  nome                text not null,
  email               text not null,
  documento           text,
  papel               text not null default 'contratante',  -- contratante | contratada | testemunha
  ordem               smallint not null default 1,
  token               text not null unique,
  otp_hash            text,
  otp_expires_at      timestamptz,
  otp_tentativas      smallint not null default 0,
  otp_enviado_em      timestamptz,
  status              text not null default 'pendente',     -- pendente | assinado | recusado
  assinatura_nome     text,
  assinatura_imagem   text,
  assinado_em         timestamptz,
  assinado_ip         text,
  assinado_user_agent text,
  recusado_em         timestamptz,
  recusa_motivo       text
);

alter table public.signature_signers enable row level security;

comment on table public.signature_signers is
  'Quem assina um pedido de assinatura, com o link individual, o controle do código por e-mail e o registro da assinatura.';
comment on column public.signature_signers.token is 'Slug secreto do link público /assinar/[token].';
comment on column public.signature_signers.otp_hash is 'sha256 do código de 6 dígitos. O código em si nunca é gravado.';
comment on column public.signature_signers.assinatura_imagem is 'PNG em data URL do traço desenhado, quando a pessoa assina desenhando.';

create index if not exists signature_signers_request_idx on public.signature_signers (request_id);
create index if not exists signature_signers_status_idx on public.signature_signers (status);

-- Trilha de auditoria: só recebe linha nova, nunca edição. É o que sustenta a
-- prova de quem abriu, quando validou o código e de onde assinou.
create table if not exists public.signature_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  request_id  uuid not null references public.signature_requests(id) on delete cascade,
  signer_id   uuid references public.signature_signers(id) on delete set null,
  tipo        text not null,   -- criado | enviado | aberto | otp_enviado | otp_validado | otp_falhou | assinado | recusado | cancelado | concluido
  ip          text,
  user_agent  text,
  detalhe     jsonb not null default '{}'::jsonb
);

alter table public.signature_events enable row level security;

comment on table public.signature_events is
  'Trilha de auditoria da assinatura, append-only: cada passo com horário, IP e navegador.';

create index if not exists signature_events_request_idx on public.signature_events (request_id, created_at);

-- Bucket privado dos documentos congelados e assinados.
insert into storage.buckets (id, name, public)
values ('assinaturas', 'assinaturas', false)
on conflict (id) do nothing;
