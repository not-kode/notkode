-- Campos variáveis para gerar o documento de contrato a partir de template
alter table engagements add column if not exists scope text;         -- objeto / escopo (cláusula 1)
alter table engagements add column if not exists renewal_note text;  -- condição de renovação (cláusula 5)
alter table organizations add column if not exists legal_rep_cpf text; -- CPF de quem assina pela contratante

comment on column engagements.scope is 'Objeto/escopo do contrato — texto da Cláusula Primeira ao gerar o documento';
comment on column organizations.legal_rep_cpf is 'CPF do representante legal que assina o contrato';
