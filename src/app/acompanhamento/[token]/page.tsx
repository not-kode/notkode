import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { PhaseStatus, TaskStatus } from '@/app/admin/(app)/entregas/status';
import type { Priority } from '@/app/admin/(app)/entregas/status';
import { lerVisao } from '@/app/admin/(app)/entregas/types';
import { Acompanhamento, type TagCliente } from './lista';

// Acompanhamento do cliente: as entregas do projeto dele, por link com token e
// sem login. Mostra SÓ o que estiver marcado como visível no /admin — sprint
// interna e tarefa interna não aparecem aqui —, e no recorte de colunas que
// aquele projeto configurou.

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
  priority: Priority | null; start_date: string | null; due_date: string | null;
  assignee: string | null; parent_task_id: string | null; tag_ids: string[] | null; sort: number | null;
};
type TagRow = { id: string; name: string; color: string; sort: number };

export default async function AcompanhamentoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();

  const { data: eng } = await supabase
    .from('engagements')
    .select('id, title, start_date, end_date, client_view, organizations(name)')
    .eq('client_token', token)
    .maybeSingle();

  // Token inválido ou revogado: 404 seco, sem dizer se já existiu.
  if (!eng) notFound();

  // O join do supabase-js tipa a relação como array; na prática vem um objeto.
  const orgRaw = (eng as unknown as { organizations?: { name: string | null } | { name: string | null }[] | null })
    .organizations;
  const org = Array.isArray(orgRaw) ? orgRaw[0] ?? null : orgRaw ?? null;

  const [{ data: phaseData }, { data: taskData }, { data: tagData }] = await Promise.all([
    supabase
      .from('project_phases')
      .select('id, name, description, status, start_date, end_date, sort')
      .eq('engagement_id', eng.id)
      .eq('client_visible', true)
      .order('sort'),
    supabase
      .from('project_tasks')
      .select('id, phase_id, title, status, priority, start_date, due_date, assignee, parent_task_id, tag_ids, sort')
      .eq('engagement_id', eng.id)
      .eq('client_visible', true)
      .order('sort'),
    supabase
      .from('project_tags')
      .select('id, name, color, sort')
      .eq('engagement_id', eng.id)
      .order('sort'),
  ]);

  const phases = (phaseData ?? []) as PhaseRow[];
  const tasks = (taskData ?? []) as TaskRow[];
  const tags: TagCliente[] = ((tagData ?? []) as TagRow[]).map((t) => ({
    id: t.id, nome: t.name, cor: t.color,
  }));
  const visao = lerVisao((eng as unknown as { client_view: unknown }).client_view);

  // Sem sprints montadas, quem conta o andamento são as próprias entregas: é o
  // caso normal dos projetos daqui, e sem isso a barra de progresso ficava
  // parada em zero mesmo com metade do trabalho entregue.
  const macros = tasks.filter((t) => !t.parent_task_id);
  const feitas = macros.filter((t) => t.status === 'feito').length;
  const emAndamento = macros.filter((t) => t.status === 'fazendo' || t.status === 'revisao');

  const sprintAtual = phases.find((p) => p.status === 'em_andamento') ?? null;
  const sprintsProntas = phases.filter((p) => p.status === 'concluida').length;
  // O progresso conta ENTREGAS, não sprints. Contando sprints, um projeto com 25
  // de 41 entregas prontas aparecia em 0% só porque o status da sprint não tinha
  // sido virado à mão — e é a barra que o cliente olha primeiro.
  const pct = macros.length ? Math.round((feitas / macros.length) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:py-16">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
          Notkode · Acompanhamento
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          {org?.name ?? 'Seu projeto'}
        </h1>
        {eng.title && <p className="mt-1 text-base text-text-secondary">{eng.title}</p>}
      </header>

      {macros.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* O que está acontecendo agora, que é a primeira pergunta de quem abre
              o link. Depois o número frio do que já saiu. */}
          <div className="rounded-lg border border-black/[0.07] bg-white p-4 sm:col-span-2">
            <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">Agora</p>
            <div className="mt-1 text-[15px] leading-snug text-text-primary">
              {sprintAtual ? (
                <strong className="font-medium">{sprintAtual.name}</strong>
              ) : emAndamento.length > 0 ? (
                // No máximo duas: "agora" com seis títulos emendados por ponto
                // virava um parágrafo, e ninguém lê parágrafo em cartão.
                <ul className="flex flex-col gap-0.5">
                  {emAndamento.slice(0, 2).map((t) => (
                    <li key={t.id} className="flex items-baseline gap-2">
                      <span className="text-primary">◐</span>
                      <span className="font-medium">{t.title}</span>
                    </li>
                  ))}
                  {emAndamento.length > 2 && (
                    <li className="text-[13px] text-text-muted">
                      e mais {emAndamento.length - 2} em andamento
                    </li>
                  )}
                </ul>
              ) : feitas === macros.length ? (
                <strong className="font-medium text-success">Projeto concluído</strong>
              ) : (
                'Em andamento'
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-text-muted">{pct}%</span>
            </div>
          </div>

          <div className="rounded-lg border border-black/[0.07] bg-white p-4">
            <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">Entregas</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-text-primary">
              {feitas}<span className="text-base text-text-muted">/{macros.length}</span>
            </p>
            <p className="mt-1 text-[12px] text-text-muted">
              {phases.length > 0
                ? `em ${phases.length} ${phases.length === 1 ? 'sprint' : 'sprints'}${
                  sprintsProntas > 0 ? `, ${sprintsProntas} concluída${sprintsProntas === 1 ? '' : 's'}` : ''
                }`
                : 'concluídas'}
            </p>
          </div>
        </div>
      )}

      {macros.length === 0 && phases.length === 0 ? (
        <p className="rounded-lg border border-black/[0.07] bg-white px-4 py-12 text-center text-sm text-text-muted">
          O cronograma está sendo montado. Em breve as entregas aparecem aqui.
        </p>
      ) : (
        <Acompanhamento
          colunas={visao.colunas}
          // Com sprint montada, é ela que organiza a leitura; sem sprint, a lista
          // corrida por prazo é mais honesta do que grupos de status inventados.
          agrupar={phases.length > 0 ? 'sprint' : 'nenhum'}
          cronograma={visao.cronogramaNoLink}
          tags={tags}
          phases={phases.map((p) => ({
            id: p.id, name: p.name, description: p.description, status: p.status,
            startDate: p.start_date, endDate: p.end_date, clientVisible: true,
          }))}
          tasks={tasks.map((t) => ({
            id: t.id, phaseId: t.phase_id, title: t.title, notes: null, status: t.status,
            priority: t.priority ?? 'media', startDate: t.start_date, dueDate: t.due_date,
            assignee: t.assignee, clientVisible: true, parentId: t.parent_task_id,
            tagIds: t.tag_ids ?? [], sort: t.sort ?? 0,
            tempoSegundos: 0, timerDesde: null, createdAt: '',
          }))}
        />
      )}

      <footer className="mt-12 border-t border-black/[0.07] pt-5">
        <p className="text-xs text-text-muted">
          Dúvida sobre alguma entrega? É só chamar a gente no WhatsApp.
        </p>
      </footer>
    </main>
  );
}
