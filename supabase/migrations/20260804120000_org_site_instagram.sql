-- Site e Instagram do cliente, junto do resto do cadastro. São as informações
-- que se olha antes de falar com ele, e viviam soltas fora do sistema — telefone
-- e e-mail já moravam aqui (em contact_channels), o endereço na web não.
alter table public.organizations
  add column if not exists site      text,
  add column if not exists instagram text;
