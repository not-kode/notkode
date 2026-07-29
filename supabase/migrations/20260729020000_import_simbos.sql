-- Traz os projetos e as tarefas do SimbOS para dentro do sistema.
--
-- Três coisas que a importação precisa e o schema ainda não tinha:
--
-- 1. Coluna de origem. Guardar o id do SimbOS em cada registro importado deixa a
--    importação idempotente (rodar de novo atualiza em vez de duplicar) e
--    reversível (dá para apagar exatamente o que veio de fora).
-- 2. Status "backlog". O SimbOS distingue backlog de "a fazer", e 41 tarefas
--    estavam lá. Jogar as duas colunas numa só perderia essa informação.
-- 3. Projeto sem cliente. Trabalho interno (o próprio sistema da Notkode, por
--    exemplo) não tem organização nem contrato. organization_id já era nulável,
--    então basta um engagement com título próprio.

alter table public.project_tasks
  add column if not exists simbos_task_id text;

create unique index if not exists project_tasks_simbos_task_id_key
  on public.project_tasks (simbos_task_id)
  where simbos_task_id is not null;

alter table public.engagements
  add column if not exists simbos_project_id text;

create unique index if not exists engagements_simbos_project_id_key
  on public.engagements (simbos_project_id)
  where simbos_project_id is not null;

-- Marca o que é frente interna, para a tela separar cliente de casa.
alter table public.engagements
  add column if not exists is_internal boolean not null default false;

-- "backlog" entra antes de "a_fazer": é a coluna do que existe mas não foi
-- puxado para a fila ainda.
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumtypid = 'task_status'::regtype and enumlabel = 'backlog'
  ) then
    alter type task_status add value 'backlog' before 'a_fazer';
  end if;
end $$;
