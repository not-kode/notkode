'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Dois eixos independentes do contrato:
//   • status (etapa de entrega) e lifecycle (ciclo de vida comercial).
const STAGE_STATUS = ['aguardando', 'onboarding', 'em_desenvolvimento', 'revisao', 'entregue'];
const LIFECYCLE = ['ativo', 'pausado', 'churn', 'encerrado'];

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

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
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
  if (formData.has('start_date')) patch.start_date = String(formData.get('start_date') ?? '') || null;
  if (formData.has('end_date')) patch.end_date = String(formData.get('end_date') ?? '') || null;

  const supabase = getSupabaseAdmin();
  await supabase.from('engagements').update(patch).eq('id', id);

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
}

/** Exclui um contrato: remove a proposta anexa, as parcelas e o próprio contrato. */
export async function deleteEngagement(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();

  // Remove o arquivo da proposta do storage, se houver.
  const { data: eng } = await supabase.from('engagements').select('proposal_path').eq('id', id).single();
  if (eng?.proposal_path) await supabase.storage.from('propostas').remove([eng.proposal_path]);

  // Apaga as parcelas vinculadas antes do contrato (evita órfãos / FK).
  await supabase.from('receivables').delete().eq('engagement_id', id);
  await supabase.from('engagements').delete().eq('id', id);

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
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

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
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

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
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

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
}

/** Marca uma parcela como recebida (baixa). */
export async function markReceivablePaid(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const amount = num(formData.get('amount'));
  if (!id) return;

  const supabase = getSupabaseAdmin();
  await supabase
    .from('receivables')
    .update({
      status: 'recebido',
      paid_at: new Date().toISOString().slice(0, 10),
      paid_amount: amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
}
