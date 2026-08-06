-- Gravação de sessão é material de leitura curta: serve para entender um lead
-- que acabou de chegar ou uma página que está perdendo gente. Passada uma ou
-- duas semanas, ninguém volta nela, e ela só ocupa banco.
--
-- A retenção era de 30 dias. Passa para 14, e o que já estourou esse prazo sai
-- agora, sem esperar a próxima rodada do cron.

select cron.unschedule('purge-session-recordings-30d')
where exists (select 1 from cron.job where jobname = 'purge-session-recordings-30d');

select cron.schedule(
  'purge-session-recordings-14d',
  '0 4 * * *',
  $$ delete from public.session_recordings where created_at < now() - interval '14 days' $$
);

delete from public.session_recordings where created_at < now() - interval '14 days';
