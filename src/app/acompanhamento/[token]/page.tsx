import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PHASE_LABELS, type PhaseStatus, type TaskStatus } from '@/app/admin/(app)/entregas/status';

// Acompanhamento do cliente: o cronograma do projeto dele, por link com token e
// sem login. Mostra SÓ o que estiver marcado como visível no /admin — etapa
// interna e tarefa interna não aparecem aqui.

export const dynamic = 'force-dynamic';

// Página privada por link: não deve ser indexada nem aparecer em busca.
export const metadata: Metadata = {
  title: 'Acompanhamento do projeto',
  robots: { index: false, follow: false },
};

type PhaseRow = {
  id: string; name: string; description: string | null; status: PhaseStatus;
  start_date: string | null; end_date: string | null; sort: number;
};
type TaskRow = { id: string; phase_id: string | null; title: string; status: TaskStatus };

const fmt = (d: string | null) => {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const DOT: Record<PhaseStatus, string> = {
  pendente: 'border-black/15 bg-white',
  em_andamento: 'border-primary bg-primary',
  concluida: 'border-success bg-success',
  pausada: 'border-warning bg-warning',
};
const PILL: Record<PhaseStatus, string> = {
  pendente: 'bg-black/[0.05] text-text-muted',
  em_andamento: 'bg-primary/10 text-primary',
  concluida: 'bg-success/10 text-success',
  pausada: 'bg-warning/15 text-warning',
};

export default async function AcompanhamentoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();

  const { data: eng } = await supabase
    .from('engagements')
    .select('id, title, start_date, end_date, organizations(name)')
    .eq('client_token', token)
    .maybeSingle();

  // Token inválido ou revogado: 404 seco, sem dizer se já existiu.
  if (!eng) notFound();

  // O join do supabase-js tipa a relação como array; na prática vem um objeto.
  const orgRaw = (eng as unknown as { organizations?: { name: string | null } | { name: string | null }[] | null })
    .organizations;
  const org = Array.isArray(orgRaw) ? orgRaw[0] ?? null : orgRaw ?? null;

  const [{ data: phaseData }, { data: taskData }] = await Promise.all([
    supabase
      .from('project_phases')
      .select('id, name, description, status, start_date, end_date, sort')
      .eq('engagement_id', eng.id)
      .eq('client_visible', true)
      .order('sort'),
    supabase
      .from('project_tasks')
      .select('id, phase_id, title, status')
      .eq('engagement_id', eng.id)
      .eq('client_visible', true)
      .order('sort'),
  ]);

  const phases = (phaseData ?? []) as PhaseRow[];
  const tasks = (taskData ?? []) as TaskRow[];
  const concluidas = phases.filter((p) => p.status === 'concluida').length;
  const atual = phases.find((p) => p.status === 'em_andamento') ?? null;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 sm:py-16">
      <header className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
          Notkode · Acompanhamento
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          {org?.name ?? 'Seu projeto'}
        </h1>
        {eng.title && <p className="mt-1 text-base text-text-secondary">{eng.title}</p>}

        {phases.length > 0 && (
          <div className="mt-5 rounded-lg border border-black/[0.07] bg-white px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-text-secondary">
                {atual ? (
                  <>Agora em <strong className="font-medium text-text-primary">{atual.name}</strong></>
                ) : concluidas === phases.length ? (
                  <strong className="font-medium text-success">Projeto concluído</strong>
                ) : (
                  'Em preparação'
                )}
              </p>
              <p className="font-mono text-xs tabular-nums text-text-muted">
                {concluidas}/{phases.length} etapas
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${phases.length ? (concluidas / phases.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {phases.length === 0 ? (
        <p className="rounded-lg border border-black/[0.07] bg-white px-4 py-12 text-center text-sm text-text-muted">
          O cronograma está sendo montado. Em breve as etapas aparecem aqui.
        </p>
      ) : (
        <ol className="relative flex flex-col">
          {phases.map((phase, i) => {
            const doPhase = tasks.filter((t) => t.phase_id === phase.id);
            const ultima = i === phases.length - 1;
            return (
              <li key={phase.id} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Trilha da linha do tempo */}
                <div className="flex flex-col items-center">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${DOT[phase.status]}`} />
                  {!ultima && <span className="mt-1 w-px flex-1 bg-black/[0.09]" />}
                </div>

                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-medium text-text-primary">{phase.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${PILL[phase.status]}`}>
                      {PHASE_LABELS[phase.status]}
                    </span>
                  </div>

                  {(phase.start_date || phase.end_date) && (
                    <p className="mt-0.5 font-mono text-[11px] text-text-muted">
                      {fmt(phase.start_date) ?? '—'} a {fmt(phase.end_date) ?? '—'}
                    </p>
                  )}

                  {phase.description && (
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{phase.description}</p>
                  )}

                  {doPhase.length > 0 && (
                    <ul className="mt-2.5 flex flex-col gap-1">
                      {doPhase.map((t) => (
                        <li key={t.id} className="flex items-baseline gap-2 text-sm">
                          <span className={t.status === 'feito' ? 'text-success' : 'text-text-muted'}>
                            {t.status === 'feito' ? '✓' : '·'}
                          </span>
                          <span className={t.status === 'feito' ? 'text-text-muted' : 'text-text-secondary'}>
                            {t.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <footer className="mt-12 border-t border-black/[0.07] pt-5">
        <p className="text-xs text-text-muted">
          Dúvida sobre alguma etapa? É só chamar a gente no WhatsApp.
        </p>
      </footer>
    </main>
  );
}
