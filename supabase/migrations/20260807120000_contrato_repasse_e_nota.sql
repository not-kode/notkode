-- O que não é nosso, no contrato.
--
-- O funil já sabia descontar o repasse ao parceiro e os 6% da nota: os números
-- do pipeline são líquidos, "o que entra de verdade". O financeiro não sabia, e
-- mostrava o bruto das parcelas. Os dois nunca batiam, e a diferença aparecia
-- justamente na hora em que o negócio virava contrato.
--
-- Agora o contrato carrega os mesmos dois campos. O valor da parcela continua
-- bruto, que é o que o cliente paga; o líquido é uma leitura em cima dele.
alter table public.engagements add column if not exists repasse_valor numeric;
alter table public.engagements add column if not exists precisa_nota boolean not null default false;

comment on column public.engagements.repasse_valor is
  'Repasse ao parceiro. No contrato recorrente é por mês; no pontual é do contrato inteiro, rateado pelas parcelas.';
comment on column public.engagements.precisa_nota is
  'Cliente precisa de nota fiscal: desconta a alíquota do que entra.';

-- Contrato que nasceu de um negócio herda o que já estava preenchido no card.
-- Só onde ninguém mexeu ainda, para não passar por cima de ajuste manual.
update public.engagements e
   set repasse_valor = d.repasse_valor,
       precisa_nota  = coalesce(d.precisa_nota, false)
  from public.deal_engagements de
  join public.deals d on d.id = de.deal_id
 where de.engagement_id = e.id
   and e.repasse_valor is null
   and e.precisa_nota is false;
