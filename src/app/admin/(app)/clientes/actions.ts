'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Dados cadastrais da empresa (usados para gerar contratos).
const ORG_FIELDS = [
  'name', 'legal_name', 'tax_id', 'state_registration',
  'address_street', 'address_number', 'address_district',
  'address_city', 'address_state', 'address_zip', 'legal_rep', 'legal_rep_cpf',
] as const;

/** Sobe o arquivo da proposta e o vincula ao contrato (bucket privado 'propostas'). */
export async function uploadProposal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const file = formData.get('file');
  if (!id || !(file instanceof File) || file.size === 0) return;

  const supabase = getSupabaseAdmin();
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${id}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage.from('propostas').upload(path, bytes, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw new Error(`Falha no upload: ${error.message}`);

  await supabase
    .from('engagements')
    .update({ proposal_path: path, proposal_name: file.name, updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/clientes');
}

/** Remove a proposta anexada ao contrato. */
export async function removeProposal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('engagements').select('proposal_path').eq('id', id).single();
  if (data?.proposal_path) await supabase.storage.from('propostas').remove([data.proposal_path]);
  await supabase
    .from('engagements')
    .update({ proposal_path: null, proposal_name: null, updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/clientes');
}

/** Edita objeto/escopo e renovação de um contrato (para gerar o documento). */
export async function updateEngagementContract(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (formData.get('scope') != null) patch.scope = String(formData.get('scope')).trim() || null;
  if (formData.get('renewal_note') != null) patch.renewal_note = String(formData.get('renewal_note')).trim() || null;
  if (formData.get('client_obligations') != null) patch.client_obligations = String(formData.get('client_obligations')).trim() || null;
  if (formData.get('provider_obligations') != null) patch.provider_obligations = String(formData.get('provider_obligations')).trim() || null;

  const supabase = getSupabaseAdmin();
  await supabase.from('engagements').update(patch).eq('id', id);
  revalidatePath('/admin/clientes');
}

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
