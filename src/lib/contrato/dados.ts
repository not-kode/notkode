import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { Eng, Rec } from '@/app/admin/contrato/documento';

/**
 * Os dados que montam o contrato: o próprio contrato, o cadastro do cliente e
 * as parcelas acordadas. Usado tanto pela tela do /admin quanto pelo
 * congelamento para assinatura, para os dois lerem exatamente a mesma coisa.
 */
export async function carregarContrato(id: string): Promise<{ eng: Eng; parcelas: Rec[] } | null> {
  const supabase = getSupabaseAdmin();

  const [{ data: engData }, { data: recData }] = await Promise.all([
    supabase
      .from('engagements')
      .select('id, title, type, valor, mrr, start_date, end_date, scope, renewal_note, client_obligations, provider_obligations, proposal_path, proposal_name, organizations(name, legal_name, tax_id, legal_rep, legal_rep_cpf, address_street, address_number, address_district, address_city, address_state, address_zip)')
      .eq('id', id)
      .single(),
    // Parcela cancelada não entra no contrato: o documento mostra o que foi de fato acordado.
    supabase.from('receivables').select('description, amount, due_date').eq('engagement_id', id).neq('status', 'cancelado').order('due_date'),
  ]);

  const eng = engData as unknown as Eng | null;
  if (!eng) return null;

  return { eng, parcelas: (recData ?? []) as Rec[] };
}

/** Data por extenso, no fuso de São Paulo, para o fecho do documento. */
export function dataPorExtenso(quando: Date = new Date()): string {
  return quando.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'long', year: 'numeric',
  });
}
