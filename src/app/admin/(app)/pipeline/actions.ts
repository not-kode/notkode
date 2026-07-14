'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DEAL_STAGES, SERVICE_TAGS, type DealStage } from './stages';

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

/**
 * Cria um negócio manualmente (indicação, WhatsApp, reunião) direto no pipeline,
 * sem passar pelo formulário do site. Espelha promoteLead: contato (+ canais) →
 * organização opcional (+ vínculo) → deal com source 'manual' e sem lead_id.
 */
export async function createDeal(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return; // contato é o mínimo obrigatório

  const company = String(formData.get('company') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim() || null;

  const serviceRaw = String(formData.get('service_tag') ?? '').trim();
  const service_tag = (SERVICE_TAGS as readonly string[]).includes(serviceRaw) ? serviceRaw : null;

  const stageRaw = String(formData.get('stage') ?? 'novo').trim();
  const stage = DEAL_STAGES.includes(stageRaw as DealStage) ? stageRaw : 'novo';

  const valor = parseValor(formData.get('valor_pontual'));

  const supabase = getSupabaseAdmin();

  // 1. Contato
  const { data: contact, error: contactErr } = await supabase
    .from('contacts')
    .insert({ name, source: 'manual', locale: 'pt', notes })
    .select('id')
    .single();
  if (contactErr || !contact) throw new Error(`Falha ao criar contato: ${contactErr?.message}`);

  // 2. Canais (email + whatsapp), o que existir
  const channels: { contact_id: string; kind: string; value: string; is_primary: boolean }[] = [];
  if (email) channels.push({ contact_id: contact.id, kind: 'email', value: email, is_primary: true });
  if (whatsapp) channels.push({ contact_id: contact.id, kind: 'whatsapp', value: whatsapp, is_primary: false });
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

  // 4. Negócio (deal)
  const { error: dealErr } = await supabase.from('deals').insert({
    organization_id: organizationId,
    contact_id: contact.id,
    stage,
    source: 'manual',
    service_tag,
    valor_pontual: valor,
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

/** Edita os dados do NEGÓCIO a partir do drawer: produto, valor, estágio e notas.
 *  Dados cadastrais/fiscais da empresa ficam na aba Clientes, não aqui. */
export async function updateDeal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const valorRaw = formData.get('valor_pontual');
  if (valorRaw != null) patch.valor_pontual = parseValor(valorRaw);

  const serviceRaw = String(formData.get('service_tag') ?? '').trim();
  if (formData.has('service_tag')) {
    patch.service_tag = (SERVICE_TAGS as readonly string[]).includes(serviceRaw) ? serviceRaw : null;
  }

  const stageRaw = String(formData.get('stage') ?? '').trim();
  if (DEAL_STAGES.includes(stageRaw as DealStage)) patch.stage = stageRaw;

  if (formData.get('notes') != null) patch.notes = String(formData.get('notes')) || null;

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
    .select('id, organization_id, service_tag, valor_pontual, mrr, notes')
    .eq('id', id)
    .single();
  if (!deal) return;

  await supabase
    .from('deals')
    .update({ stage: 'ganho', updated_at: new Date().toISOString() })
    .eq('id', id);

  // Cria o contrato só se ainda não houver um vinculado a este negócio.
  const { data: existing } = await supabase
    .from('deal_engagements')
    .select('engagement_id')
    .eq('deal_id', id)
    .limit(1);

  if (!existing || existing.length === 0) {
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
      await supabase
        .from('deal_engagements')
        .insert({ deal_id: id, engagement_id: contratos[0].id });
    } else {
      // Nenhum contrato existente — cria o esboço herdando valor/MRR do deal.
      const isRecurring = Number(deal.mrr ?? 0) > 0;
      const title = SERVICE_TITLES[deal.service_tag ?? ''] ?? 'Contrato';
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
        await supabase.from('deal_engagements').insert({ deal_id: id, engagement_id: eng.id });
      }
    }
  }

  revalidatePath('/admin/pipeline');
  revalidatePath('/admin/financeiro');
}
