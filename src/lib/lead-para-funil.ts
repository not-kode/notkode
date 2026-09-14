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
 * Agora o card nasce assim que a pessoa se identifica, nome mais WhatsApp ou
 * e-mail, ainda durante o preenchimento. Quem digita e some sem deixar contato
 * não vira card: não há para quem ligar, e isso é rascunho, não lead.
 *
 * Tudo é ancorado no session_id: o rascunho cria o card uma vez, e o envio
 * completo depois enriquece o MESMO card em vez de abrir um segundo.
 *
 * O card guarda de onde a pessoa veio (página e canal) e o que ela respondeu,
 * cada resposta com a pergunta que ela viu. As notas ficam só para a equipe.
 */

type Supabase = ReturnType<typeof getSupabaseAdmin>;

/** Uma resposta do formulário, com a pergunta como apareceu na tela. */
export type Resposta = { pergunta: string; resposta: string };

export type LeadDoSite = {
  session_id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  whatsapp: string | null;
  service_tag: string | null;
  /** Caminho da página em que o formulário foi preenchido. */
  pagina?: string | null;
  /** Por onde a pessoa chegou ao site (utm_source). */
  utm_source?: string | null;
  /** Tudo o que ela respondeu até agora, na ordem do formulário. */
  respostas?: Resposta[] | null;
  /** Id da submissão, quando o lead já enviou o formulário inteiro. */
  lead_id?: string | null;
};

/** Só vira card quem dá nome e um jeito de ser respondido. */
export function identificado(lead: Pick<LeadDoSite, 'name' | 'email' | 'whatsapp'>): boolean {
  return !!lead.name?.trim() && !!(lead.email?.trim() || lead.whatsapp?.trim());
}

/** Respostas vindas do navegador: só pares de texto, sem vazio, com teto. */
export function lerRespostas(raw: unknown): Resposta[] | null {
  if (!Array.isArray(raw)) return null;
  const out: Resposta[] = [];
  for (const item of raw.slice(0, 40)) {
    const { pergunta, resposta } = (item ?? {}) as Record<string, unknown>;
    if (typeof pergunta !== 'string' || typeof resposta !== 'string') continue;
    if (!pergunta.trim() || !resposta.trim()) continue;
    out.push({ pergunta: pergunta.trim().slice(0, 200), resposta: resposta.trim().slice(0, 2000) });
  }
  return out.length ? out : null;
}

/** "https://notkode.com.br/pt/sites?x=1" ou "/pt/sites" → "/pt/sites". */
export function caminhoDaPagina(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return new URL(raw.trim(), 'https://notkode.com.br').pathname.slice(0, 300);
  } catch {
    return null;
  }
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
 * identificou (ou quando algo falhou; isto nunca derruba o formulário).
 */
export async function garantirNegocioDoLead(supabase: Supabase, lead: LeadDoSite): Promise<string | null> {
  if (!identificado(lead)) return null;

  try {
    const { data: existente } = await supabase
      .from('deals')
      .select('id, contact_id, organization_id, lead_page, lead_channel')
      .eq('lead_session_id', lead.session_id)
      .maybeSingle();

    if (existente) {
      // Card já aberto: completa o que ainda falta. As respostas são sempre as
      // mais recentes, porque o rascunho vai sendo salvo enquanto a pessoa preenche.
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (!existente.organization_id && lead.company?.trim()) {
        patch.organization_id = await acharOuCriarOrg(supabase, lead.company);
      }
      if (lead.respostas?.length) patch.lead_answers = lead.respostas;
      if (!existente.lead_page && lead.pagina) patch.lead_page = lead.pagina;
      if (!existente.lead_channel && lead.utm_source) patch.lead_channel = lead.utm_source;
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
        lead_page: lead.pagina ?? null,
        lead_channel: lead.utm_source ?? null,
        lead_answers: lead.respostas?.length ? lead.respostas : null,
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
