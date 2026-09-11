-- Perda do negócio com motivo.
--
-- O estágio "perdido" já existia no enum, mas não havia onde guardar POR QUE o
-- negócio caiu nem QUANDO. Sem isso o funil só sabia contar perdas; agora dá
-- para olhar depois onde ele vaza.
--
-- Reabrir um negócio limpa as duas colunas: elas valem só enquanto ele está
-- perdido.

alter table public.deals
  add column if not exists lost_reason text,
  add column if not exists lost_at timestamptz;

comment on column public.deals.lost_reason is 'Motivo da perda, preenchido ao marcar o negócio como perdido. Limpo ao reabrir.';
comment on column public.deals.lost_at is 'Quando o negócio foi marcado como perdido. Limpo ao reabrir.';
