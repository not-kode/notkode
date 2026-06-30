import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DEAL_STAGES, type DealStage } from './stages';
import { StageSelect } from './stage-select';

export const dynamic = 'force-dynamic';

type Deal = {
  id: string;
  stage: DealStage;
  service_tag: string | null;
  source: string | null;
  valor_pontual: number | null;
  mrr: number | null;
  created_at: string;
  contacts: { name: string | null } | null;
};

const STAGE_META: Record<DealStage, { label: string; accent: string }> = {
  novo:        { label: 'Novo',        accent: 'text-text-secondary' },
  qualificado: { label: 'Qualificado', accent: 'text-primary' },
  diagnostico: { label: 'Diagnóstico', accent: 'text-primary' },
  proposta:    { label: 'Proposta',    accent: 'text-cyan-600' },
  negociacao:  { label: 'Negociação',  accent: 'text-warning' },
  ganho:       { label: 'Ganho',       accent: 'text-success' },
  perdido:     { label: 'Perdido',     accent: 'text-danger' },
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default async function PipelinePage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('deals')
    .select('id, stage, service_tag, source, valor_pontual, mrr, created_at, contacts(name)')
    .order('created_at', { ascending: false });

  const deals = (data ?? []) as unknown as Deal[];
  const byStage = (s: DealStage) => deals.filter((d) => d.stage === s);
  const openValue = deals
    .filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido')
    .reduce((sum, d) => sum + (d.valor_pontual ?? 0), 0);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="mt-1 text-sm text-text-muted">
          {deals.length} negócio{deals.length === 1 ? '' : 's'} · {brl(openValue)} em aberto
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Erro ao carregar pipeline: {error.message}
        </p>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const cards = byStage(stage);
          const total = cards.reduce((s, d) => s + (d.valor_pontual ?? 0), 0);
          return (
            <section key={stage} className="flex w-64 shrink-0 flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className={`font-mono text-xs uppercase tracking-wider ${STAGE_META[stage].accent}`}>
                  {STAGE_META[stage].label}
                </span>
                <span className="font-mono text-[11px] text-text-muted">{cards.length}</span>
              </div>

              <div className="flex min-h-[120px] flex-col gap-2 rounded-lg border border-border-subtle/15 bg-surface-elevated/50 p-2">
                {cards.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-text-muted/60">—</p>
                )}
                {cards.map((deal) => (
                  <article
                    key={deal.id}
                    className="rounded-md border border-border-subtle/15 bg-surface-base p-3 shadow-sm"
                  >
                    <div className="font-medium text-text-primary">{deal.contacts?.name ?? 'Sem contato'}</div>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-text-muted">
                      {deal.service_tag && <span>{deal.service_tag}</span>}
                      {deal.source && <span>· {deal.source}</span>}
                    </div>
                    {deal.valor_pontual ? (
                      <div className="mt-1.5 text-sm font-semibold text-text-secondary">{brl(deal.valor_pontual)}</div>
                    ) : null}
                    <div className="mt-2">
                      <StageSelect id={deal.id} stage={deal.stage} />
                    </div>
                  </article>
                ))}
              </div>

              {total > 0 && (
                <p className="mt-2 px-1 font-mono text-[11px] text-text-muted">{brl(total)}</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
