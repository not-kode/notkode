-- Contadores de tarefa por projeto, para a tela não precisar carregar tudo.
--
-- O PostgREST devolve no máximo mil linhas por consulta. Em setembro de 2026 as
-- tarefas passaram de mil (1358) e a tela /admin/tasks, que pedia todas as
-- tarefas de todos os clientes numa consulta só, passou a perder as mais novas:
-- elas existiam no banco e apareciam no link do cliente, mas não no admin.
--
-- A tela agora carrega só as tarefas do projeto aberto. O que ela ainda precisa
-- do conjunto inteiro são dois resumos baratos, que moram aqui: o número que
-- cada projeto mostra na lista lateral e os nomes que já respondem por alguma
-- tarefa (para o seletor de responsável).

-- Uma linha por projeto (contrato ou negócio ganho, que é dono pelo deal_id).
-- "abertas", "para_hoje" e "atrasadas" contam só tarefas principais, como o
-- badge da lateral: subtarefa aparece dentro da mãe e não infla o número.
create or replace view public.project_task_counters
with (security_invoker = true) as
select
  coalesce(engagement_id, deal_id) as owner_id,
  count(*) as total,
  count(*) filter (
    where parent_task_id is null and status <> 'feito'
  ) as abertas,
  count(*) filter (
    where parent_task_id is null and status <> 'feito' and due_date = current_date
  ) as para_hoje,
  count(*) filter (
    where parent_task_id is null and status <> 'feito' and due_date < current_date
  ) as atrasadas
from public.project_tasks
where coalesce(engagement_id, deal_id) is not null
group by 1;

comment on view public.project_task_counters is
  'Resumo de tarefas por projeto para a lista lateral do admin, sem precisar carregar as tarefas.';

-- Quem já respondeu por alguma tarefa. Alimenta o seletor de responsável junto
-- com a equipe que tem login.
create or replace view public.task_assignee_names
with (security_invoker = true) as
select distinct btrim(assignee) as nome
from public.project_tasks
where assignee is not null and btrim(assignee) <> '';

comment on view public.task_assignee_names is
  'Nomes distintos que aparecem como responsável em alguma tarefa.';
