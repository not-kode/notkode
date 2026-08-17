-- Quando o cliente abriu o link do briefing. Sem isso, a única data que a
-- gente tinha era "criado em": não dava para saber se o silêncio dele era
-- porque nunca abriu o link, ou porque abriu e travou em alguma pergunta.
alter table public.onboarding_briefings
  add column if not exists first_opened_at timestamptz,
  add column if not exists last_opened_at  timestamptz;

comment on column public.onboarding_briefings.first_opened_at is
  'Primeira vez que o link público foi aberto pelo cliente. Abertura nossa (?nk=interno) não carimba.';
comment on column public.onboarding_briefings.last_opened_at is
  'Última abertura do link público pelo cliente.';
