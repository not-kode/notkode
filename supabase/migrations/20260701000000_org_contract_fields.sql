-- Campos cadastrais das empresas (CONTRATANTE) usados para gerar contratos.
-- PJ-first, mas tax_id aceita CPF quando o cliente for pessoa física.
alter table organizations
  add column if not exists legal_name         text,
  add column if not exists tax_id             text,
  add column if not exists state_registration text,
  add column if not exists address_street     text,
  add column if not exists address_number     text,
  add column if not exists address_district   text,
  add column if not exists address_city       text,
  add column if not exists address_state      text,
  add column if not exists address_zip        text,
  add column if not exists legal_rep          text;

comment on column organizations.legal_name is 'Razão social (ou nome, se PF) — usado para gerar contratos';
comment on column organizations.tax_id is 'CNPJ ou CPF do cliente';
comment on column organizations.legal_rep is 'Representante legal que assina o contrato';
