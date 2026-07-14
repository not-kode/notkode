-- Rascunhos de formulário: quem começou a preencher (já com algum contato) mas
-- ainda NÃO enviou. Chave = session_id (upsert conforme a pessoa digita).
-- submitted_at != null marca que virou lead de verdade (some da lista de abandonados).
create table if not exists public.lead_drafts (
  session_id   text primary key,
  service_tag  text,
  kind         text,
  name         text,
  company      text,
  email        text,
  whatsapp     text,
  needs        text[],
  timing       text,
  description  text,
  last_step    text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  submitted_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Painel usa service_role (bypassa RLS); ninguém mais acessa.
alter table public.lead_drafts enable row level security;
