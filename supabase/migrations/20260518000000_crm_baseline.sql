-- ============================================================================
-- CRM baseline — reconstrução do schema que já existia no banco (criado à mão
-- no dashboard). Idempotente (IF NOT EXISTS) para nunca quebrar o banco vivo.
-- Fonte da verdade do CRM Notkode: contacts → deals → engagements → receivables.
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin create type public.user_role          as enum ('admin','client'); exception when duplicate_object then null; end $$;
do $$ begin create type public.channel            as enum ('whatsapp','email'); exception when duplicate_object then null; end $$;
do $$ begin create type public.channel_kind       as enum ('email','whatsapp','phone'); exception when duplicate_object then null; end $$;
do $$ begin create type public.conversation_status as enum ('aberta','pendente','fechada'); exception when duplicate_object then null; end $$;
do $$ begin create type public.message_direction  as enum ('inbound','outbound'); exception when duplicate_object then null; end $$;
do $$ begin create type public.message_status     as enum ('queued','sent','delivered','read','failed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.billing_type       as enum ('pontual','recorrente'); exception when duplicate_object then null; end $$;
do $$ begin create type public.deal_stage         as enum ('novo','qualificado','diagnostico','proposta','negociacao','ganho','perdido'); exception when duplicate_object then null; end $$;
do $$ begin create type public.engagement_status  as enum ('aguardando','onboarding','em_desenvolvimento','revisao','entregue','encerrado','ativo','pausado','churn'); exception when duplicate_object then null; end $$;
do $$ begin create type public.receivable_status  as enum ('pendente','recebido','atrasado','cancelado'); exception when duplicate_object then null; end $$;
do $$ begin create type public.consent_status     as enum ('subscribed','unsubscribed'); exception when duplicate_object then null; end $$;

-- ── Contas / contatos ────────────────────────────────────────────────────────
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name       text not null,
  domain     text,
  market     text,
  notes      text
);

create table if not exists public.contacts (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text,
  locale       text,
  market       text,
  notes        text,
  source       text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text
);

create table if not exists public.contact_channels (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  kind       public.channel_kind not null,
  value      text not null,
  label      text,
  is_primary boolean not null default false
);

create table if not exists public.contact_organizations (
  contact_id      uuid not null references public.contacts(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role            text,
  is_primary      boolean not null default false,
  created_at      timestamptz not null default now(),
  primary key (contact_id, organization_id)
);

create table if not exists public.marketing_consent (
  id            uuid primary key default gen_random_uuid(),
  contact_id    uuid not null references public.contacts(id) on delete cascade,
  channel       public.channel not null,
  status        public.consent_status not null default 'subscribed',
  opted_in_at   timestamptz default now(),
  opted_out_at  timestamptz,
  opt_out_reason text,
  opt_out_method text,
  updated_at    timestamptz not null default now()
);

-- ── Atendimento ───────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  contact_id      uuid references public.contacts(id) on delete set null,
  channel         public.channel not null,
  status          public.conversation_status not null default 'aberta',
  subject         text,
  assignee        uuid,
  last_message_at timestamptz
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction       public.message_direction not null,
  channel         public.channel not null,
  body            text,
  status          public.message_status,
  external_id     text,
  meta            jsonb not null default '{}'::jsonb,
  sent_at         timestamptz
);

-- ── Vendas ────────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  billing_type  public.billing_type not null,
  default_price numeric,
  active        boolean not null default true
);

create table if not exists public.deals (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  organization_id uuid references public.organizations(id) on delete set null,
  contact_id      uuid references public.contacts(id) on delete set null,
  lead_id         uuid,
  stage           public.deal_stage not null default 'novo',
  source          text,
  service_tag     text,
  market          text,
  valor_pontual   numeric not null default 0,
  mrr             numeric not null default 0,
  expected_close  date,
  notes           text
);

create table if not exists public.deal_items (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  deal_id      uuid not null references public.deals(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  description  text,
  billing_type public.billing_type not null,
  price        numeric not null,
  quantity     integer not null default 1
);

-- ── Entrega / financeiro ───────────────────────────────────────────────────────
create table if not exists public.engagements (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  organization_id uuid references public.organizations(id) on delete set null,
  type            public.billing_type not null,
  status          public.engagement_status not null,
  title           text,
  start_date      date,
  end_date        date,
  valor           numeric,
  mrr             numeric,
  billing_cycle   text,
  notes           text
);

create table if not exists public.deal_engagements (
  deal_id       uuid not null references public.deals(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (deal_id, engagement_id)
);

create table if not exists public.receivables (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  engagement_id   uuid references public.engagements(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  description     text,
  amount          numeric not null,
  due_date        date not null,
  status          public.receivable_status not null default 'pendente',
  paid_at         date,
  paid_amount     numeric,
  method          text,
  notes           text
);

-- ── Acesso ───────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  role            public.user_role not null default 'client',
  organization_id uuid references public.organizations(id) on delete set null,
  name            text,
  email           text
);

-- ── RLS (habilitado em todas; políticas definidas em migration posterior) ──────
alter table public.organizations         enable row level security;
alter table public.contacts              enable row level security;
alter table public.contact_channels      enable row level security;
alter table public.contact_organizations enable row level security;
alter table public.marketing_consent     enable row level security;
alter table public.conversations         enable row level security;
alter table public.messages              enable row level security;
alter table public.products              enable row level security;
alter table public.deals                 enable row level security;
alter table public.deal_items            enable row level security;
alter table public.engagements           enable row level security;
alter table public.deal_engagements      enable row level security;
alter table public.receivables           enable row level security;
alter table public.profiles              enable row level security;
