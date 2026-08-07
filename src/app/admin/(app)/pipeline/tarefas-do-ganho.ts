/**
 * O checklist que todo negócio ganho carrega.
 *
 * Ganhar a venda começa sempre o mesmo trabalho: gerar o contrato, mandar para
 * assinatura, enviar o briefing, cobrar o retorno dele e receber a primeira
 * parcela. Isso vivia na cabeça, sem prazo, e o que não tem data ninguém sabe se
 * está atrasado. Agora nasce sozinho no ganho, com prazo contado a partir do dia
 * do fechamento.
 *
 * Enquanto o contrato não existe, as tarefas ficam penduradas no próprio
 * negócio (project_tasks.deal_id). Gerar o contrato as transfere para ele.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { RESPONSAVEL_PADRAO } from '../entregas/status';

type Db = SupabaseClient;

/** Tarefa do pacote: `dias` são dias corridos a partir do ganho. */
type Padrao = {
  chave: string;
  titulo: string;
  dias: number;
  notas: string;
};

/**
 * A tarefa de gerar contrato vem primeiro porque destrava as outras: sem
 * contrato no financeiro não há documento para assinar nem parcela para cobrar.
 */
export const TAREFA_GERAR_CONTRATO = 'Gerar o contrato no financeiro';

const PACOTE: Padrao[] = [
  {
    chave: 'contrato',
    titulo: TAREFA_GERAR_CONTRATO,
    dias: 1,
    notas: 'Botão "Gerar contrato" no card do negócio: leva valor, proposta e parcelas para o financeiro.',
  },
  {
    chave: 'assinatura',
    titulo: 'Enviar contrato para assinatura',
    dias: 2,
    notas: 'Conferir o cadastro do cliente (CNPJ, endereço, representante), preparar o documento e mandar assinar.',
  },
  {
    chave: 'briefing',
    titulo: 'Enviar briefing de onboarding',
    dias: 2,
    notas: 'Criar o briefing na ficha do cliente e mandar o link para o cliente responder.',
  },
  {
    chave: 'retorno',
    titulo: 'Retorno do briefing do cliente',
    dias: 9,
    notas: 'O cliente tem 7 dias para responder. Sem resposta até aqui, cobrar.',
  },
  {
    chave: 'pagamento',
    titulo: 'Receber o 1º pagamento',
    dias: 7,
    notas: 'Sem parcela combinada no card, o prazo fica em uma semana do fechamento.',
  },
];

/**
 * Prazo `n` dias corridos à frente, encostando no dia útil seguinte quando cai
 * no fim de semana. Corridos, e não úteis, porque "o cliente tem 7 dias para
 * responder" é o que foi combinado com ele, e ele conta no calendário.
 */
export function prazoEm(n: number, base = new Date()): string {
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + n));
  if (d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 2);
  if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Põe o checklist no negócio recém-ganho. Não repete: negócio que já tem tarefa
 * própria (ganho desfeito e refeito, dois cliques seguidos) fica como está.
 *
 * `pularContrato` serve para quando o contrato já foi criado junto com o ganho:
 * a tarefa de gerá-lo nasceria cumprida, só sujando o quadro.
 */
export async function criarTarefasDoGanho(
  db: Db,
  dealId: string,
  { pularContrato = false }: { pularContrato?: boolean } = {},
): Promise<void> {
  const { data: existentes } = await db
    .from('project_tasks')
    .select('id')
    .eq('deal_id', dealId)
    .limit(1);
  if (existentes && existentes.length > 0) return;

  // Primeira parcela combinada no card manda no prazo da cobrança: é a data que
  // já foi acertada com o cliente.
  const { data: parcelas } = await db
    .from('deal_installments')
    .select('due_date')
    .eq('deal_id', dealId)
    .order('due_date', { ascending: true })
    .limit(1);
  const primeiraParcela = (parcelas ?? [])[0]?.due_date as string | undefined;

  const pacote = pularContrato ? PACOTE.filter((p) => p.chave !== 'contrato') : PACOTE;

  const linhas = pacote.map((p, i) => ({
    deal_id: dealId,
    title: p.titulo,
    notes: p.notas,
    status: 'a_fazer',
    priority: 'alta',
    due_date: p.chave === 'pagamento' && primeiraParcela ? primeiraParcela : prazoEm(p.dias),
    assignee: RESPONSAVEL_PADRAO,
    // Checklist de bastidor (contrato, cobrança): não é o cronograma que o
    // cliente acompanha pelo link.
    client_visible: false,
    sort: i,
  }));

  await db.from('project_tasks').insert(linhas);
}

/**
 * Contrato gerado: as tarefas do negócio passam a ser dele, e a de gerar o
 * contrato já nasce cumprida — o clique que trouxe o contrato foi ela.
 */
export async function adotarTarefasDoNegocio(db: Db, dealId: string, engagementId: string): Promise<void> {
  const { data: tarefas } = await db
    .from('project_tasks')
    .select('id, title, status')
    .eq('deal_id', dealId);
  if (!tarefas || tarefas.length === 0) return;

  // A ordem dentro do contrato continua depois do que já existe lá.
  const { data: ultima } = await db
    .from('project_tasks')
    .select('sort')
    .eq('engagement_id', engagementId)
    .order('sort', { ascending: false })
    .limit(1);
  const base = ((ultima?.[0]?.sort as number | undefined) ?? -1) + 1;

  const agora = new Date().toISOString();
  for (const [i, t] of tarefas.entries()) {
    const feita = t.title === TAREFA_GERAR_CONTRATO && t.status !== 'feito';
    await db
      .from('project_tasks')
      .update({
        engagement_id: engagementId,
        deal_id: null,
        sort: base + i,
        updated_at: agora,
        ...(feita ? { status: 'feito', done_at: agora } : {}),
      })
      .eq('id', t.id);
  }
}
