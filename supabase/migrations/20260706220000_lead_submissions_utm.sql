-- UTM de campanha na submissão de lead — liga cada lead à origem de tráfego.
-- Preenchido pelo /api/lead a partir do que o front captura na chegada (?utm_*).
alter table public.lead_submissions
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term     text,
  add column if not exists utm_content  text;
