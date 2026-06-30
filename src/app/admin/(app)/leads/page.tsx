import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { promoteLead } from './actions';

export const dynamic = 'force-dynamic';

type LeadRow = {
  id: string;
  created_at: string;
  service_tag: string | null;
  page_origin: string | null;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  notes: string | null;
  selection: Record<string, unknown> | null;
  estimated_min: number | null;
  estimated_max: number | null;
  promoted_at: string | null;
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function fmtRange(min: number | null, max: number | null): string {
  const f = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  if (min != null && max != null) return `${f(min)} – ${f(max)}`;
  if (max != null) return f(max);
  if (min != null) return f(min);
  return '—';
}

function needs(selection: Record<string, unknown> | null): string {
  const n = selection?.needs;
  return Array.isArray(n) && n.length ? n.join(', ') : '—';
}

export default async function LeadsPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('lead_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  const leads = (data ?? []) as LeadRow[];
  const pending = leads.filter((l) => !l.promoted_at).length;

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads do site</h1>
          <p className="mt-1 text-sm text-text-muted">
            {leads.length} submissõe{leads.length === 1 ? '' : 's'} · {pending} a promover
          </p>
        </div>
      </header>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Erro ao carregar leads: {error.message}
        </p>
      )}

      {!error && leads.length === 0 && (
        <p className="rounded-md border border-border-subtle/20 bg-surface-elevated px-4 py-10 text-center text-sm text-text-muted">
          Nenhum lead ainda. Quando alguém enviar um formulário no site, aparece aqui.
        </p>
      )}

      {leads.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-subtle/15 bg-surface-elevated">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle/15 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Precisa</th>
                <th className="px-4 py-3 font-medium">Estimativa</th>
                <th className="px-4 py-3 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border-subtle/10 last:border-0 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtDate(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{lead.name ?? '—'}</div>
                    {lead.email && <div className="text-xs text-text-muted">{lead.email}</div>}
                    {lead.whatsapp && <div className="text-xs text-text-muted">{lead.whatsapp}</div>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{lead.service_tag ?? '—'}</td>
                  <td className="max-w-[200px] px-4 py-3 text-text-secondary">{needs(lead.selection)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {fmtRange(lead.estimated_min, lead.estimated_max)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {lead.promoted_at ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                        ✓ Promovido
                      </span>
                    ) : (
                      <form action={promoteLead}>
                        <input type="hidden" name="id" value={lead.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-600"
                        >
                          Promover
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
