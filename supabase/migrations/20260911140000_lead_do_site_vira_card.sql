-- O lead do site nasce no funil.
--
-- Antes, quem preenchia o formulário virava linha em lead_submissions e só
-- entrava no funil quando alguém clicava em "Promover" na tela de Leads. Duas
-- listas de gente para a mesma pessoa, e o funil cego para quem tinha acabado
-- de se identificar.
--
-- Agora o card nasce assim que a pessoa dá nome e um contato, ainda no
-- rascunho. lead_session_id é o que liga o card à sessão que o gerou: é por ele
-- que o rascunho vira card uma vez só, que o envio completo depois enriquece o
-- MESMO card em vez de criar outro, e que o drawer encontra as respostas do
-- formulário.

alter table public.deals
  add column if not exists lead_session_id text;

comment on column public.deals.lead_session_id is
  'Sessão do site que originou o negócio (lead_drafts.session_id / lead_submissions.session_id). Um card por sessão.';

-- Parcial: negócio criado na mão não tem sessão, e vários nulos não podem
-- brigar entre si.
create unique index if not exists deals_lead_session_id_key
  on public.deals (lead_session_id)
  where lead_session_id is not null;

-- Do lado do rascunho, o carimbo de que ele já virou card.
alter table public.lead_drafts
  add column if not exists deal_id uuid references public.deals(id) on delete set null;

comment on column public.lead_drafts.deal_id is 'Card do funil criado a partir deste rascunho.';
