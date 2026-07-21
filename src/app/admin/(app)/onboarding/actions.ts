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
