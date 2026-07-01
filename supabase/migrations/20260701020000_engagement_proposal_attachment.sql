-- Anexo de proposta ao contrato (upload no Storage, referenciado no documento)
alter table engagements add column if not exists proposal_path text;  -- caminho no storage bucket 'propostas'
alter table engagements add column if not exists proposal_name text;  -- nome original do arquivo da proposta

comment on column engagements.proposal_path is 'Caminho do arquivo da proposta no Storage (bucket propostas); anexado/referenciado no contrato';

-- Bucket privado para as propostas (upload/download via service role nas server actions)
insert into storage.buckets (id, name, public) values ('propostas', 'propostas', false)
on conflict (id) do nothing;
