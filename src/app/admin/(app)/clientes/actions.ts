'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { mimeDaProposta } from '@/lib/proposta-mime';
import { extrairEscopo } from '@/lib/escopo-da-proposta';

// Dados cadastrais da empresa (usados para gerar contratos).
const ORG_FIELDS = [
  'name', 'site', 'instagram', 'legal_name', 'tax_id', 'state_registration',
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
    contentType: mimeDaProposta(file.name, file.type || 'application/octet-stream'),
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

/**
 * Cadastra um cliente na mão: empresa + contrato inicial (+ contato, se vier).
 *
 * O contrato não é opcional de propósito: a lista de Clientes mostra quem tem
 * contrato, então uma empresa solta seria cadastrada e sumiria da tela. Quem só
 * está negociando entra pelo funil, não por aqui.
 */
export async function createClient(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const supabase = getSupabaseAdmin();

  // Não duplica empresa já cadastrada (o funil pode ter criado antes).
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .ilike('name', name)
    .limit(1)
    .maybeSingle();

  let orgId = existing?.id ?? null;
  if (!orgId) {
    const patch: Record<string, unknown> = { name };
    for (const f of ORG_FIELDS) {
      if (f === 'name') continue;
      const v = formData.get(f);
      if (v != null && String(v).trim()) patch[f] = String(v).trim();
    }
    const { data: org, error } = await supabase.from('organizations').insert(patch).select('id').single();
    if (error || !org) throw new Error(`Falha ao criar cliente: ${error?.message}`);
    orgId = org.id;
  }

  // Contato: reaproveita o fluxo de contato manual (contato + canais + vínculo).
  const contactName = String(formData.get('contact_name') ?? '').trim();
  const email = String(formData.get('contact_email') ?? '').trim();
  const whatsapp = String(formData.get('contact_whatsapp') ?? '').trim();
  if (contactName) {
    const { data: contact } = await supabase
      .from('contacts')
      .insert({ name: contactName, source: 'manual', locale: 'pt' })
      .select('id')
      .single();
    if (contact) {
      const channels: { contact_id: string; kind: string; value: string; is_primary: boolean }[] = [];
      if (email) channels.push({ contact_id: contact.id, kind: 'email', value: email, is_primary: true });
      if (whatsapp) channels.push({ contact_id: contact.id, kind: 'whatsapp', value: whatsapp, is_primary: false });
      if (channels.length) await supabase.from('contact_channels').insert(channels);
      await supabase
        .from('contact_organizations')
        .insert({ contact_id: contact.id, organization_id: orgId, is_primary: true });
    }
  }

  const typeRaw = String(formData.get('type') ?? 'recorrente');
  const numero = (v: FormDataEntryValue | null) => {
    if (v == null || v === '') return null;
    const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  await supabase.from('engagements').insert({
    organization_id: orgId,
    title: String(formData.get('title') ?? '').trim() || 'Contrato',
    type: typeRaw === 'pontual' ? 'pontual' : 'recorrente',
    status: 'aguardando',
    lifecycle: 'ativo',
    mrr: numero(formData.get('mrr')),
    valor: numero(formData.get('valor')),
    start_date: String(formData.get('start_date') ?? '') || null,
    end_date: String(formData.get('end_date') ?? '') || null,
  });

  revalidatePath('/admin/clientes');
  revalidatePath('/admin/financeiro');
  revalidatePath('/admin');
}

/**
 * Exclui um cliente e tudo que está pendurado nele: contratos (com parcelas,
 * assinaturas, propostas e tarefas de projeto, que caem em cascata), briefings
 * com seus anexos, negócios do funil e os vínculos de contato.
 *
 * A limpeza é explícita porque no banco quase toda FK para organizations é
 * "on delete set null": apagar só a empresa deixaria contrato e parcela órfãos,
 * ainda contando no financeiro sem dono nenhum. Os contatos ficam no banco (o
 * mesmo contato pode ser lead de outra coisa); só o vínculo com a empresa cai.
 */
export async function deleteOrganization(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();

  // Contratos: tira a proposta do storage e as parcelas antes (FK set null).
  const { data: engs } = await supabase
    .from('engagements')
    .select('id, proposal_path')
    .eq('organization_id', id);
  const engIds = (engs ?? []).map((e) => e.id);
  const propostas = (engs ?? []).map((e) => e.proposal_path).filter((p): p is string => !!p);
  if (propostas.length) await supabase.storage.from('propostas').remove(propostas);
  if (engIds.length) await supabase.from('receivables').delete().in('engagement_id', engIds);
  if (engIds.length) await supabase.from('engagements').delete().in('id', engIds);

  // Parcelas avulsas da empresa, sem contrato ligado.
  await supabase.from('receivables').delete().eq('organization_id', id);

  // Briefings: apaga os arquivos enviados e depois os registros.
  const { data: briefs } = await supabase
    .from('onboarding_briefings')
    .select('id, token')
    .eq('organization_id', id);
  for (const b of briefs ?? []) {
    const { data: list } = await supabase.storage.from('onboarding').list(b.token);
    const paths = (list ?? []).filter((f) => f.name).map((f) => `${b.token}/${f.name}`);
    if (paths.length) await supabase.storage.from('onboarding').remove(paths);
  }
  await supabase.from('onboarding_briefings').delete().eq('organization_id', id);

  // Negócios do funil (parcelas e itens do negócio caem em cascata) e notas.
  await supabase.from('deals').delete().eq('organization_id', id);
  await supabase.from('notes').delete().eq('organization_id', id);

  // A empresa por último: contact_organizations cai em cascata com ela.
  await supabase.from('organizations').delete().eq('id', id);

  revalidatePath('/admin/clientes');
  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/pipeline');
  revalidatePath('/admin');
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

/**
 * Lê a proposta anexada e devolve o que ela promete entregar, para virar a
 * Cláusula 1 do contrato. Não grava nada: quem decide se o texto serve é quem
 * está olhando, e a proposta às vezes traz opção A e opção B.
 */
export async function escopoDaProposta(engagementId: string): Promise<{ texto: string; aviso?: string }> {
  if (!engagementId) return { texto: '', aviso: 'Contrato não encontrado.' };

  const supabase = getSupabaseAdmin();
  const { data: eng } = await supabase
    .from('engagements')
    .select('proposal_path, proposal_name')
    .eq('id', engagementId)
    .single();

  const caminho = eng?.proposal_path as string | undefined;
  if (!caminho) return { texto: '', aviso: 'Este contrato não tem proposta anexada.' };
  if (!/\.html?$/i.test(caminho)) {
    return { texto: '', aviso: 'A proposta anexada é um PDF: só consigo ler os entregáveis de proposta em HTML.' };
  }

  const { data, error } = await supabase.storage.from('propostas').download(caminho);
  if (error || !data) return { texto: '', aviso: 'Não consegui abrir o arquivo da proposta.' };

  const { texto, itens } = extrairEscopo(await data.text());
  if (itens.length === 0) {
    return { texto: '', aviso: 'Não achei uma lista de entregáveis nessa proposta. Escreva o escopo à mão.' };
  }
  return { texto };
}
