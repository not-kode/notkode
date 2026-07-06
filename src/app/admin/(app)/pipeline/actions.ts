'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DEAL_STAGES, type DealStage } from './stages';

export async function moveDealStage(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const stage = String(formData.get('stage') ?? '');
  if (!id || !DEAL_STAGES.includes(stage as DealStage)) return;

  const supabase = getSupabaseAdmin();
  await supabase.from('deals').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);

  revalidatePath('/admin/pipeline');
}

// Campos cadastrais da empresa editáveis pelo drawer (usados para gerar contratos).
const ORG_FIELDS = [
  'legal_name', 'tax_id', 'state_registration',
  'address_street', 'address_number', 'address_district',
  'address_city', 'address_state', 'address_zip', 'legal_rep',
] as const;

// service_tag do negócio → título legível do contrato criado ao ganhar.
const SERVICE_TITLES: Record<string, string> = {
  'sistemas-ia': 'Sistema com IA',
  'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação',
  'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook',
  'manutencao': 'Plano de Manutenção',
};

/** Edita valor, notas e os dados cadastrais da empresa (a partir do drawer de detalhe). */
export async function updateDeal(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = getSupabaseAdmin();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const valorRaw = formData.get('valor_pontual');
  if (valorRaw != null) {
    const n = Number(String(valorRaw).replace(/\./g, '').replace(',', '.'));
    patch.valor_pontual = Number.isFinite(n) ? n : 0;
  }
  if (formData.get('notes') != null) patch.notes = String(formData.get('notes')) || null;
  await supabase.from('deals').update(patch).eq('id', id);

  // Dados cadastrais vivem na organização (CONTRATANTE), não no deal.
  const organization_id = String(formData.get('organization_id') ?? '');
  if (organization_id) {
    const orgPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const f of ORG_FIELDS) {
      const v = formData.get(f);
      if (v != null) orgPatch[f] = String(v).trim() || null;
    }
    await supabase.from('organizations').update(orgPatch).eq('id', organization_id);
  }

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
