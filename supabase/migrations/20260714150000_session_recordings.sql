-- Gravações de sessão (rrweb): a sessão é fatiada em "chunks" de eventos jsonb,
-- gravados conforme a pessoa navega. Reproduzidas em ordem no player do /admin.
create table if not exists public.session_recordings (
  id         uuid primary key default gen_random_uuid(),
  session_id text not null,
  page       text,
  events     jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists session_recordings_session_idx
  on public.session_recordings(session_id, created_at);

-- Painel usa service_role (bypassa RLS); ninguém mais acessa.
alter table public.session_recordings enable row level security;
