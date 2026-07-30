-- Cronômetro por tarefa e arquivamento de projeto.
--
-- O tempo fica em dois campos: o acumulado (time_spent_seconds) e o instante em
-- que o relógio foi ligado (timer_started_at, nulo quando está parado). Assim o
-- que já foi contado nunca depende de o navegador continuar aberto, e o tempo
-- em curso é sempre "agora − timer_started_at".
alter table public.project_tasks add column if not exists time_spent_seconds integer not null default 0;
alter table public.project_tasks add column if not exists timer_started_at timestamptz;

-- Projeto arquivado sai da barra lateral sem perder o histórico. Encerrado é
-- estado do contrato; arquivado é decisão de quem trabalha na tela.
alter table public.engagements add column if not exists archived_at timestamptz;
