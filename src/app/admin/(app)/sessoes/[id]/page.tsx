import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SessionPlayer } from './player';
import { PageHeader } from '../../_shared/page-header';

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

  // rrweb só reproduz se houver um FullSnapshot (type 2) do DOM base. Sem ele,
  // o player fica em branco — melhor avisar do que mostrar tela quebrada.
  const hasFullSnapshot = events.some(
    (e) => typeof e === 'object' && e !== null && (e as { type?: number }).type === 2,
  );

  return (
    <div>
      <Link href="/admin/sessoes" className="font-label text-xs text-text-muted transition-colors hover:text-primary">
        ← Analytics
      </Link>
      <PageHeader
        titulo="Gravação"
        className="mb-6 mt-1"
        dados={entryPage ? <>entrou por {entryPage}</> : null}
      />

      {events.length < 2 ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
          Gravação muito curta para reproduzir.
        </p>
      ) : !hasFullSnapshot ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
          Esta gravação não capturou o estado inicial da tela, então não é possível reproduzi-la.
          Sessões novas já são gravadas por completo.
        </p>
      ) : (
        <SessionPlayer events={events} sessionId={id} />
      )}
    </div>
  );
}
