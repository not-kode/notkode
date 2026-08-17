'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ONBOARDING_TEMPLATES } from '@/lib/onboarding-schema';

/** Cria um briefing de onboarding (cliente + produto + template) e gera o link público. */
export async function createBriefing(formData: FormData): Promise<void> {
  const organization_id = String(formData.get('organization_id') ?? '');
  const product_name = String(formData.get('product_name') ?? '').trim();
  const scope = String(formData.get('scope') ?? '').trim() || null;
  const templateRaw = String(formData.get('template_key') ?? 'produto');
  if (!organization_id || !product_name) return;
  const template_key = templateRaw in ONBOARDING_TEMPLATES ? templateRaw : 'produto';

  const supabase = getSupabaseAdmin();
  await supabase.from('onboarding_briefings').insert({
    organization_id,
    product_name,
    scope,
    template_key,
    token: randomUUID(),
    status: 'rascunho',
  });

  revalidatePath('/admin/onboarding');
}

/**
 * Apaga um briefing de vez, com os anexos dele. Existe porque link criado
 * errado ou em dobro ficava na tela para sempre: o cliente recebia dois links
 * do mesmo projeto e respondia metade em cada um. A confirmação é na tela, e
 * ela diz quantas respostas vão embora.
 */
export async function apagarBriefing(id: string): Promise<void> {
  if (!id) return;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('onboarding_briefings')
    .select('token')
    .eq('id', id)
    .maybeSingle();

  // Os anexos moram numa pasta por token; sem isso eles ficariam órfãos no bucket.
  if (data?.token) {
    const { data: arquivos } = await supabase.storage.from('onboarding').list(data.token);
    const paths = (arquivos ?? []).filter((f) => f.name).map((f) => `${data.token}/${f.name}`);
    if (paths.length > 0) await supabase.storage.from('onboarding').remove(paths);
  }

  await supabase.from('onboarding_briefings').delete().eq('id', id);

  revalidatePath('/admin/onboarding');
  revalidatePath('/admin/clientes');
}
