-- Sessões: marcar gravação como já assistida.
--
-- Fica em tabela própria, e não numa coluna de session_recordings, porque uma
-- sessão tem N chunks: "vista" é atributo da sessão inteira, não de cada pedaço.
-- Chave é o session_id (text), o mesmo identificador usado em events e recordings.

create table if not exists public.session_watched (
  session_id text primary key,
  watched_at timestamptz not null default now()
);
