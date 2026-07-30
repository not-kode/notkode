-- Caminho do repositório de cada projeto.
--
-- Serve para o MCP saber, do terminal, de qual cliente é a pasta em que se está
-- trabalhando: sem isso, toda tarefa criada dali precisa que alguém diga o nome
-- do projeto, e esquecer disso põe a tarefa no cliente errado.
--
-- Um repositório tem um único projeto ativo (projeto antigo do mesmo cliente
-- fica arquivado e sem caminho), e o índice abaixo é quem garante isso.
alter table public.engagements add column if not exists repo_path text;

create unique index if not exists engagements_repo_path_ativo_idx
  on public.engagements (repo_path)
  where repo_path is not null and archived_at is null;
