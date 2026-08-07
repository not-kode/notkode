/**
 * O que acontece quando um negócio é ganho.
 *
 * Ganhar era só mudar a etiqueta do card: o contrato no financeiro dependia de
 * um segundo clique ("Gerar contrato"), e enquanto ele não vinha o negócio não
 * existia em dinheiro nenhum. Pior: no dashboard o valor SAÍA da barra de
 * pipeline (que só conta negócio em aberto) sem entrar em "a receber" — a
 * projeção caía justamente quando a venda fechava.
 *
 * Agora o ganho já leva valor, parcelas e proposta para o financeiro. O botão
 * continua existindo como retaguarda: para o negócio que foi ganho antes disso,
 * e para quando a criação automática falhar por algum motivo.
 *
 * Módulo "normal" (sem 'use server') porque roda tanto nas server actions da
 * tela quanto no MCP, que marca ganho pelo terminal.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { escopoDoArquivo } from '@/lib/escopo-da-proposta';
import { mimeDaProposta } from '@/lib/proposta-mime';
import { adotarTarefasDoNegocio, criarTarefasDoGanho } from './tarefas-do-ganho';

type Db = SupabaseClient;

/** Título do contrato quando o produto não está na tabela `products`. */
const SERVICE_TITLES: Record<string, string> = {
  'sistemas-ia': 'Sistema com IA',
  'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação',
  'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook',
  'manutencao': 'Plano de Manutenção',
};

/**
 * Cria (ou completa) o contrato do negócio no financeiro, herdando valor, MRR,
 * proposta e parcelas do card. Não duplica: se o negócio já tem contrato
 * vinculado, só preenche o que faltar. Devolve o id do contrato.
 */
