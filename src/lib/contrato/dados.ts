import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { Eng, Rec } from '@/app/admin/contrato/documento';
import { MODELO_DE_FABRICA, lerClausulas, type Modelo } from '@/app/admin/contrato/modelo';

/**
 * Os dados que montam o contrato: o próprio contrato, o cadastro do cliente e
 * as parcelas acordadas. Usado tanto pela tela do /admin quanto pelo
 * congelamento para assinatura, para os dois lerem exatamente a mesma coisa.
 */
export async function carregarContrato(id: string): Promise<{ eng: Eng; parcelas: Rec[]; modelo: Modelo } | null> {
  const supabase = getSupabaseAdmin();

  const [{ data: engData }, { data: recData }] = await Promise.all([
    supabase
      .from('engagements')
      .select('id, title, type, valor, mrr, start_date, end_date, scope, renewal_note, client_obligations, provider_obligations, proposal_path, proposal_name, contract_template_id, organizations(name, legal_name, tax_id, legal_rep, legal_rep_cpf, address_street, address_number, address_district, address_city, address_state, address_zip)')
      .eq('id', id)
      .single(),
    // Parcela cancelada não entra no contrato: o documento mostra o que foi de fato acordado.
    supabase.from('receivables').select('description, amount, due_date').eq('engagement_id', id).neq('status', 'cancelado').order('due_date'),
  ]);

  const eng = engData as unknown as (Eng & { contract_template_id?: string | null }) | null;
  if (!eng) return null;

  return {
    eng,
    parcelas: (recData ?? []) as Rec[],
    modelo: await carregarModelo(eng.contract_template_id ?? null),
  };
}

/**
 * O modelo do contrato: o escolhido, senão o marcado como padrão, senão o de
 * fábrica. Nunca falha por falta de modelo, para o contrato sempre sair.
 */
export async function carregarModelo(id: string | null): Promise<Modelo> {
  const supabase = getSupabaseAdmin();
  const consulta = supabase.from('contract_templates').select('id, nome, descricao, escopo_padrao, clausulas');

  const { data } = id
    ? await consulta.eq('id', id).maybeSingle()
    : await consulta.eq('padrao', true).maybeSingle();

  if (!data) return MODELO_DE_FABRICA;
  const clausulas = lerClausulas(data.clausulas);
  if (clausulas.length === 0) return MODELO_DE_FABRICA;

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    escopo_padrao: data.escopo_padrao,
    clausulas,
  };
}

/** Data por extenso, no fuso de São Paulo, para o fecho do documento. */
export function dataPorExtenso(quando: Date = new Date()): string {
  return quando.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'long', year: 'numeric',
  });
}
