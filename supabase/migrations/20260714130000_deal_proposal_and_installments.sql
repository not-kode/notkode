-- Proposta enviada, anexada já no pipeline (antes de ganhar).
alter table public.deals
  add column if not exists proposal_path text,
  add column if not exists proposal_name text;

-- Parcelas planejadas do negócio (parcelado ou não), lançadas no card do pipeline.
-- Ao GANHAR o negócio, viram receivables do contrato (financeiro).
create table if not exists public.deal_installments (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  description text,
  amount      numeric not null,
  due_date    date not null,
  created_at  timestamptz not null default now()
);

create index if not exists deal_installments_deal_id_idx on public.deal_installments(deal_id);

-- RLS: ligado, sem policy pública. O painel usa a service_role (bypassa RLS);
-- ninguém mais acessa. Mesmo padrão das demais tabelas do CRM.
alter table public.deal_installments enable row level security;
