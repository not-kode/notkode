-- Prazo de execução do contrato, separado do calendário de cobrança.
--
-- start_date e end_date do contrato são as datas do dinheiro: o financeiro usa
-- as duas para gerar e limitar as mensalidades, e no contrato pontual elas
-- nascem da primeira e da última parcela. O documento então dizia "vigência de
-- 4 meses" para um projeto de 4 semanas, porque leu o parcelamento como se
-- fosse prazo de obra.
--
-- Em contrato recorrente as duas coisas coincidem e nada muda. Em projeto
-- fechado elas são diferentes, e a cláusula de prazo passa a usar estas datas.
-- Nulas, o documento diz que o contrato vigora até a conclusão e a aprovação
-- final dos serviços, que é o certo quando a data de início ainda depende do
-- aceite e do envio do material.

alter table public.engagements
  add column if not exists execution_start date,
  add column if not exists execution_end   date;

comment on column public.engagements.execution_start is
  'Início da execução do projeto. Só para contrato pontual: o recorrente usa start_date.';
comment on column public.engagements.execution_end is
  'Término previsto da execução. Nulo faz o contrato vigorar até a aprovação final.';
