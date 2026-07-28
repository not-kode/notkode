-- Entregas: quadro de tasks (Kanban, Lista e Gantt).
--
-- project_phases e project_tasks nasceram direto no banco, sem migration. Este
-- arquivo registra a estrutura no repo (create if not exists, então não mexe no
-- que já existe) e acrescenta o que o quadro precisa: prioridade, data de início
-- (a barra do Gantt precisa de começo, não só de prazo) e ordem dentro da coluna.

create table if not exists public.project_phases (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'pendente',
  start_date date,
  end_date date,
  sort integer not null default 0,
  client_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  phase_id uuid references public.project_phases(id) on delete set null,
  title text not null,
  notes text,
  status text not null default 'a_fazer',
  due_date date,
  assignee text,
  client_visible boolean not null default true,
  sort integer not null default 0,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_tasks add column if not exists priority text not null default 'media';
alter table public.project_tasks add column if not exists start_date date;
alter table public.project_tasks add column if not exists sort integer not null default 0;

alter table public.project_tasks drop constraint if exists project_tasks_priority_check;
alter table public.project_tasks
  add constraint project_tasks_priority_check
  check (priority in ('baixa', 'media', 'alta', 'urgente'));

create index if not exists project_tasks_engagement_idx on public.project_tasks (engagement_id, status, sort);
create index if not exists project_phases_engagement_idx on public.project_phases (engagement_id, sort);
