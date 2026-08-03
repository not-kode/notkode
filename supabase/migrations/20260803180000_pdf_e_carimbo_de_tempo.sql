-- PDF do documento assinado e carimbo de tempo externo (RFC 3161).
--
-- O documento continua sendo o HTML congelado, que é o que o hash protege; o
-- PDF é a renderização dele, gerada na conclusão para ir anexada no e-mail e
-- ficar disponível na página de verificação.
--
-- O carimbo é o que tira a data das nossas mãos: o hash do documento assinado é
-- enviado a uma autoridade de carimbo de tempo, que devolve um token assinado
-- por ela. O token fica guardado como veio, para conferência com openssl.

alter table public.signature_requests
  add column if not exists assinado_pdf_path  text,
  add column if not exists carimbo_path       text,
  add column if not exists carimbo_em         timestamptz,
  add column if not exists carimbo_autoridade text;

comment on column public.signature_requests.assinado_pdf_path is
  'PDF do documento assinado, no bucket "assinaturas". Nulo quando a geração falhou.';
comment on column public.signature_requests.carimbo_path is
  'Token RFC 3161 (DER) devolvido pela autoridade de carimbo de tempo.';
comment on column public.signature_requests.carimbo_em is
  'Instante declarado dentro do token (genTime), e não o horário do nosso servidor.';
comment on column public.signature_requests.carimbo_autoridade is
  'Endereço da autoridade que emitiu o carimbo.';
