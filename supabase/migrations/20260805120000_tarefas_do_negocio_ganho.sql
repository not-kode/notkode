-- Tarefas do negócio ganho, antes de existir contrato.
--
-- O checklist do fechamento (gerar contrato, mandar assinar, enviar briefing,
-- cobrar o retorno, receber a primeira parcela) precisa nascer no momento em que
-- a venda é ganha. Só que tarefa sempre morou dentro de um contrato, e o
-- contrato nasce depois, no botão "Gerar contrato" — as tarefas não teriam onde
-- ficar nesse intervalo.
--
-- Agora a tarefa pode pertencer ao NEGÓCIO enquanto o contrato não existe.
-- Quando o contrato é gerado, as tarefas passam para ele (engagement_id
-- preenchido, deal_id zerado) e o quadro volta a ser só de contratos.

alter table public.project_tasks alter column engagement_id drop not null;

alter table public.project_tasks
  add column if not exists deal_id uuid references public.deals(id) on delete cascade;

-- Tarefa órfã não existe: ou é de um contrato, ou é de um negócio.
alter table public.project_tasks drop constraint if exists project_tasks_dono_check;
alter table public.project_tasks
  add constraint project_tasks_dono_check
  check (engagement_id is not null or deal_id is not null);

create index if not exists project_tasks_deal_idx on public.project_tasks (deal_id, status, sort);
