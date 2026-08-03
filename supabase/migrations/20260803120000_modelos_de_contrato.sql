-- Modelos de contrato: o texto padrão por tipo de serviço.
--
-- Até aqui as cláusulas viviam no código, iguais para todo cliente, e só objeto,
-- obrigações e renovação eram editáveis por contrato. Como cada serviço tem o
-- seu contrato (site é um, social media é outro), o modelo passa a guardar a
-- lista inteira de cláusulas, e o contrato só carrega o que muda de cliente para
-- cliente: CNPJ, valor, datas e escopo.
--
-- As cláusulas ficam em jsonb, como lista ordenada de blocos:
--   [{ "tipo": "texto", "titulo": "Do Objeto", "texto": "{{escopo}}" },
--    { "tipo": "obrigacoes_cliente", "titulo": "Das Obrigações da Contratante" },
--    { "tipo": "pagamento", "titulo": "Do Valor e Condições de Pagamento" }]
-- Blocos de tipo próprio (pagamento, vigência, obrigações, assinatura
-- eletrônica) são montados pelo sistema com os dados do contrato; os de texto
-- aceitam marcadores como {{cliente}} e {{valor_mensal}}. A numeração das
-- cláusulas é sempre calculada na hora de gerar, pela ordem da lista.

create table if not exists public.contract_templates (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  nome          text not null,
  descricao     text,
  ativo         boolean not null default true,
  padrao        boolean not null default false,
  ordem         smallint not null default 0,
  escopo_padrao text,
  clausulas     jsonb not null default '[]'::jsonb
);

alter table public.contract_templates enable row level security;

comment on table public.contract_templates is
  'Modelo de contrato por tipo de serviço: a lista ordenada de cláusulas e o escopo sugerido.';
comment on column public.contract_templates.clausulas is
  'Lista ordenada de blocos. tipo: texto | obrigacoes_cliente | obrigacoes_contratada | pagamento | vigencia | assinatura_eletronica | foro.';
comment on column public.contract_templates.padrao is
  'O modelo usado quando o contrato não escolheu nenhum. Só um fica marcado.';
comment on column public.contract_templates.escopo_padrao is
  'Texto sugerido para o objeto do contrato, copiado ao aplicar o modelo.';

create index if not exists contract_templates_ativo_idx on public.contract_templates (ativo, ordem);

-- Só um modelo padrão por vez.
create unique index if not exists contract_templates_padrao_idx
  on public.contract_templates (padrao) where padrao;

-- Qual modelo cada contrato usa. Nulo cai no modelo padrão.
alter table public.engagements
  add column if not exists contract_template_id uuid references public.contract_templates(id) on delete set null;

comment on column public.engagements.contract_template_id is
  'Modelo de contrato usado para gerar o documento. Nulo usa o modelo marcado como padrão.';
