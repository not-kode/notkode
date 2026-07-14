import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// Classifica a origem de uma sessão (utm_source > host do referrer > Direto).
function classifySource(referrer: string | null, utmSource: string | null): string {
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (s.includes('insta') || s === 'ig') return 'Instagram';
    if (s.includes('google')) return 'Google';
    if (s.includes('face') || s === 'fb') return 'Facebook';
    if (s.includes('linkedin')) return 'LinkedIn';
    if (s.includes('whats')) return 'WhatsApp';
    return utmSource;
  }
  if (!referrer) return 'Direto';
  let host: string;
  try {
    host = new URL(referrer).host.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'Direto';
  }
  if (!host || host.includes('notkode')) return 'Direto';
  if (host.includes('google')) return 'Google';
  if (host.includes('instagram')) return 'Instagram';
  if (host.includes('facebook')) return 'Facebook';
  if (host.includes('linkedin')) return 'LinkedIn';
  return host;
}

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}min${rest ? ` ${rest}s` : ''}`;
}

type Chunk = { session_id: string; page: string | null; created_at: string };
type EventRow = { session_id: string; referrer: string | null; utm_source: string | null };

type SessionSummary = {
  session_id: string;
  first: string;
  last: string;
  chunks: number;
  entryPage: string | null;
  origem: string;
};

export default async function SessoesPage() {
  const supabase = getSupabaseAdmin();

  // Só metadados dos chunks (não os eventos, que são pesados).
  const { data: recData, error } = await supabase
    .from('session_recordings')
    .select('session_id, page, created_at')
    .order('created_at', { ascending: true });

  const chunks = (recData ?? []) as Chunk[];

  // Agrega por sessão.
  const bySession = new Map<string, SessionSummary>();
  for (const c of chunks) {
    const cur = bySession.get(c.session_id);
    if (!cur) {
      bySession.set(c.session_id, {
        session_id: c.session_id,
        first: c.created_at,
        last: c.created_at,
        chunks: 1,
        entryPage: c.page,
        origem: 'Direto',
      });
    } else {
      cur.last = c.created_at;
      cur.chunks += 1;
      if (!cur.entryPage) cur.entryPage = c.page;
    }
  }

  // Origem: cruza com os page_views da mesma sessão.
  const ids = [...bySession.keys()];
  if (ids.length > 0) {
    const { data: evData } = await supabase
      .from('events')
      .select('session_id, referrer, utm_source')
      .eq('type', 'page_view')
      .in('session_id', ids);
    const seen = new Set<string>();
    for (const e of (evData ?? []) as EventRow[]) {
      if (seen.has(e.session_id)) continue; // 1º page_view basta
      seen.add(e.session_id);
      const s = bySession.get(e.session_id);
      if (s) s.origem = classifySource(e.referrer, e.utm_source);
    }
  }

  const sessions = [...bySession.values()].sort((a, b) => b.last.localeCompare(a.last));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Sessões</h1>
        <p className="mt-1 text-sm text-text-muted">
          {sessions.length} gravação{sessions.length === 1 ? '' : 'ões'} · assista o que cada visitante fez no site. Texto digitado fica mascarado.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Erro ao carregar sessões: {error.message}
        </p>
      )}

      {!error && sessions.length === 0 && (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
          Nenhuma gravação ainda. Assim que alguém navegar no site, a sessão aparece aqui.
        </p>
      )}

      {sessions.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-black/[0.06] bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Entrou por</th>
                <th className="px-4 py-3 font-medium">Duração</th>
                <th className="px-4 py-3 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.session_id} className="border-b border-border-subtle/10 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtDateTime(s.last)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{s.origem}</td>
                  <td className="px-4 py-3 text-text-secondary">{s.entryPage ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {fmtDuration(new Date(s.last).getTime() - new Date(s.first).getTime())}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/sessoes/${s.session_id}`}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary/90"
                    >
                      ▶ Assistir
                    </Link>
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
