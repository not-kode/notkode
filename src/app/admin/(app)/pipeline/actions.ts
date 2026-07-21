'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DEAL_STAGES, SERVICE_TAGS, type DealStage } from './stages';
import { normalizeOrgName } from './orgs';

export async function moveDealStage(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const stage = String(formData.get('stage') ?? '');
  if (!id || !DEAL_STAGES.includes(stage as DealStage)) return;

  const supabase = getSupabaseAdmin();
  await supabase.from('deals').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);

  revalidatePath('/admin/pipeline');
}

/** Converte "12.500" / "12500,50" (pt-BR) em número; vazio/invalido → 0. */
function parseValor(raw: FormDataEntryValue | null): number {
  if (raw == null) return 0;
  const n = Number(String(raw).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Normaliza a lista de produtos/serviços do form: só chaves da tabela products
 *  (com a lista antiga do código como retaguarda), sem repetição. */
async function normalizeServices(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  raw: FormDataEntryValue[],
): Promise<string[]> {
  const { data } = await supabase.from('products').select('key');
  const valid = new Set<string>([...(data ?? []).map((p) => p.key), ...SERVICE_TAGS]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const s = String(r).trim();
    if (valid.has(s) && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

/**
 * Grava um canal (email/whatsapp) do contato de forma idempotente:
 * atualiza o existente daquele tipo, cria se não houver, remove se o valor foi apagado.
 */
async function upsertChannel(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  contactId: string,
  kind: 'email' | 'whatsapp',
  value: string,
  isPrimary: boolean,
): Promise<void> {
  const { data: existing } = await supabase
    .from('contact_channels')
    .select('id')
    .eq('contact_id', contactId)
    .eq('kind', kind)
    .limit(1);
  const has = existing && existing.length > 0;

  if (value) {
    if (has) await supabase.from('contact_channels').update({ value }).eq('id', existing![0].id);
    else await supabase.from('contact_channels').insert({ contact_id: contactId, kind, value, is_primary: isPrimary });
  } else if (has) {
    await supabase.from('contact_channels').delete().eq('id', existing![0].id);
  }
}

/**
 * Cria um negócio manualmente (indicação, WhatsApp, reunião) direto no pipeline,
 * sem passar pelo formulário do site. A EMPRESA é o obrigatório; o contato é
 * opcional (às vezes a conversa é com um terceiro). Cria organização (+ contato
 * e canais, se houver) → deal com source 'manual' e sem lead_id.
 */
export async function createDeal(formData: FormData): Promise<void> {
  const company = String(formData.get('company') ?? '').trim();
  if (!company) return; // empresa é o mínimo obrigatório

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim() || null;

  const stageRaw = String(formData.get('stage') ?? 'novo').trim();
  const stage = DEAL_STAGES.includes(stageRaw as DealStage) ? stageRaw : 'novo';

  const valor = parseValor(formData.get('valor_pontual'));
  const repasseValor = parseValor(formData.get('repasse_valor'));
  const repassePara = String(formData.get('repasse_para') ?? '').trim() || null;
  const precisaNota = formData.get('precisa_nota') === 'on';

  const supabase = getSupabaseAdmin();
  const services = await normalizeServices(supabase, formData.getAll('service_tag'));

  // 1. Organização (obrigatória): reaproveita cliente existente antes de criar,
  //    pelo vínculo escolhido no autocomplete ou por nome igual já cadastrado.
  const linkedOrgId = String(formData.get('organization_id') ?? '').trim() || null;
  let orgId: string | null = null;

  if (linkedOrgId) {
    const { data: linked } = await supabase.from('organizations').select('id').eq('id', linkedOrgId).maybeSingle();
    orgId = linked?.id ?? null;
  }
  if (!orgId) {
    const { data: existing } = await supabase.from('organizations').select('id, name');
    orgId = existing?.find((o) => normalizeOrgName(o.name ?? '') === normalizeOrgName(company))?.id ?? null;
  }
  if (!orgId) {
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: company })
      .select('id')
      .single();
    if (orgErr || !org) throw new Error(`Falha ao criar empresa: ${orgErr?.message}`);
    orgId = org.id;
  }

  // 2. Contato: reaproveita o contato do cliente vinculado (preenchido pelo
  //    autocomplete) atualizando nome/canais; senão cria + vincula à empresa.
  const linkedContactId = String(formData.get('contact_id') ?? '').trim() || null;
  let contactId: string | null = null;

  if (linkedContactId) {
    const { data: linked } = await supabase.from('contacts').select('id').eq('id', linkedContactId).maybeSingle();
    if (linked) {
      contactId = linked.id;
      if (name) await supabase.from('contacts').update({ name, updated_at: new Date().toISOString() }).eq('id', linked.id);
      await upsertChannel(supabase, linked.id, 'email', email, true);
      await upsertChannel(supabase, linked.id, 'whatsapp', whatsapp, false);
    }
  }
  if (!contactId && (name || email || whatsapp)) {
    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .insert({ name: name || null, source: 'manual', locale: 'pt', notes })
      .select('id')
      .single();
    if (contactErr || !contact) throw new Error(`Falha ao criar contato: ${contactErr?.message}`);
    contactId = contact.id;

    const channels: { contact_id: string; kind: string; value: string; is_primary: boolean }[] = [];
    if (email) channels.push({ contact_id: contact.id, kind: 'email', value: email, is_primary: true });
    if (whatsapp) channels.push({ contact_id: contact.id, kind: 'whatsapp', value: whatsapp, is_primary: false });
    if (channels.length) await supabase.from('contact_channels').insert(channels);

    await supabase
      .from('contact_organizations')
      .insert({ contact_id: contact.id, organization_id: orgId, is_primary: true });
  }

  // 3. Negócio (deal)
  const { error: dealErr } = await supabase.from('deals').insert({
    organization_id: orgId,
    contact_id: contactId,
    stage,
    source: 'manual',
    service_tag: services[0] ?? null,
    service_tags: services,
    valor_pontual: valor,
    repasse_valor: repasseValor || null,
    repasse_para: repassePara,
    precisa_nota: precisaNota,
    notes,
  });
  if (dealErr) throw new Error(`Falha ao criar negócio: ${dealErr.message}`);

  revalidatePath('/admin/pipeline');
}

// service_tag do negócio → título legível do contrato criado ao ganhar.
const SERVICE_TITLES: Record<string, string> = {
  'sistemas-ia': 'Sistema com IA',
  'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação',
  'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook',
  'manutencao': 'Plano de Manutenção',
};

/** Edita um NEGÓCIO a partir do drawer: empresa (obrigatória), contato/canais
 *  (opcionais), produto, valor, estágio e notas. Os dados fiscais/cadastrais da
 *  empresa (razão social, endereço) ficam na aba Clientes, não aqui. */
export async function updateDeal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();

  let organizationId = String(formData.get('organization_id') ?? '') || null;
  let contactId = String(formData.get('contact_id') ?? '') || null;

  const company = String(formData.get('company') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();
  const notes = formData.get('notes') != null ? String(formData.get('notes')) || null : undefined;

  // 1. Empresa — atualiza o nome, ou vincula/cria a organização se o negócio ainda
  //    não tiver (reaproveita empresa de nome igual para não duplicar cliente).
  if (organizationId) {
    if (company) await supabase.from('organizations').update({ name: company, updated_at: new Date().toISOString() }).eq('id', organizationId);
  } else if (company) {
    const { data: existing } = await supabase.from('organizations').select('id, name');
    organizationId = existing?.find((o) => normalizeOrgName(o.name ?? '') === normalizeOrgName(company))?.id ?? null;
    if (!organizationId) {
      const { data: org } = await supabase.from('organizations').insert({ name: company }).select('id').single();
      if (org) organizationId = org.id;
    }
  }

  // 2. Contato (opcional) — atualiza nome, ou cria se informado agora.
  if (contactId) {
    await supabase.from('contacts').update({ name: name || null, updated_at: new Date().toISOString() }).eq('id', contactId);
  } else if (name || email || whatsapp) {
    const { data: contact } = await supabase
      .from('contacts')
      .insert({ name: name || null, source: 'manual', locale: 'pt' })
      .select('id')
      .single();
    if (contact) {
      contactId = contact.id;
      if (organizationId) {
        await supabase
          .from('contact_organizations')
          .insert({ contact_id: contact.id, organization_id: organizationId, is_primary: true });
      }
    }
  }

  // 3. Canais do contato (email/whatsapp)
  if (contactId) {
    await upsertChannel(supabase, contactId, 'email', email, true);
    await upsertChannel(supabase, contactId, 'whatsapp', whatsapp, false);
  }

  // 4. Dados do próprio negócio
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (organizationId) patch.organization_id = organizationId;
  if (contactId) patch.contact_id = contactId;

  const valorRaw = formData.get('valor_pontual');
  if (valorRaw != null) {
    patch.valor_pontual = parseValor(valorRaw);
    // O bloco financeiro vem sempre junto do valor no form.
    patch.repasse_valor = parseValor(formData.get('repasse_valor')) || null;
    patch.repasse_para = String(formData.get('repasse_para') ?? '').trim() || null;
    patch.precisa_nota = formData.get('precisa_nota') === 'on';
  }
  // O form sempre manda o marcador; assim conseguimos zerar os serviços se nada estiver marcado.
  if (formData.has('service_tags_present')) {
    const services = await normalizeServices(supabase, formData.getAll('service_tag'));
    patch.service_tags = services;
    patch.service_tag = services[0] ?? null;
  }

  const stageRaw = String(formData.get('stage') ?? '').trim();
  if (DEAL_STAGES.includes(stageRaw as DealStage)) patch.stage = stageRaw;
  if (notes !== undefined) patch.notes = notes;

  await supabase.from('deals').update(patch).eq('id', id);

  revalidatePath('/admin/pipeline');
}

/**
 * Fecha o negócio (marca "ganho") e cria o contrato correspondente no financeiro,
 * herdando valor/MRR do deal. Não duplica se o deal já tiver contrato vinculado.
 * Próximo passo do fluxo: preparar o documento de contrato.
 */
export async function winDeal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();
  const { data: deal } = await supabase
    .from('deals')
    .select('id, organization_id, service_tag, valor_pontual, mrr, notes, proposal_path, proposal_name')
    .eq('id', id)
    .single();
  if (!deal) return;

  await supabase
    .from('deals')
    .update({ stage: 'ganho', updated_at: new Date().toISOString() })
    .eq('id', id);

  // Descobre (ou cria) o contrato vinculado a este negócio.
  let engagementId: string | null = null;
  const { data: existing } = await supabase
    .from('deal_engagements')
    .select('engagement_id')
    .eq('deal_id', id)
    .limit(1);

  if (existing && existing.length > 0) {
    engagementId = existing[0].engagement_id;
  } else {
    // Se a empresa já tem um contrato "de verdade" (com escopo ou proposta
    // anexada), liga o negócio a ESSE — evita criar um contrato-fantasma vazio.
    const { data: contratos } = await supabase
      .from('engagements')
      .select('id')
      .eq('organization_id', deal.organization_id)
      .or('scope.not.is.null,proposal_path.not.is.null')
      .order('created_at', { ascending: false })
      .limit(1);

    if (contratos && contratos.length > 0) {
      engagementId = contratos[0].id;
      await supabase.from('deal_engagements').insert({ deal_id: id, engagement_id: engagementId });
    } else {
      // Nenhum contrato existente — cria o esboço herdando valor/MRR do deal.
      const isRecurring = Number(deal.mrr ?? 0) > 0;
      let title = 'Contrato';
      if (deal.service_tag) {
        const { data: prod } = await supabase.from('products').select('name').eq('key', deal.service_tag).maybeSingle();
        title = prod?.name ?? SERVICE_TITLES[deal.service_tag] ?? 'Contrato';
      }
      const { data: eng } = await supabase
        .from('engagements')
        .insert({
          organization_id: deal.organization_id,
          type: isRecurring ? 'recorrente' : 'pontual',
          status: 'aguardando',
          title,
          valor: deal.valor_pontual ?? null,
          mrr: isRecurring ? deal.mrr : null,
          notes: deal.notes ?? null,
        })
        .select('id')
        .single();
      if (eng) {
        engagementId = eng.id;
        await supabase.from('deal_engagements').insert({ deal_id: id, engagement_id: eng.id });
      }
    }
  }

  // Leva a proposta e as parcelas do negócio para o contrato recém-vinculado.
  if (engagementId) {
    // Proposta: só copia se o contrato ainda não tiver uma anexada.
    if (deal.proposal_path) {
      const { data: eng } = await supabase
        .from('engagements')
        .select('proposal_path')
        .eq('id', engagementId)
        .single();
      if (!eng?.proposal_path) {
        await supabase
          .from('engagements')
          .update({ proposal_path: deal.proposal_path, proposal_name: deal.proposal_name, updated_at: new Date().toISOString() })
          .eq('id', engagementId);
      }
    }

    // Parcelas: só copia se o contrato ainda não tiver nenhuma (evita duplicar).
    const { count } = await supabase
      .from('receivables')
      .select('id', { count: 'exact', head: true })
      .eq('engagement_id', engagementId);
    if (!count) {
      const { data: parcelas } = await supabase
        .from('deal_installments')
        .select('description, amount, due_date')
        .eq('deal_id', id)
        .order('due_date', { ascending: true });
      if (parcelas && parcelas.length > 0) {
        await supabase.from('receivables').insert(
          parcelas.map((p) => ({
            description: p.description,
            amount: p.amount,
            due_date: p.due_date,
            engagement_id: engagementId,
            organization_id: deal.organization_id,
            status: 'pendente',
          })),
        );
      }
    }
  }

  revalidatePath('/admin/pipeline');
  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
}

/** Sobe o arquivo da proposta enviada e vincula ao NEGÓCIO (bucket privado 'propostas'). */
export async function uploadDealProposal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const file = formData.get('file');
  if (!id || !(file instanceof File) || file.size === 0) return;

  const supabase = getSupabaseAdmin();
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `deal/${id}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage.from('propostas').upload(path, bytes, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw new Error(`Falha no upload: ${error.message}`);

  await supabase
    .from('deals')
    .update({ proposal_path: path, proposal_name: file.name, updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/pipeline');
}

/** Remove a proposta anexada ao negócio. */
export async function removeDealProposal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('deals').select('proposal_path').eq('id', id).single();
  if (data?.proposal_path) await supabase.storage.from('propostas').remove([data.proposal_path]);
  await supabase
    .from('deals')
    .update({ proposal_path: null, proposal_name: null, updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/pipeline');
}

/** Lança uma parcela planejada do negócio (vira receivable do contrato ao ganhar). */
export async function addDealInstallment(formData: FormData): Promise<void> {
  const deal_id = String(formData.get('deal_id') ?? '');
  const due_date = String(formData.get('due_date') ?? '');
  const amount = parseValor(formData.get('amount'));
  if (!deal_id || !due_date || amount <= 0) return;

  const description = String(formData.get('description') ?? '').trim() || null;

  const supabase = getSupabaseAdmin();
  await supabase.from('deal_installments').insert({ deal_id, description, amount, due_date });
  revalidatePath('/admin/pipeline');
}

/** Remove uma parcela planejada do negócio. */
export async function deleteDealInstallment(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = getSupabaseAdmin();
  await supabase.from('deal_installments').delete().eq('id', id);
  revalidatePath('/admin/pipeline');
}

/**
 * Gera N parcelas automaticamente dividindo o valor total do negócio,
 * com vencimentos mensais a partir da data escolhida. SUBSTITUI as parcelas
 * atuais do negócio. A sobra de centavos vai na última parcela.
 */
export async function generateInstallments(formData: FormData): Promise<void> {
  const deal_id = String(formData.get('deal_id') ?? '');
  const count = parseInt(String(formData.get('count') ?? ''), 10);
  const first = String(formData.get('first_due_date') ?? '');
  if (!deal_id || !first || !Number.isFinite(count) || count < 1 || count > 60) return;

  const supabase = getSupabaseAdmin();
  const { data: deal } = await supabase.from('deals').select('valor_pontual').eq('id', deal_id).single();
  const total = Number(deal?.valor_pontual ?? 0);
  if (!(total > 0)) return;

  const totalCents = Math.round(total * 100);
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count; // sobra vai na última

  const [y, m, d] = first.split('-').map(Number);
  const rows = Array.from({ length: count }, (_, i) => {
    const cents = base + (i === count - 1 ? remainder : 0);
    const date = new Date(Date.UTC(y, m - 1 + i, d)); // meses somam corretamente
    return {
      deal_id,
      description: `Parcela ${i + 1}/${count}`,
      amount: cents / 100,
      due_date: date.toISOString().slice(0, 10),
    };
  });

  await supabase.from('deal_installments').delete().eq('deal_id', deal_id);
  await supabase.from('deal_installments').insert(rows);
  revalidatePath('/admin/pipeline');
}

/** Gera slug único de produto a partir do nome (vira o service_tag dos negócios). */
function slugifyProduct(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'produto'
  );
}

/** Adiciona um produto/serviço à lista (tabela products, gerida pelo sistema). */
export async function addProduct(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;
  const billing_type = String(formData.get('billing_type') ?? '') === 'recorrente' ? 'recorrente' : 'pontual';

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('products').select('key, sort');
  const keys = new Set((existing ?? []).map((p) => p.key));
  const base = slugifyProduct(name);
  let key = base;
  for (let i = 2; keys.has(key); i++) key = `${base}-${i}`;
  const sort = Math.max(0, ...(existing ?? []).map((p) => p.sort ?? 0)) + 1;

  await supabase.from('products').insert({ key, name, billing_type, sort });
  revalidatePath('/admin/pipeline');
}

/** Renomeia um produto (o key/slug gravado nos negócios não muda). */
export async function renameProduct(formData: FormData): Promise<void> {
  const key = String(formData.get('key') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!key || !name) return;
  const supabase = getSupabaseAdmin();
  await supabase.from('products').update({ name }).eq('key', key);
  revalidatePath('/admin/pipeline');
}

/** Ativa/desativa um produto: some das opções novas sem apagar o histórico. */
export async function toggleProduct(formData: FormData): Promise<void> {
  const key = String(formData.get('key') ?? '');
  if (!key) return;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('products').select('active').eq('key', key).maybeSingle();
  if (!data) return;
  await supabase.from('products').update({ active: !data.active }).eq('key', key);
  revalidatePath('/admin/pipeline');
}
