import type { getSupabaseAdmin } from '@/lib/supabase-admin';
import { normalizeOrgName } from '@/app/admin/(app)/pipeline/orgs';

/**
 * O lead do site entra direto no funil.
 *
 * Antes isto era um botão: o formulário virava linha em lead_submissions e
 * alguém precisava clicar em "Promover" para virar negócio. Na prática eram
 * duas listas da mesma pessoa, e o funil só sabia de quem já tinha sido
 * promovido na mão.
 *
 * Agora o card nasce assim que a pessoa se identifica — nome mais WhatsApp ou
 * e-mail —, ainda durante o preenchimento. Quem digita e some sem deixar
 * contato não vira card: não há para quem ligar, e isso é rascunho, não lead.
 *
 * Tudo é ancorado no session_id: o rascunho cria o card uma vez, e o envio
 * completo depois enriquece o MESMO card em vez de abrir um segundo.
 */

type Supabase = ReturnType<typeof getSupabaseAdmin>;

export type LeadDoSite = {
  session_id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  whatsapp: string | null;
  service_tag: string | null;
  needs: string[] | null;
  timing: string | null;
  description: string | null;
  /** Etapa em que a pessoa estava quando o rascunho foi salvo. */
  last_step?: string | null;
  /** Id da submissão, quando o lead já enviou o formulário inteiro. */
  lead_id?: string | null;
  utm_source?: string | null;
};

/** Marca as notas escritas por nós: o que tem esta linha na frente pode ser reescrito. */
const MARCA = '[Formulário do site]';

/** Só vira card quem dá nome e um jeito de ser respondido. */
export function identificado(lead: Pick<LeadDoSite, 'name' | 'email' | 'whatsapp'>): boolean {
  return !!lead.name?.trim() && !!(lead.email?.trim() || lead.whatsapp?.trim());
}

/** As respostas do formulário em texto corrido, para as notas do card. */
function resumo(lead: LeadDoSite): string {
  const linhas = [MARCA];
  if (lead.company?.trim()) linhas.push(`Empresa: ${lead.company.trim()}`);
  if (lead.needs?.length) linhas.push(`Precisa: ${lead.needs.join(', ')}`);
  if (lead.timing) linhas.push(`Prazo: ${lead.timing}`);
  if (lead.utm_source) linhas.push(`Origem: ${lead.utm_source}`);
  if (!lead.lead_id && lead.last_step) linhas.push(`Parou em: ${lead.last_step}`);
  if (lead.description?.trim()) linhas.push('', lead.description.trim());
  return linhas.join('\n');
}

/** Empresa já cadastrada com este nome, para não abrir um cliente repetido. */
async function acharOuCriarOrg(supabase: Supabase, company: string): Promise<string | null> {
  const alvo = normalizeOrgName(company);
  if (!alvo) return null;

  const { data: existentes } = await supabase.from('organizations').select('id, name');
  const achada = (existentes ?? []).find((o) => normalizeOrgName(o.name ?? '') === alvo);
  if (achada) return achada.id;

  const { data: nova } = await supabase.from('organizations').insert({ name: company.trim() }).select('id').single();
  return nova?.id ?? null;
}

/** Grava e-mail/WhatsApp do contato sem duplicar canal do mesmo tipo. */
async function salvarCanais(supabase: Supabase, contactId: string, lead: LeadDoSite): Promise<void> {
  const { data: atuais } = await supabase
    .from('contact_channels')
    .select('id, kind')
    .eq('contact_id', contactId);
  const tem = new Set((atuais ?? []).map((c) => c.kind));

  const novos: { contact_id: string; kind: string; value: string; is_primary: boolean }[] = [];
  if (lead.email?.trim() && !tem.has('email')) {
    novos.push({ contact_id: contactId, kind: 'email', value: lead.email.trim(), is_primary: true });
  }
  if (lead.whatsapp?.trim() && !tem.has('whatsapp')) {
    novos.push({ contact_id: contactId, kind: 'whatsapp', value: lead.whatsapp.trim(), is_primary: false });
  }
  if (novos.length) await supabase.from('contact_channels').insert(novos);
}

/**
 * Garante o card do funil desta sessão: cria se ainda não existe, completa se já
 * existe. Devolve o id do negócio, ou null quando a pessoa ainda não se
 * identificou (ou quando algo falhou — isto nunca derruba o formulário).
 */
export async function garantirNegocioDoLead(supabase: Supabase, lead: LeadDoSite): Promise<string | null> {
  if (!identificado(lead)) return null;

  try {
    const { data: existente } = await supabase
      .from('deals')
      .select('id, contact_id, organization_id, notes, stage')
      .eq('lead_session_id', lead.session_id)
      .maybeSingle();

    if (existente) {
      // Card já aberto: completa o que ainda falta sem passar por cima do que
      // alguém tenha escrito à mão. Notas só são reescritas enquanto forem as
      // nossas (começam com a marca).
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (!existente.organization_id && lead.company?.trim()) {
        patch.organization_id = await acharOuCriarOrg(supabase, lead.company);
      }
      if (!existente.notes || existente.notes.startsWith(MARCA)) patch.notes = resumo(lead);
      if (lead.lead_id) patch.lead_id = lead.lead_id;
      if (lead.service_tag) patch.service_tag = lead.service_tag;

      await supabase.from('deals').update(patch).eq('id', existente.id);
      if (existente.contact_id) {
        await salvarCanais(supabase, existente.contact_id, lead);
        if (lead.name?.trim()) {
          await supabase.from('contacts').update({ name: lead.name.trim() }).eq('id', existente.contact_id);
        }
      }
      return existente.id;
    }

    // 1. Contato de quem preencheu.
    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .insert({ name: lead.name?.trim() ?? null, source: 'site', locale: 'pt' })
      .select('id')
      .single();
    if (contactErr || !contact) throw new Error(contactErr?.message ?? 'contato não criado');
    await salvarCanais(supabase, contact.id, lead);

    // 2. Empresa, quando ela disse qual é.
    let organizationId: string | null = null;
    if (lead.company?.trim()) {
      organizationId = await acharOuCriarOrg(supabase, lead.company);
      if (organizationId) {
        await supabase
          .from('contact_organizations')
          .insert({ contact_id: contact.id, organization_id: organizationId, is_primary: true });
      }
    }

    // 3. O card, no topo do funil.
    const agora = new Date().toISOString();
    const { data: deal, error: dealErr } = await supabase
      .from('deals')
      .insert({
        organization_id: organizationId,
        contact_id: contact.id,
        lead_id: lead.lead_id ?? null,
        lead_session_id: lead.session_id,
        stage: 'novo',
        source: 'site',
        service_tag: lead.service_tag,
        service_tags: lead.service_tag ? [lead.service_tag] : [],
        notes: resumo(lead),
        stage_changed_at: agora,
      })
      .select('id')
      .single();
    if (dealErr || !deal) throw new Error(dealErr?.message ?? 'negócio não criado');

    return deal.id;
  } catch (e) {
    // O formulário da pessoa nunca pode quebrar por causa do nosso CRM.
    console.error('[lead→funil] falhou:', e instanceof Error ? e.message : e);
    return null;
  }
}
