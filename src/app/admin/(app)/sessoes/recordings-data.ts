import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type SessionSummary = {
  session_id: string;
  first: string;
  last: string;
  chunks: number;
  entryPage: string | null;
  origem: string;
  device: string;
  vista: boolean;
};

type Chunk = { session_id: string; page: string | null; created_at: string; ua: string | null };
type EventRow = { session_id: string; referrer: string | null; utm_source: string | null };

/** Classifica a origem de uma sessão (utm_source > host do referrer > Direto). */
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

/** Rótulo de dispositivo a partir do user agent (gravações antigas não têm UA salvo). */
function deviceLabel(ua: string | null): string {
  if (!ua) return '—';
  return /mobi|android|iphone|ipad|ipod/i.test(ua) ? 'Mobile' : 'Desktop';
}

export async function carregarGravacoes(): Promise<{ sessions: SessionSummary[]; erro: string | null }> {
  const supabase = getSupabaseAdmin();

  // Só metadados dos chunks (não os eventos, que são pesados).
  const { data: recData, error } = await supabase
    .from('session_recordings')
    .select('session_id, page, created_at, ua')
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
        device: deviceLabel(c.ua),
        vista: false,
      });
    } else {
      cur.last = c.created_at;
      cur.chunks += 1;
      if (!cur.entryPage) cur.entryPage = c.page;
      if (cur.device === '—') cur.device = deviceLabel(c.ua);
    }
  }

  const ids = [...bySession.keys()];
  if (ids.length > 0) {
    // Origem: cruza com os page_views da mesma sessão.
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

    // Quais já foram assistidas.
    const { data: watchedData } = await supabase
      .from('session_watched')
      .select('session_id')
      .in('session_id', ids);
    for (const w of (watchedData ?? []) as { session_id: string }[]) {
      const s = bySession.get(w.session_id);
      if (s) s.vista = true;
    }
  }

  return {
    sessions: [...bySession.values()].sort((a, b) => b.last.localeCompare(a.last)),
    erro: error?.message ?? null,
  };
}
