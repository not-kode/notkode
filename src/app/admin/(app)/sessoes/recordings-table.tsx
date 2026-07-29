import Link from 'next/link';
import { deleteRecording, toggleWatched } from './actions';
import type { SessionSummary } from './recordings-data';

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

export function RecordingsTable({ sessions }: { sessions: SessionSummary[] }) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
        Nenhuma gravação ainda. Assim que alguém navegar no site, a sessão aparece aqui.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-black/[0.06] bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-black/[0.06] text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
            <th className="w-10 px-4 py-3 font-medium" title="Já assisti esta gravação">Vi</th>
            <th className="px-4 py-3 font-medium">Quando</th>
            <th className="px-4 py-3 font-medium">Origem</th>
            <th className="px-4 py-3 font-medium">Dispositivo</th>
            <th className="px-4 py-3 font-medium">Entrou por</th>
            <th className="px-4 py-3 font-medium">Duração</th>
            <th className="px-4 py-3 font-medium">Ação</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.session_id}
              className={`border-b border-border-subtle/10 last:border-0 ${s.vista ? 'text-text-muted/70' : ''}`}
            >
              {/* Quadradinho: sai do formulário com o estado atual, a action inverte. */}
              <td className="px-4 py-3">
                <form action={toggleWatched}>
                  <input type="hidden" name="session_id" value={s.session_id} />
                  <input type="hidden" name="watched" value={s.vista ? 'on' : 'off'} />
                  <button
                    type="submit"
                    title={s.vista ? 'Marcada como vista. Clique para desmarcar' : 'Marcar como vista'}
                    aria-label={s.vista ? 'Desmarcar como vista' : 'Marcar como vista'}
                    className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
                      s.vista
                        ? 'border-primary bg-primary text-white'
                        : 'border-black/20 bg-white hover:border-primary'
                    }`}
                  >
                    {s.vista && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path d="M4 12l5.5 5.5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </form>
              </td>
              <td className={`whitespace-nowrap px-4 py-3 ${s.vista ? 'text-text-muted' : 'font-medium text-text-primary'}`}>
                {fmtDateTime(s.last)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{s.origem}</td>
              <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{s.device}</td>
              <td className="px-4 py-3 text-text-secondary">{s.entryPage ?? '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                {fmtDuration(new Date(s.last).getTime() - new Date(s.first).getTime())}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/sessoes/${s.session_id}`}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      s.vista
                        ? 'border border-black/[0.12] bg-white text-text-secondary hover:border-primary/40 hover:text-primary'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    ▶ {s.vista ? 'Rever' : 'Assistir'}
                  </Link>
                  <form action={deleteRecording}>
                    <input type="hidden" name="session_id" value={s.session_id} />
                    <button
                      type="submit"
                      title="Apagar esta gravação (não apaga os dados de analytics da sessão)"
                      className="rounded-md border border-black/[0.12] px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:border-danger/40 hover:bg-danger/5 hover:text-danger"
                    >
                      Apagar
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
