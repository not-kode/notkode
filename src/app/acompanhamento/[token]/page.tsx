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

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "3 ago" — a mesma data curta dos chips da lista. */
const fmtCurto = (d: string | null): string | null => {
  if (!d) return null;
  const [, m, dia] = d.split('-');
  return `${Number(dia)} ${MESES[Number(m) - 1]}`;
};

/**
 * Dias úteis entre duas datas, contando o dia final e pulando sábado e domingo.
 * Feriado não entra na conta: a lista deles muda por cidade, e errar para menos
 * seria pior do que arredondar para o lado do trabalho.
 */
function diasUteis(de: string, ate: string): number {
  let dias = 0;
  const fim = Date.parse(`${ate}T00:00:00Z`);
  for (let t = Date.parse(`${de}T00:00:00Z`); t <= fim; t += 86_400_000) {
    const semana = new Date(t).getUTCDay();
    if (semana !== 0 && semana !== 6) dias += 1;
  }
  // O próprio dia de hoje não é "quanto falta": entra na conta e sai de novo.
  return Math.max(0, dias - 1);
}

/** A menor das datas, ignorando as vazias. */
const menor = (datas: (string | null)[]) => datas.filter(Boolean).sort()[0] ?? null;
const maior = (datas: (string | null)[]) => datas.filter(Boolean).sort().at(-1) ?? null;

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
  // O progresso conta ENTREGAS, não sprints. Contando sprints, um projeto com 25
  // de 41 entregas prontas aparecia em 0% só porque o status da sprint não tinha
  // sido virado à mão — e é a barra que o cliente olha primeiro.
  const pct = macros.length ? Math.round((feitas / macros.length) * 100) : 0;

  // Prazo do projeto: quem manda é o cronograma, porque é ele que diz o que
  // ainda tem para entregar. A data do contrato entra só quando não há
  // cronograma montado; sem nenhuma das duas, o bloco não aparece.
  const inicio = menor([
    ...phases.map((p) => p.start_date),
    ...tasks.map((t) => t.start_date),
  ]) ?? eng.start_date;
  const fim = maior([
    ...phases.map((p) => p.end_date),
    ...tasks.map((t) => t.due_date),
  ]) ?? eng.end_date;

  const hoje = new Date().toISOString().slice(0, 10);
  const faltam = fim ? diasUteis(hoje, fim) : null;
  /**
   * Quanto falta, em dias úteis: é assim que o prazo é combinado na proposta
   * ("6 semanas de dias úteis"), e contar sábado e domingo daria um número que
   * não bate com o que a gente vendeu.
   *
   * Prazo estourado não vira carimbo aqui: atraso é conversa nossa com o
   * cliente, não um aviso que ele encontra sozinho abrindo o link.
   */
  const restante = pct === 100
    ? 'Projeto entregue'
    : faltam === null || (fim !== null && fim < hoje)
      ? null
      : faltam === 0
        ? 'Termina hoje'
        : faltam === 1
          ? 'Falta 1 dia útil'
          : `Faltam ${faltam} dias úteis`;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
            Notkode · Acompanhamento
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
            {org?.name ?? 'Seu projeto'}
          </h1>
          {eng.title && <p className="mt-1 text-base text-text-secondary">{eng.title}</p>}
        </div>

        {(inicio || fim) && (
          <div className="sm:text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Prazo do projeto
            </p>
            <p className="mt-2 text-base font-medium tabular-nums text-text-primary">
              {fmtCurto(inicio) ?? '—'} a {fmtCurto(fim) ?? '—'}
            </p>
            {restante && <p className="mt-1 text-sm text-text-secondary">{restante}</p>}
          </div>
        )}
      </header>

      {macros.length > 0 && (
        <div className="mb-6 rounded-lg border border-black/[0.07] bg-white px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-text-secondary">
              {sprintAtual ? (
                <>Agora em <strong className="font-medium text-text-primary">{sprintAtual.name}</strong></>
              ) : emAndamento.length > 0 ? (
                <>
                  Agora em{' '}
                  <strong className="font-medium text-text-primary">{emAndamento[0].title}</strong>
                  {emAndamento.length > 1 && (
                    <span className="text-text-muted"> e mais {emAndamento.length - 1}</span>
                  )}
                </>
              ) : feitas === macros.length ? (
                <strong className="font-medium text-success">Projeto concluído</strong>
              ) : (
                'Em andamento'
              )}
            </p>
            <p className="font-mono text-xs tabular-nums text-text-muted">
              {feitas}/{macros.length} entregas · {pct}%
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
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
          // O mesmo agrupamento escolhido na lista da casa.
          agrupar={visao.agrupar}
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
