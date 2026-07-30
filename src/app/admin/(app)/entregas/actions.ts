'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PHASE_STATUSES, PRIORITIES, TASK_STATUSES, type PhaseStatus, type Priority, type TaskStatus } from './status';
import { espelharAtualizacao, espelharCriacao, espelharExclusao, idSimbosDa } from './simbos-mirror';
import { sincronizarComSimbos, type ResultadoSync } from '@/lib/simbos-sync';

const str = (fd: FormData, key: string, max = 500): string | null => {
  const v = fd.get(key);
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
};
const date = (fd: FormData, key: string): string | null => {
  const s = str(fd, key, 10);
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

function revalidar(): void {
  revalidatePath('/admin/entregas');
  revalidatePath('/admin');
}

// ── Etapas ───────────────────────────────────────────────────────────────────

export async function createPhase(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  const name = str(formData, 'name', 200);
  if (!engagement_id || !name) return;

  const supabase = getSupabaseAdmin();
  // Entra no fim da fila: a etapa nova é a próxima do cronograma.
  const { data: ultima } = await supabase
    .from('project_phases')
    .select('sort')
    .eq('engagement_id', engagement_id)
    .order('sort', { ascending: false })
    .limit(1);

  await supabase.from('project_phases').insert({
    engagement_id,
    name,
    description: str(formData, 'description', 2000),
    start_date: date(formData, 'start_date'),
    end_date: date(formData, 'end_date'),
    sort: ((ultima?.[0]?.sort as number | undefined) ?? -1) + 1,
  });

  revalidar();
}

export async function updatePhase(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const name = str(formData, 'name', 200);
  if (name) patch.name = name;
  if (formData.has('description')) patch.description = str(formData, 'description', 2000);
  if (formData.has('start_date')) patch.start_date = date(formData, 'start_date');
  if (formData.has('end_date')) patch.end_date = date(formData, 'end_date');

  const status = str(formData, 'status', 32);
  if (status && PHASE_STATUSES.includes(status as PhaseStatus)) patch.status = status;
  if (formData.has('client_visible')) patch.client_visible = formData.get('client_visible') === 'on';

  await getSupabaseAdmin().from('project_phases').update(patch).eq('id', id);
  revalidar();
}

export async function deletePhase(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;
  // As tarefas da etapa não somem junto: viram tarefas soltas do projeto
  // (on delete set null no phase_id). Apagar etapa não pode apagar trabalho.
  await getSupabaseAdmin().from('project_phases').delete().eq('id', id);
  revalidar();
}

/** Move a etapa uma posição para cima ou para baixo, trocando o sort com a vizinha. */
export async function movePhase(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  const dir = str(formData, 'dir', 8);
  if (!id || (dir !== 'up' && dir !== 'down')) return;

  const supabase = getSupabaseAdmin();
  const { data: atual } = await supabase
    .from('project_phases')
    .select('id, sort, engagement_id')
    .eq('id', id)
    .single();
  if (!atual) return;

  const { data: vizinhas } = await supabase
    .from('project_phases')
    .select('id, sort')
    .eq('engagement_id', atual.engagement_id)
    .order('sort', { ascending: dir === 'down' })
    [dir === 'down' ? 'gt' : 'lt']('sort', atual.sort)
    .limit(1);

  const vizinha = vizinhas?.[0];
  if (!vizinha) return;

  await supabase.from('project_phases').update({ sort: vizinha.sort }).eq('id', atual.id);
  await supabase.from('project_phases').update({ sort: atual.sort }).eq('id', vizinha.id);
  revalidar();
}

// ── Tarefas ──────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  const title = str(formData, 'title', 300);
  if (!engagement_id || !title) return;

  const status = str(formData, 'status', 32);
  const priority = str(formData, 'priority', 16);
  const supabase = getSupabaseAdmin();

  // Entra no fim da coluna em que foi criada, para não embaralhar a ordem manual.
  const { data: ultima } = await supabase
    .from('project_tasks')
    .select('sort')
    .eq('engagement_id', engagement_id)
    .order('sort', { ascending: false })
    .limit(1);

  const { data: criada } = await supabase.from('project_tasks').insert({
    engagement_id,
    phase_id: str(formData, 'phase_id', 64),
    title,
    start_date: date(formData, 'start_date'),
    due_date: date(formData, 'due_date'),
    assignee: str(formData, 'assignee', 120),
    status: status && TASK_STATUSES.includes(status as TaskStatus) ? status : 'a_fazer',
    priority: priority && PRIORITIES.includes(priority as Priority) ? priority : 'media',
    sort: ((ultima?.[0]?.sort as number | undefined) ?? -1) + 1,
  }).select('id').maybeSingle();

  if (criada?.id) await espelharCriacao(criada.id as string);
  revalidar();
}

