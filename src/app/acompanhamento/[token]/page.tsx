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
  start_date: string | null; due_date: string | null; assignee: string | null;
  parent_task_id: string | null;
};

/** "12 ago" — data curta, do jeito que se lê num acompanhamento. */
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function fmtDataCurta(d: string): string {
  const [, m, dia] = d.split('-');
  return `${Number(dia)} ${MESES_CURTOS[Number(m) - 1]}`;
}

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
      .select('id, phase_id, title, status, start_date, due_date, assignee, parent_task_id')
      .eq('engagement_id', eng.id)
      .eq('client_visible', true)
      .order('sort'),
  ]);

  const phases = (phaseData ?? []) as PhaseRow[];
  const tasks = (taskData ?? []) as TaskRow[];

  // Sem etapas montadas, quem conta o andamento são as próprias tarefas: é o
  // caso normal dos projetos daqui, e sem isso a barra de progresso ficava
  // parada em zero mesmo com metade do trabalho entregue.
  const macros = tasks.filter((t) => !t.parent_task_id);
  /** As subtarefas de uma entrega, na ordem em que vencem. */
  const subs = (id: string) =>
    tasks
      .filter((t) => t.parent_task_id === id)
      .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'));
  const feitas = macros.filter((t) => t.status === 'feito');
  const proximas = macros
    .filter((t) => t.status !== 'feito')
    .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'));

  const concluidas = phases.length > 0 ? phases.filter((p) => p.status === 'concluida').length : feitas.length;
  const total = phases.length > 0 ? phases.length : macros.length;
  const atual = phases.find((p) => p.status === 'em_andamento') ?? null;
  const fazendo = macros.find((t) => t.status === 'fazendo') ?? null;

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

        {total > 0 && (
          <div className="mt-5 rounded-lg border border-black/[0.07] bg-white px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-text-secondary">
                {atual ? (
                  <>Agora em <strong className="font-medium text-text-primary">{atual.name}</strong></>
                ) : fazendo ? (
                  <>Agora em <strong className="font-medium text-text-primary">{fazendo.title}</strong></>
                ) : concluidas === total ? (
                  <strong className="font-medium text-success">Projeto concluído</strong>
                ) : (
                  'Em andamento'
                )}
              </p>
              <p className="font-mono text-xs tabular-nums text-text-muted">
                {concluidas}/{total} {phases.length > 0 ? 'etapas' : 'entregas'}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${total ? (concluidas / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {macros.length === 0 && phases.length === 0 ? (
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
            assignee: t.assignee, clientVisible: true, parentId: t.parent_task_id, sort: 0,
            tempoSegundos: 0, timerDesde: null, createdAt: '',
          }))}
        />
      )}

      {/* Depois do desenho, a leitura em palavras: o que já ficou pronto e o que
          vem agora. É o que o cliente pergunta no WhatsApp. */}
      {macros.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <section className="rounded-lg border border-black/[0.07] bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Já entregue ({feitas.length})
            </h2>
            {feitas.length === 0 ? (
              <p className="text-sm text-text-muted">Nada concluído ainda.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {feitas.map((t) => (
                  <Entrega key={t.id} task={t} partes={subs(t.id)} />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-black/[0.07] bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Próximos ({proximas.length})
            </h2>
            {proximas.length === 0 ? (
              <p className="text-sm text-text-muted">Tudo em dia por aqui.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {proximas.map((t) => (
                  <Entrega key={t.id} task={t} partes={subs(t.id)} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <footer className="mt-12 border-t border-black/[0.07] pt-5">
        <p className="text-xs text-text-muted">
          Dúvida sobre alguma etapa? É só chamar a gente no WhatsApp.
        </p>
      </footer>
    </main>
  );
}

/** O marcador de estado de uma linha: feito, em andamento, ainda por fazer. */
function Marca({ status }: { status: TaskStatus }) {
  if (status === 'feito') return <span className="text-success">✓</span>;
  if (status === 'fazendo') return <span className="text-primary">◐</span>;
  return <span className="text-text-muted">○</span>;
}

/**
 * Uma entrega e o que ela tem dentro. As subtarefas ficam à vista, recuadas: é o
 * que faz o cliente entender o que é aquela linha sem precisar perguntar. Quando
 * a entrega tem partes, o contador diz quantas já saíram.
 */
function Entrega({ task, partes }: { task: TaskRow; partes: TaskRow[] }) {
  const prontas = partes.filter((p) => p.status === 'feito').length;

  return (
    <li className="text-sm">
      <div className="flex items-baseline gap-2">
        <Marca status={task.status} />
        <span className="text-text-secondary">{task.title}</span>
        {partes.length > 0 && (
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-text-muted">
            {prontas}/{partes.length}
          </span>
        )}
        {task.due_date && (
          <span className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-text-muted">
            {fmtDataCurta(task.due_date)}
          </span>
        )}
      </div>

      {partes.length > 0 && (
        <ul className="mt-1.5 flex flex-col gap-1 border-l border-black/[0.08] pl-3 sm:ml-4">
          {partes.map((p) => (
            <li key={p.id} className="flex items-baseline gap-2 text-[13px]">
              <Marca status={p.status} />
              <span className={p.status === 'feito' ? 'text-text-muted' : 'text-text-secondary'}>
                {p.title}
              </span>
              {p.due_date && (
                <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-text-muted">
                  {fmtDataCurta(p.due_date)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
