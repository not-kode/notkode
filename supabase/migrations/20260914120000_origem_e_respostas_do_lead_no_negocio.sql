-- De onde o lead veio e o que ele respondeu, guardados no próprio negócio.
--
-- A origem estava indo parar na mensagem do WhatsApp, que é da pessoa, não da
-- gente. E as respostas do formulário eram copiadas para as notas do card num
-- texto corrido, misturadas com o que a equipe escreve, e sem metade dos campos
-- (o tamanho da empresa, por exemplo, nunca chegava).
--
-- Agora o formulário manda cada resposta como a pessoa viu na tela, pergunta e
-- resposta, e o card mostra exatamente o que aquele formulário perguntou. As
-- notas voltam a ser só da equipe.

alter table public.deals
  add column if not exists lead_page text,
  add column if not exists lead_channel text,
  add column if not exists lead_answers jsonb;

comment on column public.deals.lead_page is 'Caminho da página do site onde o lead preencheu o formulário (ex.: /pt/sistemas-ia).';
comment on column public.deals.lead_channel is 'Por onde a pessoa chegou ao site (utm_source), quando veio marcado.';
comment on column public.deals.lead_answers is 'Respostas do formulário do site, na ordem em que foram perguntadas: [{pergunta, resposta}].';

-- Página: só o envio completo tinha, pelo referer.
update public.deals d
set lead_page = regexp_replace(ls.page_origin, '^https?://[^/]+', '')
from public.lead_submissions ls
where d.lead_page is null
  and ls.page_origin is not null
  and (ls.id = d.lead_id or (ls.session_id is not null and ls.session_id = d.lead_session_id));

-- Canal: do rascunho ou do envio.
update public.deals d
set lead_channel = dr.utm_source
from public.lead_drafts dr
where d.lead_channel is null and dr.utm_source is not null and dr.session_id = d.lead_session_id;

update public.deals d
set lead_channel = ls.utm_source
from public.lead_submissions ls
where d.lead_channel is null and ls.utm_source is not null and ls.id = d.lead_id;

-- Respostas dos cards que já existiam, montadas do rascunho e do envio. Os
-- rótulos em texto só existem para o formulário de Sistemas com IA, que é de
-- onde vieram todos até aqui; qualquer outro fica com o valor cru.
with base as (
  select
    d.id,
    coalesce(d.service_tag, dr.service_tag) as tag,
    coalesce(ls.selection -> 'needs', to_jsonb(dr.needs)) as needs,
    ls.selection ->> 'companySize' as tamanho,
    coalesce(ls.selection ->> 'timing', dr.timing) as prazo,
    coalesce(ls.notes, dr.description) as descricao
  from public.deals d
  left join public.lead_drafts dr on dr.session_id = d.lead_session_id
  left join public.lead_submissions ls on ls.id = d.lead_id
  where d.lead_session_id is not null and d.lead_answers is null
)
update public.deals d
set lead_answers = (
  select jsonb_agg(v.x order by v.ord) filter (where coalesce(v.x ->> 'resposta', '') <> '')
  from (values
    (1, jsonb_build_object('pergunta', 'Tamanho', 'resposta', b.tamanho)),
    (2, jsonb_build_object(
      'pergunta', case when b.tag = 'sistemas-ia' then 'O que você precisa resolver?' else 'O que precisa' end,
      'resposta', (
        select string_agg(case n
          when 'centralizar' then 'Centralizar várias ferramentas num só sistema'
          when 'crm' then 'CRM / Vendas sob medida'
          when 'atendimento' then 'Atendimento com IA integrado'
          when 'operacao' then 'Operação / Pedidos / Logística'
          when 'relatorios' then 'Relatórios e BI internos'
          when 'nao_sei' then 'Ainda não sei direito'
          else n end, ', ')
        from jsonb_array_elements_text(case when jsonb_typeof(b.needs) = 'array' then b.needs else '[]'::jsonb end) n
      ))),
    (3, jsonb_build_object('pergunta', 'É urgente?', 'resposta', case b.prazo
      when 'urgente' then 'Sim, tenho urgência'
      when 'prazo' then 'Tenho um prazo em mente'
      when 'normal' then 'Não, sem pressa'
      else b.prazo end)),
    (4, jsonb_build_object('pergunta', 'Conte um pouco do seu desafio', 'resposta', b.descricao))
  ) as v(ord, x)
)
from base b
where b.id = d.id;

-- As notas geradas pelo sistema saem: tudo o que diziam agora está nos campos
-- acima. Nota escrita pela equipe não começa com a marca e fica como está.
update public.deals set notes = null where notes like '[Formulário do site]%';
