-- Mapa de calor: extrai de dentro das gravações só o que posiciona o ponteiro.
--
-- Os cliques e as rolagens já estavam gravados pelo rrweb desde sempre, presos
-- dentro do jsonb de session_recordings. Esta view os achata em linhas leves,
-- para o admin não precisar baixar os snapshots de DOM (que são o grosso do peso)
-- só para desenhar bolinhas.
--
-- Semântica dos campos do rrweb usada aqui:
--   type 4              → Meta, traz href e o viewport (width/height) daquela aba
--   type 3 / source 2   → MouseInteraction; data.type 2 = clique, 7/9 = toque
--   type 3 / source 3   → Scroll; data.y é o scrollY do documento quando id = 1
--
-- x/y do clique são relativos ao VIEWPORT, não ao documento: quem converte para
-- posição na página é o admin, somando o scroll corrente da sessão.

create or replace view public.session_pointer_events as
select
  r.session_id,
  r.ua,
  (e->>'timestamp')::bigint                     as ts,
  case
    when (e->>'type')::int = 4                            then 'meta'
    when (e->'data'->>'source')::int = 3                  then 'scroll'
    when (e->'data'->>'type')::int in (2, 4, 7, 9)        then 'click'
    else 'outro'
  end                                           as kind,
  (e->'data'->>'href')                          as href,
  (e->'data'->>'x')::float                      as x,
  (e->'data'->>'y')::float                      as y,
  (e->'data'->>'id')::int                       as node_id,
  (e->'data'->>'width')::int                    as vw,
  (e->'data'->>'height')::int                   as vh
from public.session_recordings r,
     lateral jsonb_array_elements(r.events) e
where (e->>'type')::int = 4
   or ((e->>'type')::int = 3 and (e->'data'->>'source')::int in (2, 3));
