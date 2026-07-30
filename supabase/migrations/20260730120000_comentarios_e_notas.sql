-- Comentários de tarefa e base de notas.
--
-- Vieram junto com a mudança de casa das tarefas: o SimbOS guardava o histórico
-- de conversa dentro da tarefa e uma base de notas (diagnósticos, estratégias,
-- decisões de arquitetura). Como o sistema virou a fonte da verdade, esse
-- material passa a morar aqui.
--
-- `origem`/`origem_id` existem para a importação ser idempotente: reimportar o
-- mesmo export não duplica nada.

create table if not exists public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.project_tasks(id) on delete cascade,
  author     text,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  origem     text,
  origem_id  text unique
);

create index if not exists task_comments_task_idx on public.task_comments (task_id, created_at);
alter table public.task_comments enable row level security;

comment on table public.task_comments is
  'Conversa dentro da tarefa. origem_id guarda o id no sistema de onde veio, para reimportação não duplicar.';

create table if not exists public.notes (
  id              uuid primary key default gen_random_uuid(),
  engagement_id   uuid references public.engagements(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  title           text not null,
  content         text,
  tags            text[] not null default '{}',
  -- nota | aprendizado | pessoa | recurso: o mesmo vocabulário do material que
  -- veio, para não achatar um diagnóstico e um contato na mesma coisa.
  kind            text not null default 'nota',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  origem          text,
  origem_id       text unique
);

create index if not exists notes_engagement_idx on public.notes (engagement_id, created_at desc);
create index if not exists notes_kind_idx on public.notes (kind, created_at desc);
alter table public.notes enable row level security;

comment on table public.notes is
  'Base de conhecimento: notas, aprendizados e fichas de pessoas, opcionalmente presas a um projeto.';
