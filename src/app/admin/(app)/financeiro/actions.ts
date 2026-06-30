'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const ENGAGEMENT_STATUS = [
  'aguardando', 'onboarding', 'em_desenvolvimento', 'revisao',
  'entregue', 'encerrado', 'ativo', 'pausado', 'churn',
];

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
  if (!title || (type !== 'pontual' && type !== 'recorrente')) return;
  if (!ENGAGEMENT_STATUS.includes(status)) return;

  const organization_id = String(formData.get('organization_id') ?? '') || null;
  const start_date = String(formData.get('start_date') ?? '') || null;

  const supabase = getSupabaseAdmin();
  await supabase.from('engagements').insert({
    title,
    type,
    status,
    organization_id,
    valor: num(formData.get('valor')),
    mrr: num(formData.get('mrr')),
    billing_cycle: String(formData.get('billing_cycle') ?? '') || null,
    start_date,
  });

  revalidatePath('/admin/financeiro');
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
}
