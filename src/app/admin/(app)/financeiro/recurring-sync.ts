/**
 * Lançamento automático das mensalidades recorrentes.
 *
 * Contrato recorrente ativo tem cobrança certa até o fim da vigência, então a
 * parcela não espera ninguém clicar em "Lançar": ela nasce sozinha em todos os
 * meses contratados, do mês corrente em diante.
 *
 * O preço de gravar o futuro é ele ficar desatualizado, e é isso que a
 * reconciliação daqui resolve: quando o contrato é pausado, encerrado ou vira
 * churn, as mensalidades futuras somem; quando o valor ou a vigência mudam, as
 * futuras acompanham. Sem isso sobraria cobrança fantasma até 2027.
 *
 * Mexe só no que ela mesma criou (descrição "Mensalidade MM/AAAA"), pendente e
 * com vencimento à frente. Parcela lançada na mão, parcelamento acordado no
 * fechamento e qualquer coisa já paga ou já vencida ficam intocados.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isRecurring, monthlyDescription, pendingMonthly, type RecurringEng } from './recurring';

/** Teto de meses à frente, para contrato sem fim de vigência não gerar até o infinito. */
const TETO_MESES = 24;

/** Descrição que a geração automática usa; é como ela reconhece o que é dela. */
const DESC_AUTO = /^Mensalidade \d{2}\/\d{4}$/;

type EngRow = RecurringEng & { billing_cycle: string | null; organization_id: string | null };
type RecRow = {
  id: string; engagement_id: string | null; description: string | null;
  amount: number; due_date: string; status: string; created_at: string;
};

const proximoMes = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
};

/** Mensalidade automática que ainda vai vencer: é a única coisa que a régua mexe. */
const ehFuturaAutomatica = (r: RecRow, hoje: string): boolean =>
  r.status === 'pendente' && r.due_date > hoje && DESC_AUTO.test(r.description ?? '');

/**
 * Contrato fechado com número de parcelas ("mensal (6x)") tem fim combinado: são
 * 6 mensalidades e acabou. A vigência costuma ir um mês além do último
 * vencimento, e sem esse limite nasceria uma cobrança a mais no fim.
 */
const parcelasCombinadas = (billing: string | null): number | null => {
  const m = /\((\d+)\s*x\)/.exec(billing ?? '');
  return m ? Number(m[1]) : null;
};

/**
 * Põe as mensalidades futuras de acordo com o contrato: gera o que falta,
 * corrige valor e apaga o que saiu da vigência ou perdeu o contrato ativo.
 * Sem `engagementId`, passa por todos os contratos recorrentes.
 */
export async function syncRecurringReceivables(engagementId?: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  let engQuery = supabase
    .from('engagements')
    .select('id, type, lifecycle, mrr, billing_cycle, start_date, end_date, organization_id')
    .eq('type', 'recorrente');
  if (engagementId) engQuery = engQuery.eq('id', engagementId);
  const { data: engData } = await engQuery;

  const engs = (engData ?? []) as EngRow[];
  if (engs.length === 0) return;

  const { data: recData } = await supabase
    .from('receivables')
    .select('id, engagement_id, description, amount, due_date, status, created_at')
    .in('engagement_id', engs.map((e) => e.id))
    .order('created_at');
  const recs = (recData ?? []) as RecRow[];

  const porContrato = new Map<string, RecRow[]>();
  for (const r of recs) {
    if (!r.engagement_id) continue;
    porContrato.set(r.engagement_id, [...(porContrato.get(r.engagement_id) ?? []), r]);
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const mesAtual = hoje.slice(0, 7);

  const apagar: string[] = [];
  const corrigir: { id: string; amount: number }[] = [];
  const criar: Record<string, unknown>[] = [];

  for (const eng of engs) {
    const doContrato = porContrato.get(eng.id) ?? [];
    const futuras = doContrato.filter((r) => ehFuturaAutomatica(r, hoje));

    // Esta rotina roda a cada carregamento da tela, e duas cargas ao mesmo tempo
    // conseguem lançar o mesmo mês duas vezes. Em vez de tentar impedir a
    // corrida, ela se limpa: cópia do mesmo vencimento cai fora, fica a
    // primeira. Assim a próxima visita já conserta sozinha.
    const vistos = new Set<string>();
    const duplicadas = new Set<string>();
    for (const r of futuras) {
      if (vistos.has(r.due_date)) duplicadas.add(r.id);
      else vistos.add(r.due_date);
    }
    apagar.push(...duplicadas);

    const unicas = futuras.filter((r) => !duplicadas.has(r.id));

    // Contrato que não fatura mais (pausado, churn ou encerrado) não deixa
    // cobrança marcada para os meses que vêm.
    if (eng.lifecycle !== 'ativo') {
      apagar.push(...unicas.map((r) => r.id));
      continue;
    }

    const foraDaVigencia = (due: string) =>
      (!!eng.start_date && due < eng.start_date) || (!!eng.end_date && due > eng.end_date);

    const descartadas = new Set(duplicadas);
    for (const r of unicas) {
      if (foraDaVigencia(r.due_date)) {
        apagar.push(r.id);
        descartadas.add(r.id);
      // Valor vazio não apaga nem zera nada: o formulário do contrato salva
      // sozinho enquanto se digita, e o campo passa em branco no meio do
      // caminho. Sem valor, a régua só não mexe.
      } else if ((eng.mrr ?? 0) > 0 && r.amount !== eng.mrr) {
        corrigir.push({ id: r.id, amount: eng.mrr as number });
      }
    }

    if (!isRecurring(eng)) continue;

    // O que sobra de verdade (já sem o que vai ser apagado) é o que decide se
    // ainda falta lançar e quantas parcelas o contrato já tem.
    const validas = doContrato.filter((r) => !descartadas.has(r.id) && r.status !== 'cancelado');
    const limite = parcelasCombinadas(eng.billing_cycle);
    let quantas = validas.length;
    if (limite != null && quantas >= limite) continue;

    const dues = new Map<string, string[]>([[eng.id, validas.map((r) => r.due_date)]]);

    for (let mes = mesAtual, i = 0; i < TETO_MESES; mes = proximoMes(mes), i++) {
      if (eng.end_date && `${mes}-01` > eng.end_date) break;
      if (limite != null && quantas >= limite) break;
      const [pendente] = pendingMonthly([eng], dues, mes);
      if (!pendente) continue;
      criar.push({
        description: monthlyDescription(mes),
        amount: eng.mrr,
        due_date: pendente.due_date,
        engagement_id: eng.id,
        organization_id: eng.organization_id,
        status: 'pendente',
      });
      quantas++;
      // O mês recém-gerado entra no histórico para o próximo saber o dia certo
      // da cobrança e não lançar duas vezes.
      dues.set(eng.id, [...(dues.get(eng.id) ?? []), pendente.due_date]);
    }
  }

  if (apagar.length > 0) await supabase.from('receivables').delete().in('id', apagar);
  for (const c of corrigir) await supabase.from('receivables').update({ amount: c.amount }).eq('id', c.id);
  if (criar.length > 0) await supabase.from('receivables').insert(criar);
}
