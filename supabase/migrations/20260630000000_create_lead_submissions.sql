-- Raw, append-only inbox for website lead form submissions.
-- O /api/lead grava aqui primeiro (zero perda). O CRM depois promove cada
-- submissão para contacts/deals e carimba promoted_at + linkage.
create table if not exists public.lead_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  service_tag   text,
  page_origin   text,
  name          text,
  email         text,
  whatsapp      text,
  notes         text,
  selection     jsonb,
  estimated_min numeric,
  estimated_max numeric,
  -- promotion linkage (filled when converted into the CRM)
  promoted_at   timestamptz,
  contact_id    uuid references public.contacts(id) on delete set null,
  deal_id       uuid references public.deals(id) on delete set null
);

alter table public.lead_submissions enable row level security;

comment on table public.lead_submissions is
  'Raw append-only inbox for website lead form submissions. Promoted into contacts/deals by the CRM.';

create index if not exists lead_submissions_created_at_idx on public.lead_submissions (created_at desc);
create index if not exists lead_submissions_promoted_at_idx on public.lead_submissions (promoted_at);