export async function updateTask(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const title = str(formData, 'title', 300);
  if (title) patch.title = title;
  if (formData.has('notes')) patch.notes = str(formData, 'notes', 4000);
  if (formData.has('start_date')) patch.start_date = date(formData, 'start_date');
  if (formData.has('due_date')) patch.due_date = date(formData, 'due_date');
  if (formData.has('assignee')) patch.assignee = str(formData, 'assignee', 120);
  if (formData.has('phase_id')) patch.phase_id = str(formData, 'phase_id', 64);
  if (formData.has('client_visible')) patch.client_visible = formData.get('client_visible') === 'on';

  const priority = str(formData, 'priority', 16);
  if (priority && PRIORITIES.includes(priority as Priority)) patch.priority = priority;

  const status = str(formData, 'status', 32);
  if (status && TASK_STATUSES.includes(status as TaskStatus)) {
    patch.status = status;
    // Carimba quando ficou pronta; desmarcar limpa, senão a data mente depois.
    patch.done_at = status === 'feito' ? new Date().toISOString() : null;
  }

  await getSupabaseAdmin().from('project_tasks').update(patch).eq('id', id);
  await espelharAtualizacao(id);
  revalidar();
}

/**
 * Arrastar no Kanban: muda o status e recoloca a tarefa na ordem da coluna de
 * destino. `before` é o id da tarefa sobre a qual ela foi solta (vazio = fim da
 * coluna). A reordenação é feita reescrevendo o sort da coluna inteira, que é
 * barato no volume de tarefas de um projeto e evita brigas de índice.
 */
export async function moveTask(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  const status = str(formData, 'status', 32);
  const before = str(formData, 'before', 64);
  if (!id || !status || !TASK_STATUSES.includes(status as TaskStatus)) return;

  const supabase = getSupabaseAdmin();
  const { data: atual } = await supabase
    .from('project_tasks')
    .select('id, engagement_id, status')
    .eq('id', id)
    .single();
  if (!atual) return;

  await supabase
    .from('project_tasks')
    .update({
      status,
      // Mesma regra do updateTask: a data de conclusão não pode mentir depois.
      done_at: status === 'feito' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  const { data: coluna } = await supabase
    .from('project_tasks')
    .select('id, sort')
    .eq('engagement_id', atual.engagement_id)
    .eq('status', status)
    .order('sort');

  const ids = (coluna ?? []).map((t) => t.id as string).filter((t) => t !== id);
  const alvo = before ? ids.indexOf(before) : -1;
  ids.splice(alvo >= 0 ? alvo : ids.length, 0, id);

  await Promise.all(ids.map((taskId, i) => supabase.from('project_tasks').update({ sort: i }).eq('id', taskId)));
  // Arrastar entre colunas é mudança de status: o SimbOS tem que saber.
  if (atual.status !== status) await espelharAtualizacao(id);
  revalidar();
}

export async function deleteTask(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;
  // O id do SimbOS tem que ser lido antes de a linha sumir.
  const simbosId = await idSimbosDa(id);
  await getSupabaseAdmin().from('project_tasks').delete().eq('id', id);
  await espelharExclusao(simbosId);
  revalidar();
}

/**
 * Puxa agora o que mudou no SimbOS, sem esperar o ciclo de 10 minutos do cron.
 * Devolve o resumo para a tela dizer o que aconteceu.
 */
export async function sincronizarSimbos(): Promise<ResultadoSync> {
  const r = await sincronizarComSimbos();
  revalidar();
  return r;
}

// ── Link de acompanhamento do cliente ────────────────────────────────────────

/** Gera (ou regenera) o token do link público de acompanhamento do contrato. */
export async function generateClientToken(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  if (!engagement_id) return;

  const token = crypto.randomUUID().replace(/-/g, '');
  await getSupabaseAdmin().from('engagements').update({ client_token: token }).eq('id', engagement_id);
  revalidar();
}

/** Revoga o link: quem tiver a URL antiga deixa de ver o cronograma. */
export async function revokeClientToken(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  if (!engagement_id) return;
  await getSupabaseAdmin().from('engagements').update({ client_token: null }).eq('id', engagement_id);
  revalidar();
}
