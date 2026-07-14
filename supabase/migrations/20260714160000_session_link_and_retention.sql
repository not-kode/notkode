-- Liga o lead enviado à gravação da sessão (mesma sessão anônima do site).
alter table public.lead_submissions
  add column if not exists session_id text;

-- Retenção: apaga gravações de sessão com mais de 30 dias, diariamente.
create extension if not exists pg_cron;

select cron.schedule(
  'purge-session-recordings-30d',
  '0 4 * * *',
  $$ delete from public.session_recordings where created_at < now() - interval '30 days' $$
);