export async function criarContratoDoNegocio(db: Db, dealId: string): Promise<string | null> {
  const { data: deal } = await db
    .from('deals')
    .select(
      'id, organization_id, service_tag, service_tags, valor_pontual, mrr, repasse_valor, precisa_nota, expected_close, notes, proposal_path, proposal_name',
    )
    .eq('id', dealId)
    .single();
  if (!deal) return null;

  // Parcelas/mensalidades planejadas do negócio — usadas para as datas de vigência
  // e o ciclo do contrato, e mais abaixo copiadas como cobranças.
  const { data: parcelas } = await db
    .from('deal_installments')
    .select('description, amount, due_date')
    .eq('deal_id', dealId)
    .order('due_date', { ascending: true });

  // Descobre (ou cria) o contrato vinculado a este negócio. SEMPRE um contrato
  // próprio: cada negócio ganho vira seu contrato/cobranças, mesmo que o cliente
  // já tenha outros — assim uma venda nova não some dentro de um contrato antigo.
  let engagementId: string | null = null;
  const { data: existing } = await db
    .from('deal_engagements')
    .select('engagement_id')
    .eq('deal_id', dealId)
    .limit(1);

  if (existing && existing.length > 0) {
    engagementId = existing[0].engagement_id;
  } else {
    const isRecurring = Number(deal.mrr ?? 0) > 0;
    // O produto vem da lista nova (service_tags); o campo antigo, singular, fica
    // como retaguarda para os negócios cadastrados antes dela.
    const produto = (deal.service_tags ?? [])[0] ?? deal.service_tag;
    let title = 'Contrato';
    if (produto) {
      const { data: prod } = await db.from('products').select('name').eq('key', produto).maybeSingle();
      title = prod?.name ?? SERVICE_TITLES[produto] ?? 'Contrato';
    }

    // Vigência e ciclo vêm das mensalidades geradas no card.
    const start_date = parcelas && parcelas.length > 0 ? parcelas[0].due_date : null;
    const end_date = parcelas && parcelas.length > 0 ? parcelas[parcelas.length - 1].due_date : null;
    const billing_cycle = isRecurring && parcelas && parcelas.length > 0 ? `mensal (${parcelas.length}x)` : null;

    const { data: eng, error: engErr } = await db
      .from('engagements')
      .insert({
        organization_id: deal.organization_id,
        type: isRecurring ? 'recorrente' : 'pontual',
        status: 'aguardando',
        title,
        valor: isRecurring ? null : deal.valor_pontual ?? null,
        mrr: isRecurring ? deal.mrr : null,
        billing_cycle,
        start_date,
        end_date,
        notes: deal.notes ?? null,
        // O que não é nosso viaja junto com o contrato: sem isso o financeiro
        // mostraria como receita o repasse do parceiro e os 6% da nota.
        repasse_valor: deal.repasse_valor ?? null,
        precisa_nota: deal.precisa_nota ?? false,
      })
      .select('id')
      .single();
    if (engErr || !eng) throw new Error(`Falha ao criar o contrato: ${engErr?.message}`);
    engagementId = eng.id;
    await db.from('deal_engagements').insert({ deal_id: dealId, engagement_id: eng.id });
  }

  // Leva a proposta e as parcelas do negócio para o contrato recém-vinculado.
  if (engagementId) {
    // Proposta: só copia se o contrato ainda não tiver uma anexada. O arquivo é
    // DUPLICADO no storage, com caminho próprio do contrato. Antes os dois
    // apontavam para o mesmo arquivo, e tirar a proposta do negócio (ou apagar o
    // negócio) deixava o contrato com um anexo que não abria mais.
    if (deal.proposal_path) {
      const { data: eng } = await db
        .from('engagements')
        .select('proposal_path')
        .eq('id', engagementId)
        .single();
      if (!eng?.proposal_path) {
        const ext = deal.proposal_path.split('.').pop() || 'bin';
        const destino = `${engagementId}/${Date.now()}.${ext}`;
        const { data: arquivo } = await db.storage.from('propostas').download(deal.proposal_path);
        let caminho = deal.proposal_path;
        if (arquivo) {
          const { error: erroCopia } = await db.storage
            .from('propostas')
            .upload(destino, new Uint8Array(await arquivo.arrayBuffer()), {
              contentType: mimeDaProposta(deal.proposal_name ?? destino, arquivo.type || 'application/octet-stream'),
              upsert: true,
            });
          if (!erroCopia) caminho = destino;
        }
        await db
          .from('engagements')
          .update({ proposal_path: caminho, proposal_name: deal.proposal_name, updated_at: new Date().toISOString() })
          .eq('id', engagementId);
      }
    }

    // Escopo: o que foi vendido na proposta vira a Cláusula 1 do contrato. Sem
    // isso o documento nasce dizendo "conforme acordado entre as partes", que
    // não diz nada, e dependia de alguém lembrar de apertar "puxar da proposta"
    // na tela de contratos. Só preenche o que está vazio: escopo escrito à mão
    // manda mais que o texto lido do arquivo.
    const { data: engEscopo } = await db
      .from('engagements')
      .select('scope, proposal_path')
      .eq('id', engagementId)
      .single();
    if (!engEscopo?.scope?.trim() && engEscopo?.proposal_path) {
      const { texto } = await escopoDoArquivo(db, engEscopo.proposal_path);
      if (texto) {
        await db
          .from('engagements')
          .update({ scope: texto, updated_at: new Date().toISOString() })
          .eq('id', engagementId);
      }
    }

    // Parcelas: só copia se o contrato ainda não tiver nenhuma (evita duplicar).
    const { count } = await db
      .from('receivables')
      .select('id', { count: 'exact', head: true })
      .eq('engagement_id', engagementId);
    if (!count && parcelas && parcelas.length > 0) {
      await db.from('receivables').insert(
        parcelas.map((p) => ({
          description: p.description,
          amount: p.amount,
          due_date: p.due_date,
          engagement_id: engagementId,
          organization_id: deal.organization_id,
          status: 'pendente',
        })),
      );
    } else if (!count && Number(deal.valor_pontual ?? 0) > 0 && Number(deal.mrr ?? 0) <= 0) {
      // Negócio pontual fechado sem parcelamento combinado no card: vira uma
      // cobrança única. Sem ela o contrato existe mas o dinheiro não aparece em
      // lugar nenhum — nem no "a receber" do financeiro, nem na projeção —, e a
      // venda fica invisível justamente na hora em que foi fechada.
      await db.from('receivables').insert({
        description: 'Pagamento único',
        amount: deal.valor_pontual,
        due_date: deal.expected_close ?? new Date().toISOString().slice(0, 10),
        engagement_id: engagementId,
        organization_id: deal.organization_id,
        status: 'pendente',
      });
    }

    // O checklist do fechamento estava preso ao negócio enquanto não havia
    // contrato: agora ele tem casa própria, e "gerar contrato" está cumprido.
    await adotarTarefasDoNegocio(db, dealId, engagementId);
  }

  return engagementId;
}

/**
 * Os efeitos do ganho, num lugar só: o checklist do fechamento e o contrato no
 * financeiro. Quem muda a etapa para "ganho" (a tela ou o MCP) chama isto em
 * seguida.
 *
 * O contrato falhar não desfaz o ganho: a venda foi fechada de qualquer jeito, e
 * o funil já avisa em cima do quadro quem ficou "ganho, falta gerar o contrato".
 */
export async function aoGanharNegocio(db: Db, dealId: string): Promise<void> {
  let contrato: string | null = null;
  try {
    contrato = await criarContratoDoNegocio(db, dealId);
  } catch (e) {
    console.error(`[ganho] contrato automático falhou no negócio ${dealId}:`, e);
  }

  // Com o contrato criado aqui, a tarefa "gerar o contrato" nasceria e morreria
  // no mesmo instante — o checklist começa direto na assinatura.
  await criarTarefasDoGanho(db, dealId, { pularContrato: contrato != null });

  // O checklist nasce depois do contrato, então precisa ser adotado por ele.
  if (contrato) await adotarTarefasDoNegocio(db, dealId, contrato);
}
