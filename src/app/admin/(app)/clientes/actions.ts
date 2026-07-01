'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Dados cadastrais da empresa (usados para gerar contratos).
const ORG_FIELDS = [
  'name', 'legal_name', 'tax_id', 'state_registration',
  'address_street', 'address_number', 'address_district',
  'address_city', 'address_state', 'address_zip', 'legal_rep',
] as const;

/** Atualiza dados cadastrais de uma empresa (a partir do drawer do cliente). */
export async function updateOrganization(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const f of ORG_FIELDS) {
    const v = formData.get(f);
    if (v != null) patch[f] = String(v).trim() || null;
  }

  const supabase = getSupabaseAdmin();
  await supabase.from('organizations').update(patch).eq('id', id);

  revalidatePath('/admin/clientes');
  revalidatePath('/admin/pipeline');
}

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
