'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/** Cria um contato manualmente (+ canais e vínculo de empresa, se informados). */
export async function createContact(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const email = String(formData.get('email') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();

  const supabase = getSupabaseAdmin();

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({ name, source: 'manual', locale: 'pt' })
    .select('id')
    .single();
  if (error || !contact) throw new Error(`Falha ao criar contato: ${error?.message}`);

  const channels: { contact_id: string; kind: string; value: string; is_primary: boolean }[] = [];
  if (email) channels.push({ contact_id: contact.id, kind: 'email', value: email, is_primary: true });
  if (whatsapp) channels.push({ contact_id: contact.id, kind: 'whatsapp', value: whatsapp, is_primary: false });
  if (channels.length) await supabase.from('contact_channels').insert(channels);

  if (company) {
    // Reaproveita empresa existente (case-insensitive) ou cria.
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .ilike('name', company)
      .limit(1)
      .maybeSingle();
    let orgId = existing?.id ?? null;
    if (!orgId) {
      const { data: org } = await supabase.from('organizations').insert({ name: company }).select('id').single();
      orgId = org?.id ?? null;
    }
    if (orgId) {
      await supabase
        .from('contact_organizations')
        .insert({ contact_id: contact.id, organization_id: orgId, is_primary: true });
    }
  }

  revalidatePath('/admin/clientes');
}
