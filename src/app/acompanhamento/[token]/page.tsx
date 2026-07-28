import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { PhaseStatus, TaskStatus } from '@/app/admin/(app)/entregas/status';
import { Gantt } from '@/app/admin/(app)/entregas/gantt';

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
type TaskRow = {
  id: string; phase_id: string | null; title: string; status: TaskStatus;
  start_date: string | null; due_date: string | null;
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
      .select('id, phase_id, title, status, start_date, due_date')
      .eq('engagement_id', eng.id)
      .eq('client_visible', true)
      .order('sort'),
  ]);

  const phases = (phaseData ?? []) as PhaseRow[];
  const tasks = (taskData ?? []) as TaskRow[];
  const concluidas = phases.filter((p) => p.status === 'concluida').length;
  const atual = phases.find((p) => p.status === 'em_andamento') ?? null;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-12 sm:py-16">
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

      {phases.length === 0 && tasks.length === 0 ? (
        <p className="rounded-lg border border-black/[0.07] bg-white px-4 py-12 text-center text-sm text-text-muted">
          O cronograma está sendo montado. Em breve as etapas aparecem aqui.
        </p>
      ) : (
        <Gantt
          modoCliente
          titulo="Cronograma"
          phases={phases.map((p) => ({
            id: p.id, name: p.name, description: p.description, status: p.status,
            startDate: p.start_date, endDate: p.end_date, clientVisible: true,
          }))}
          tasks={tasks.map((t) => ({
            id: t.id, phaseId: t.phase_id, title: t.title, notes: null, status: t.status,
            priority: 'media' as const, startDate: t.start_date, dueDate: t.due_date,
            assignee: null, clientVisible: true, sort: 0,
          }))}
        />
      )}

      <footer className="mt-12 border-t border-black/[0.07] pt-5">
        <p className="text-xs text-text-muted">
          Dúvida sobre alguma etapa? É só chamar a gente no WhatsApp.
        </p>
      </footer>
    </main>
  );
}
