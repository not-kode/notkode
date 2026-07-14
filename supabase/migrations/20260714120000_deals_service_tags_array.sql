-- Um negócio pode envolver mais de um produto/serviço.
-- service_tags = lista completa; service_tag (text) segue como o "principal"
-- (primeiro da lista) para compatibilidade com o fluxo de contrato e origem do lead.
alter table public.deals
  add column if not exists service_tags text[] not null default '{}';

-- Backfill: quem já tinha service_tag entra na lista.
update public.deals
  set service_tags = array[service_tag]
  where service_tag is not null and service_tags = '{}';
