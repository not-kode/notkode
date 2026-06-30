import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { type DealStage } from './stages';
import { PipelineBoard, type BoardDeal } from './board';

export const dynamic = 'force-dynamic';

type Channel = { kind: string; value: string; is_primary: boolean };
type DealRow = {
  id: string;
  stage: DealStage;
  service_tag: string | null;
  source: string | null;
  valor_pontual: number | null;
  contacts: { name: string | null; contact_channels: Channel[] | null } | null;
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function pick(channels: Channel[] | null, kind: string): string | null {
  const list = channels ?? [];
  return (list.find((c) => c.kind === kind && c.is_primary) ?? list.find((c) => c.kind === kind))?.value ?? null;
}

export default async function PipelinePage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('deals')
    .select('id, stage, service_tag, source, valor_pontual, contacts(name, contact_channels(kind, value, is_primary))')
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as unknown as DealRow[];
  const deals: BoardDeal[] = rows.map((r) => ({
    id: r.id,
    stage: r.stage,
    service_tag: r.service_tag,
    source: r.source,
    valor_pontual: r.valor_pontual,
    name: r.contacts?.name ?? null,
    email: pick(r.contacts?.contact_channels ?? null, 'email'),
    whatsapp: pick(r.contacts?.contact_channels ?? null, 'whatsapp'),
  }));

  const openDeals = deals.filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido');
  const openValue = openDeals.reduce((sum, d) => sum + (d.valor_pontual ?? 0), 0);
  const won = deals.filter((d) => d.stage === 'ganho').length;
  const lost = deals.filter((d) => d.stage === 'perdido').length;

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow mb-1">
          <span className="status-dot" />
          Pipeline de vendas
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Negócios</h1>
          <div className="flex items-center gap-2 font-label text-xs text-text-muted">
            <span>
              {openDeals.length} em aberto · <span className="text-text-secondary">{brl(openValue)}</span>
            </span>
            {won > 0 && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">
                {won} ganho{won === 1 ? '' : 's'}
              </span>
            )}
            {lost > 0 && (
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-danger">
                {lost} perdido{lost === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Erro ao carregar pipeline: {error.message}
        </p>
      )}

      <PipelineBoard initialDeals={deals} />
      <p className="mt-3 font-label text-[10px] text-text-muted/70">Arraste os cards entre as colunas para mudar o estágio.</p>
    </div>
  );
}
