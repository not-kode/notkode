'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { monthlyDescription, pendingMonthly, type RecurringEng } from './recurring';
import { syncRecurringReceivables } from './recurring-sync';

// Dois eixos independentes do contrato:
//   • status (etapa de entrega) e lifecycle (ciclo de vida comercial).
const STAGE_STATUS = ['aguardando', 'onboarding', 'em_desenvolvimento', 'revisao', 'entregue'];
const LIFECYCLE = ['ativo', 'pausado', 'churn', 'encerrado'];
// Enum receivable_status no banco.
const RECEIVABLE_STATUS = ['pendente', 'recebido', 'atrasado', 'cancelado'];

/**
 * Contratos e parcelas alimentam três telas: o Financeiro, a ficha do cliente e
 * os KPIs da Visão geral. Qualquer escrita revalida as três.
 */
function revalidateFinance(): void {
  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
  revalidatePath('/admin');
}

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Cria um contrato (engagement). */
export async function createEngagement(formData: FormData): Promise<void> {
  const title = String(formData.get('title') ?? '').trim();
  const type = String(formData.get('type') ?? 'pontual');
  const status = String(formData.get('status') ?? 'aguardando');
  const lifecycleRaw = String(formData.get('lifecycle') ?? 'ativo');
  const lifecycle = LIFECYCLE.includes(lifecycleRaw) ? lifecycleRaw : 'ativo';
  if (!title || (type !== 'pontual' && type !== 'recorrente')) return;
  if (!STAGE_STATUS.includes(status)) return;

  const organization_id = String(formData.get('organization_id') ?? '') || null;
  const start_date = String(formData.get('start_date') ?? '') || null;
  const end_date = String(formData.get('end_date') ?? '') || null;

  const supabase = getSupabaseAdmin();
  await supabase.from('engagements').insert({
    title,
    type,
    status,
    lifecycle,
    organization_id,
    valor: num(formData.get('valor')),
    mrr: num(formData.get('mrr')),
    billing_cycle: String(formData.get('billing_cycle') ?? '') || null,
    start_date,
    end_date,
  });

  revalidateFinance();
}

/** Edita os dados básicos de um contrato: título, tipo, status, valores e vigência. */
export async function updateEngagementDetails(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const title = formData.get('title');
  if (title != null && String(title).trim()) patch.title = String(title).trim();

  const type = formData.get('type');
  if (type === 'pontual' || type === 'recorrente') patch.type = type;

  const status = formData.get('status');
  if (status != null && STAGE_STATUS.includes(String(status))) patch.status = String(status);

  const lifecycle = formData.get('lifecycle');
  if (lifecycle != null && LIFECYCLE.includes(String(lifecycle))) patch.lifecycle = String(lifecycle);

  if (formData.has('mrr')) patch.mrr = num(formData.get('mrr'));
  if (formData.has('valor')) patch.valor = num(formData.get('valor'));
  // O que passa pela conta sem ser nosso. O formulário sempre manda o marcador
  // da nota, senão desmarcar a caixa não teria como chegar aqui.
  if (formData.has('repasse_valor')) patch.repasse_valor = num(formData.get('repasse_valor')) || null;
  if (formData.has('fiscal_present')) patch.precisa_nota = formData.get('precisa_nota') === 'on';
  if (formData.has('start_date')) patch.start_date = String(formData.get('start_date') ?? '') || null;
  if (formData.has('end_date')) patch.end_date = String(formData.get('end_date') ?? '') || null;

  const supabase = getSupabaseAdmin();
  await supabase.from('engagements').update(patch).eq('id', id);

  // Pausar, encerrar, mudar o valor ou encurtar a vigência tem que chegar nas
  // mensalidades que já estão lançadas lá na frente.
  await syncRecurringReceivables(id);

  revalidateFinance();
}

/** Exclui um contrato: remove a proposta anexa, as parcelas e o próprio contrato. */
export async function deleteEngagement(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();

  // Remove o arquivo da proposta do storage, se houver.
  const { data: eng } = await supabase.from('engagements').select('proposal_path').eq('id', id).single();
  if (eng?.proposal_path) await supabase.storage.from('propostas').remove([eng.proposal_path]);

  // Os pedidos de assinatura caem em cascata no banco, mas os arquivos deles
  // não: documento congelado, versão assinada, PDF e carimbo ficariam órfãos.
  const { data: arquivos } = await supabase.storage.from('assinaturas').list(id);
  if (arquivos?.length) {
    await supabase.storage.from('assinaturas').remove(arquivos.map((a) => `${id}/${a.name}`));
  }

  // Apaga as parcelas vinculadas antes do contrato (evita órfãos / FK).
  await supabase.from('receivables').delete().eq('engagement_id', id);
  await supabase.from('engagements').delete().eq('id', id);

  revalidateFinance();
}

