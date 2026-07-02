alter table engagements
  add column if not exists client_obligations text,
  add column if not exists provider_obligations text;

comment on column engagements.client_obligations is 'Obrigações da CONTRATANTE (Cláusula 2), uma por linha; null usa texto genérico padrão.';
comment on column engagements.provider_obligations is 'Obrigações da CONTRATADA (Cláusula 3), uma por linha; null usa texto genérico padrão.';
