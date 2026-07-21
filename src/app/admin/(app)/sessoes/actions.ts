'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/** Apaga todos os chunks de gravação de uma sessão (não mexe nos eventos de analytics). */
export async function deleteRecording(formData: FormData): Promise<void> {
  const session_id = String(formData.get('session_id') ?? '');
  if (!session_id) return;
  const supabase = getSupabaseAdmin();
  await supabase.from('session_recordings').delete().eq('session_id', session_id);
  revalidatePath('/admin/sessoes');
}
