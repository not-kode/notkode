-- Respostas do formulário público de onboarding de cliente.
-- Gravado via service-role (server actions); sem policies anônimas — igual lead_submissions.
create table if not exists public.onboarding_briefings (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  organization_id  uuid references public.organizations(id) on delete set null,
  product_name     text,
  scope            text,
  token            text not null unique,
  status           text not null default 'rascunho',   -- rascunho | enviado
  template_version text not null default 'v1',
  respostas        jsonb not null default '{}'::jsonb,
  submitted_at     timestamptz
);

alter table public.onboarding_briefings enable row level security;

comment on table public.onboarding_briefings is
  'Respostas do formulário público de onboarding. Gravado via service-role; sem policies anônimas. Atrelado a uma organization.';
comment on column public.onboarding_briefings.token is 'Slug secreto usado no link público /onboarding/[token].';
comment on column public.onboarding_briefings.status is 'rascunho enquanto o cliente preenche; enviado ao concluir.';

create index if not exists onboarding_briefings_org_idx on public.onboarding_briefings (organization_id);
create index if not exists onboarding_briefings_created_idx on public.onboarding_briefings (created_at desc);

-- Bucket privado para anexos do briefing (estudo de público, etc.)
insert into storage.buckets (id, name, public)
values ('onboarding', 'onboarding', false)
on conflict (id) do nothing;