/** Conclui um contrato: marca como entregue e registra a data de conclusão. */
export async function concludeEngagement(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const end_date = String(formData.get('end_date') ?? '') || new Date().toISOString().slice(0, 10);

  const supabase = getSupabaseAdmin();
  await supabase
    .from('engagements')
    .update({ status: 'entregue', lifecycle: 'encerrado', end_date, updated_at: new Date().toISOString() })
    .eq('id', id);

  // Contrato concluído não segue cobrando: as mensalidades futuras saem junto.
  await syncRecurringReceivables(id);

  revalidateFinance();
}

/** Desfaz a baixa de uma parcela: volta para pendente e limpa o pagamento. */
export async function unmarkReceivable(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();
  await supabase
    .from('receivables')
    .update({ status: 'pendente', paid_at: null, paid_amount: null, updated_at: new Date().toISOString() })
    .eq('id', id);

  revalidateFinance();
}

/** Cria uma parcela / cobrança (receivable). */
export async function createReceivable(formData: FormData): Promise<void> {
  const description = String(formData.get('description') ?? '').trim();
  const amount = num(formData.get('amount'));
  const due_date = String(formData.get('due_date') ?? '');
  if (amount == null || !due_date) return;

  const engagement_id = String(formData.get('engagement_id') ?? '') || null;
  const supabase = getSupabaseAdmin();

  // Se a parcela está ligada a um contrato, herda a organização dele.
  let organization_id: string | null = null;
  if (engagement_id) {
    const { data: eng } = await supabase
      .from('engagements')
      .select('organization_id')
      .eq('id', engagement_id)
      .single();
    organization_id = eng?.organization_id ?? null;
  }

  await supabase.from('receivables').insert({
    description: description || null,
    amount,
    due_date,
    engagement_id,
    organization_id,
    status: 'pendente',
  });

  revalidateFinance();
}

