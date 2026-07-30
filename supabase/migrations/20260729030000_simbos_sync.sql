-- Ligação de mão dupla com o SimbOS.
--
-- A sincronização puxa do SimbOS o que mudou lá. Sem uma lista de exceções,
-- toda tarefa apagada de propósito daqui voltaria no próximo ciclo: foi o caso
-- das pendências de terceiros do Receba Seus Direitos, que seguem existindo no
-- SimbOS (é caso jurídico, o registro tem que ficar lá) mas não são trabalho da
-- casa e não devem aparecer no quadro.
--
-- Guardar o id do SimbOS, e não o do sistema, é o que faz a exceção sobreviver
-- ao registro local já ter sido apagado.

create table if not exists public.simbos_ignored (
  simbos_id  text primary key,
  kind       text not null check (kind in ('task', 'project')),
  reason     text,
  created_at timestamptz not null default now()
);

-- Registra quando cada lado foi visto por último, para a sincronização saber
-- quem ganha em caso de mudança nos dois lugares.
alter table public.project_tasks
  add column if not exists simbos_synced_at timestamptz;
