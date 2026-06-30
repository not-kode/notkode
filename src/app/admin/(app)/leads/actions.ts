'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type Selection = Record<string, unknown> & { company?: unknown };

/**
 * Promove uma submissão do site para o CRM:
 *   lead_submissions → contact (+ canais email/whatsapp) → deal (stage: novo)
 * e, se houver empresa, organization + vínculo. Carimba promoted_at/contact_id/deal_id.
 * Idempotente: se já promovida, não duplica.
 */
export async function promoteLead(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();

  const { data: lead, error: leadErr } = await supabase
    .from('lead_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (leadErr || !lead || lead.promoted_at) {
    revalidatePath('/admin/leads');
    return;
  }

  const selection = (lead.selection ?? {}) as Selection;
  const company = typeof selection.company === 'string' ? selection.company.trim() : '';

  // 1. Contato
  const { data: contact, error: contactErr } = await supabase
    .from('contacts')
    .insert({
      name: lead.name,
      source: 'site',
      locale: 'pt',
      notes: lead.notes,
    })
    .select('id')
    .single();
  if (contactErr || !contact) throw new Error(`Falha ao criar contato: ${contactErr?.message}`);

  // 2. Canais (email + whatsapp), o que existir
  const channels: { contact_id: string; kind: string; value: string; is_primary: boolean }[] = [];
  if (lead.email) channels.push({ contact_id: contact.id, kind: 'email', value: lead.email, is_primary: true });
  if (lead.whatsapp) channels.push({ contact_id: contact.id, kind: 'whatsapp', value: lead.whatsapp, is_primary: false });
  if (channels.length) await supabase.from('contact_channels').insert(channels);

  // 3. Organização (opcional) + vínculo
  let organizationId: string | null = null;
  if (company) {
    const { data: org } = await supabase
      .from('organizations')
      .insert({ name: company })
      .select('id')
      .single();
    if (org) {
      organizationId = org.id;
      await supabase
        .from('contact_organizations')
        .insert({ contact_id: contact.id, organization_id: org.id, is_primary: true });
    }
  }

  // 4. Negócio (deal) no topo do pipeline
  const valor = lead.estimated_max ?? lead.estimated_min ?? 0;
  const { data: deal, error: dealErr } = await supabase
    .from('deals')
    .insert({
      organization_id: organizationId,
      contact_id: contact.id,
      lead_id: lead.id,
      stage: 'novo',
      source: 'site',
      service_tag: lead.service_tag,
      valor_pontual: valor,
      notes: lead.notes,
    })
    .select('id')
    .single();
  if (dealErr || !deal) throw new Error(`Falha ao criar negócio: ${dealErr?.message}`);

  // 5. Carimba a submissão como promovida
  await supabase
    .from('lead_submissions')
    .update({ promoted_at: new Date().toISOString(), contact_id: contact.id, deal_id: deal.id })
    .eq('id', lead.id);

  revalidatePath('/admin/leads');
}
