import Link from 'next/link';
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
  session_id: string | null;
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

type DraftRow = {
  session_id: string;
  service_tag: string | null;
  name: string | null;
  company: string | null;
  email: string | null;
  whatsapp: string | null;
  last_step: string | null;
  updated_at: string;
};

const waLink = (whatsapp: string) => `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;

export default async function LeadsPage() {
  const supabase = getSupabaseAdmin();
  const [{ data, error }, { data: draftData }] = await Promise.all([
    supabase.from('lead_submissions').select('*').order('created_at', { ascending: false }),
    supabase
      .from('lead_drafts')
      .select('session_id, service_tag, name, company, email, whatsapp, last_step, updated_at')
      .is('submitted_at', null)
      .order('updated_at', { ascending: false }),
  ]);

  const leads = (data ?? []) as LeadRow[];
  const pending = leads.filter((l) => !l.promoted_at).length;
  const drafts = (draftData ?? []) as DraftRow[];

  // Quais leads têm gravação de sessão disponível (pra mostrar o "ver gravação").
  const sessionIds = leads.map((l) => l.session_id).filter((s): s is string => !!s);
  const recorded = new Set<string>();
  if (sessionIds.length > 0) {
    const { data: recData } = await supabase
      .from('session_recordings')
      .select('session_id')
      .in('session_id', sessionIds);
    for (const r of (recData ?? []) as { session_id: string }[]) recorded.add(r.session_id);
  }

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

      {/* Começaram a preencher (já deixaram contato) mas não enviaram. Dá pra correr atrás. */}
      {drafts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
            Começaram e não enviaram ({drafts.length})
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Preencheram parte do formulário e deixaram um contato, mas não finalizaram. Dá pra chamar no WhatsApp.
          </p>
          <div className="overflow-x-auto rounded-md border border-warning/25 bg-warning/[0.03]">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Última atividade</th>
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <th className="px-4 py-3 font-medium">Serviço</th>
                  <th className="px-4 py-3 font-medium">Parou em</th>
                  <th className="px-4 py-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((d) => (
                  <tr key={d.session_id} className="border-b border-border-subtle/10 align-top last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtDate(d.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{d.name ?? '—'}{d.company ? ` · ${d.company}` : ''}</div>
                      {d.email && <div className="text-xs text-text-muted">{d.email}</div>}
                      {d.whatsapp && <div className="text-xs text-text-muted">{d.whatsapp}</div>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{d.service_tag ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{d.last_step ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {d.whatsapp ? (
                        <a
                          href={waLink(d.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-95"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted">sem whats</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!error && leads.length === 0 && (
        <p className="rounded-md border border-border-subtle/20 bg-white px-4 py-10 text-center text-sm text-text-muted">
          Nenhum lead ainda. Quando alguém enviar um formulário no site, aparece aqui.
        </p>
      )}

      {leads.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-black/[0.06] bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
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
                    {lead.session_id && recorded.has(lead.session_id) && (
                      <Link
                        href={`/admin/sessoes/${lead.session_id}`}
                        className="mt-1 inline-flex items-center gap-1 font-label text-[10px] text-primary transition-colors hover:underline"
                      >
                        ▶ ver gravação
                      </Link>
                    )}
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
