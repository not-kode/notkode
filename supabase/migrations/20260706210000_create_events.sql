-- Tracking próprio de eventos do site — sem cookies, sem PII, first-party.
-- Alimenta o dashboard do /admin (funil: visita → clique CTA → form → lead).
-- Gravado via service-role pelo /api/track; igual a lead_submissions, sem policies anônimas.
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  type         text not null,               -- page_view | cta_click | form_submit
  page         text,                        -- pathname (ex: /pt/sistemas-ia)
  label        text,                        -- detalhe do evento (ex: rótulo do CTA)
  service_tag  text,                        -- serviço associado, quando houver
  session_id   text,                        -- id efêmero de sessão (não-PII, first-party)
  locale       text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_term     text,
  utm_content  text
);

alter table public.events enable row level security;

comment on table public.events is
  'Eventos de tracking próprio do site (page_view/cta_click/form_submit). Sem cookies, sem PII. Gravado via service-role.';

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_idx on public.events (type);
create index if not exists events_session_idx on public.events (session_id);
