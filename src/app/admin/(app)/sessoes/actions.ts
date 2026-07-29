'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/** Apaga todos os chunks de gravação de uma sessão (não mexe nos eventos de analytics). */
export async function deleteRecording(formData: FormData): Promise<void> {
  const session_id = String(formData.get('session_id') ?? '');
  if (!session_id) return;
  const supabase = getSupabaseAdmin();
  await supabase.from('session_recordings').delete().eq('session_id', session_id);
  await supabase.from('session_watched').delete().eq('session_id', session_id);
  revalidatePath('/admin/sessoes');
}

/** Liga/desliga o "já vi essa" da lista. O estado vem do formulário, não do banco. */
export async function toggleWatched(formData: FormData): Promise<void> {
  const session_id = String(formData.get('session_id') ?? '');
  if (!session_id) return;
  const vista = String(formData.get('watched') ?? '') === 'on';
  const supabase = getSupabaseAdmin();
  if (vista) {
    await supabase.from('session_watched').delete().eq('session_id', session_id);
  } else {
    await supabase.from('session_watched').upsert({ session_id, watched_at: new Date().toISOString() });
  }
  revalidatePath('/admin/sessoes');
}

/**
 * Marca como vista sozinha quando a gravação é aberta no player. Assistir É ver;
 * obrigar a voltar na lista e clicar no quadradinho seria trabalho manual à toa.
 * A marcação continua reversível pelo próprio quadradinho.
 */
export async function markWatched(session_id: string): Promise<void> {
  if (!session_id) return;
  const supabase = getSupabaseAdmin();
  await supabase.from('session_watched').upsert({ session_id, watched_at: new Date().toISOString() });
  revalidatePath('/admin/sessoes');
}
