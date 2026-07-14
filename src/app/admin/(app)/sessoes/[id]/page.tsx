import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SessionPlayer } from './player';

export const dynamic = 'force-dynamic';

type ChunkRow = { events: unknown[] | null; page: string | null; created_at: string };

export default async function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('session_recordings')
    .select('events, page, created_at')
    .eq('session_id', id)
    .order('created_at', { ascending: true });

  const chunks = (data ?? []) as ChunkRow[];
  const events = chunks.flatMap((c) => (Array.isArray(c.events) ? c.events : []));
  const entryPage = chunks.find((c) => c.page)?.page ?? null;

  return (
    <div>
      <header className="mb-6">
        <Link href="/admin/sessoes" className="font-label text-xs text-text-muted transition-colors hover:text-primary">
          ← Sessões
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Gravação da sessão</h1>
        <p className="mt-1 text-sm text-text-muted">
          {entryPage ? `Entrou por ${entryPage} · ` : ''}Texto digitado aparece mascarado.
        </p>
      </header>

      {events.length < 2 ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
          Gravação muito curta para reproduzir.
        </p>
      ) : (
        <SessionPlayer events={events} />
      )}
    </div>
  );
}
