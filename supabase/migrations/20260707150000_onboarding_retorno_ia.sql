-- Retorno pro cliente gerado por IA (cache): mensagem + dúvidas do produto.
-- Gerado sob demanda no admin e cacheado aqui para não reprocessar a cada abertura.
-- Formato: { mensagem: text, duvidas: text[], geradoEm: timestamptz, modelo: text }
alter table public.onboarding_briefings
  add column if not exists retorno_ia jsonb;
