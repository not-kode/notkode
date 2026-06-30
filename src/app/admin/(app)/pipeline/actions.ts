'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DEAL_STAGES, type DealStage } from './stages';

export async function moveDealStage(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const stage = String(formData.get('stage') ?? '');
  if (!id || !DEAL_STAGES.includes(stage as DealStage)) return;

  const supabase = getSupabaseAdmin();
  await supabase.from('deals').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);

  revalidatePath('/admin/pipeline');
}

/** Edita valor e observações de um negócio (a partir do drawer de detalhe). */
export async function updateDeal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const valorRaw = formData.get('valor_pontual');
  if (valorRaw != null) {
    const n = Number(String(valorRaw).replace(/\./g, '').replace(',', '.'));
    patch.valor_pontual = Number.isFinite(n) ? n : 0;
  }
  if (formData.get('notes') != null) patch.notes = String(formData.get('notes')) || null;

  const supabase = getSupabaseAdmin();
  await supabase.from('deals').update(patch).eq('id', id);

  revalidatePath('/admin/pipeline');
}
