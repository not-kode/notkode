-- Separa o "status" único do contrato em DOIS eixos independentes:
--   • status    = etapa de entrega (aguardando → onboarding → em_desenvolvimento → revisão → entregue)
--   • lifecycle = ciclo de vida comercial (ativo · pausado · churn · encerrado)
-- Antes, um único enum misturava os dois, então não dava pra marcar "entregue" E "ativo" ao mesmo tempo.

-- 1. Novo enum para o ciclo de vida comercial.
do $$ begin
  create type public.engagement_lifecycle as enum ('ativo','pausado','churn','encerrado');
exception when duplicate_object then null; end $$;

-- 2. Nova coluna lifecycle (default 'ativo' — todo contrato nasce vivo).
alter table public.engagements
  add column if not exists lifecycle public.engagement_lifecycle not null default 'ativo';

-- 3. Back-fill do ciclo de vida a partir do status legado.
--    Etapas de entrega puras → ativo. Recorrente entregue segue ativo (cliente pagante);
--    pontual entregue vira encerrado. Os antigos status "de ciclo de vida" mapeiam direto.
update public.engagements set lifecycle = 'ativo'     where status in ('aguardando','onboarding','em_desenvolvimento','revisao');
update public.engagements set lifecycle = 'ativo'     where status = 'entregue' and type = 'recorrente';
update public.engagements set lifecycle = 'encerrado' where status = 'entregue' and type = 'pontual';
update public.engagements set lifecycle = 'ativo'     where status = 'ativo';
update public.engagements set lifecycle = 'pausado'   where status = 'pausado';
update public.engagements set lifecycle = 'churn'     where status = 'churn';
update public.engagements set lifecycle = 'encerrado' where status = 'encerrado';

-- 4. Normaliza o status para conter APENAS etapa de entrega.
--    Os que carregavam um valor de ciclo de vida não têm etapa conhecida →
--    assumem 'entregue' (se chegaram a esse estado, presume-se que a entrega ocorreu).
update public.engagements set status = 'entregue' where status in ('ativo','pausado','churn','encerrado');

-- Obs.: o enum engagement_status mantém os valores legados por compatibilidade,
-- mas a aplicação passa a gravar só as 5 etapas de entrega na coluna status.