/** Marca uma parcela como recebida (baixa). Aceita data de pagamento retroativa. */
export async function markReceivablePaid(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const amount = num(formData.get('amount'));
  if (!id) return;
  const paid_at = String(formData.get('paid_at') ?? '') || new Date().toISOString().slice(0, 10);

  const supabase = getSupabaseAdmin();
  await supabase
    .from('receivables')
    .update({
      status: 'recebido',
      paid_at,
      paid_amount: amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  revalidateFinance();
}

/**
 * Edita uma parcela. Só toca nos campos presentes no formulário, então dá pra
 * usar tanto no formulário completo quanto num ajuste pontual.
 */
export async function updateReceivable(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (formData.has('description')) {
    patch.description = String(formData.get('description') ?? '').trim() || null;
  }
  if (formData.has('amount')) {
    const amount = num(formData.get('amount'));
    if (amount == null) return; // valor é obrigatório: não deixa gravar nulo
    patch.amount = amount;
  }
  if (formData.has('due_date')) {
    const due_date = String(formData.get('due_date') ?? '');
    if (!due_date) return; // vencimento é obrigatório
    patch.due_date = due_date;
  }

  // Trocar de contrato reatribui a organização (a parcela segue o contrato).
  if (formData.has('engagement_id')) {
    const engagement_id = String(formData.get('engagement_id') ?? '') || null;
    patch.engagement_id = engagement_id;
    if (engagement_id) {
      const { data: eng } = await supabase
        .from('engagements')
        .select('organization_id')
        .eq('id', engagement_id)
        .single();
      patch.organization_id = eng?.organization_id ?? null;
    }
  }

  if (formData.has('status')) {
    const status = String(formData.get('status') ?? '');
    if (!RECEIVABLE_STATUS.includes(status)) return;
    patch.status = status;
    if (status === 'recebido') {
      patch.paid_at = String(formData.get('paid_at') ?? '') || new Date().toISOString().slice(0, 10);
      // Sem valor recebido informado, assume o valor cheio da parcela.
      patch.paid_amount = num(formData.get('paid_amount')) ?? patch.amount ?? null;
      if (patch.paid_amount == null) {
        const { data: cur } = await supabase.from('receivables').select('amount').eq('id', id).single();
        patch.paid_amount = cur?.amount ?? null;
      }
    } else {
      // Qualquer status que não seja "recebido" limpa a baixa.
      patch.paid_at = null;
      patch.paid_amount = null;
    }
  }

  await supabase.from('receivables').update(patch).eq('id', id);

  revalidateFinance();
}

/**
 * Lança as mensalidades de um mês (YYYY-MM) para os contratos recorrentes que
 * ainda não têm parcela nele. Passe `engagement_id` para lançar só um contrato.
 * Idempotente: rodar duas vezes no mesmo mês não duplica nada.
 */
export async function generateMonthlyReceivables(formData: FormData): Promise<void> {
  const month = String(formData.get('month') ?? '');
  if (!/^\d{4}-\d{2}$/.test(month)) return;
  const only = String(formData.get('engagement_id') ?? '') || null;

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('engagements')
    .select('id, type, lifecycle, mrr, start_date, end_date, organization_id')
    .eq('type', 'recorrente');
  if (only) query = query.eq('id', only);
  const { data: engData } = await query;

  const engs = (engData ?? []) as (RecurringEng & { organization_id: string | null })[];
  if (engs.length === 0) return;

  // Histórico de vencimentos de cada contrato: define o dia habitual da cobrança
  // e evita lançar em duplicidade.
  const { data: recData } = await supabase
    .from('receivables')
    .select('engagement_id, due_date')
    .in('engagement_id', engs.map((e) => e.id));

  const dues = new Map<string, string[]>();
  for (const r of (recData ?? []) as { engagement_id: string | null; due_date: string }[]) {
    if (!r.engagement_id) continue;
    dues.set(r.engagement_id, [...(dues.get(r.engagement_id) ?? []), r.due_date]);
  }

  const novas = pendingMonthly(engs, dues, month).map(({ eng, due_date }) => ({
    description: monthlyDescription(month),
    amount: eng.mrr,
    due_date,
    engagement_id: eng.id,
    organization_id: eng.organization_id,
    status: 'pendente',
  }));
  if (novas.length === 0) return;

  await supabase.from('receivables').insert(novas);

  revalidateFinance();
}

/**
 * Lança de uma vez o histórico de mensalidades de um contrato, de um mês a
 * outro, já com a baixa na data do próprio vencimento.
 *
 * Existe porque o sistema entrou em uso depois de o cliente já estar pagando: o
 * mês a mês da Visão geral só conhece o que virou parcela, então tudo que veio
 * antes aparecia como zero. Diferente do lançamento normal, aqui o início da
 * vigência não barra nada — é justamente o passado que ele não cobre; se o
 * histórico começa antes do que está cadastrado, a vigência recua junto.
 *
 * Mês que já tem parcela do contrato é pulado, então rodar de novo não duplica.
 */
export async function backfillMonthlyReceivables(formData: FormData): Promise<void> {
  const id = String(formData.get('engagement_id') ?? '');
  const from = String(formData.get('from_month') ?? '');
  const to = String(formData.get('to_month') ?? '');
  if (!id || !/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to) || from > to) return;

  const supabase = getSupabaseAdmin();
  const { data: eng } = await supabase
    .from('engagements')
    .select('id, mrr, start_date, organization_id')
    .eq('id', id)
    .single();
  if (!eng) return;

  const amount = num(formData.get('amount')) ?? eng.mrr;
  if (amount == null || amount <= 0) return;
  const darBaixa = String(formData.get('pago') ?? '') === 'on';
  const hoje = new Date().toISOString().slice(0, 10);

  const { data: recData } = await supabase
    .from('receivables')
    .select('due_date')
    .eq('engagement_id', id);
  const dues = (recData ?? []).map((r) => r.due_date as string);
  const jaTem = new Set(dues.map((d) => d.slice(0, 7)));

  // Dia da cobrança: o mesmo das parcelas que já existem; sem histórico, o dia
  // do início da vigência; sem nada disso, dia 10 (o padrão da casa).
  const diaRef = Number((dues.slice().sort()[0] ?? eng.start_date ?? '')?.slice(8, 10));
  const dia = diaRef >= 1 && diaRef <= 31 ? diaRef : 10;

  const meses: string[] = [];
  for (let m = from; m <= to && meses.length <= 60; m = proximoMes(m)) meses.push(m);

  const novas = meses
    .filter((m) => !jaTem.has(m))
    .map((m) => {
      const [y, mm] = m.split('-').map(Number);
      const ultimoDia = new Date(Date.UTC(y, mm, 0)).getUTCDate();
      const due_date = `${m}-${String(Math.min(dia, ultimoDia)).padStart(2, '0')}`;
      // Baixa só no que já venceu: parcela do mês que vem não pode nascer paga.
      const pago = darBaixa && due_date <= hoje;
      return {
        description: monthlyDescription(m),
        amount,
        due_date,
        engagement_id: id,
        organization_id: eng.organization_id,
        status: pago ? 'recebido' : 'pendente',
        paid_at: pago ? due_date : null,
        paid_amount: pago ? amount : null,
      };
    });
  if (novas.length === 0) return;

  await supabase.from('receivables').insert(novas);

  // A vigência acompanha o histórico: sem isso o contrato diria que começou
  // depois de parcelas que ele mesmo acabou de gerar.
  const primeiro = novas[0].due_date;
  if (!eng.start_date || primeiro < eng.start_date) {
    await supabase
      .from('engagements')
      .update({ start_date: primeiro, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  revalidateFinance();
}

/** Mês seguinte de um YYYY-MM. */
function proximoMes(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

/** Exclui uma parcela. */
export async function deleteReceivable(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();
  await supabase.from('receivables').delete().eq('id', id);

  revalidateFinance();
}
