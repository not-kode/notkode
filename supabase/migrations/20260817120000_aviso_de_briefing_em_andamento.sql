-- O e-mail de onboarding só saía no envio final do briefing. A Aiedem
-- respondeu 49 perguntas e nunca clicou em "Enviar briefing": ninguém foi
-- avisado, e o projeto ficou parado esperando um retorno que já estava no
-- banco. Esta coluna guarda quando o último aviso de rascunho em andamento
-- foi mandado, para avisar no máximo uma vez por dia por briefing.
alter table public.onboarding_briefings
  add column if not exists draft_notified_at timestamptz;

comment on column public.onboarding_briefings.draft_notified_at is
  'Quando saiu o último e-mail de "cliente está respondendo" deste rascunho. Trava o aviso em 1 por dia.';
