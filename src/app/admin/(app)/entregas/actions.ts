'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PHASE_STATUSES, TASK_STATUSES, type PhaseStatus, type TaskStatus } from './status';

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

  await getSupabaseAdmin().from('project_tasks').insert({
    engagement_id,
    phase_id: str(formData, 'phase_id', 64),
    title,
    due_date: date(formData, 'due_date'),
    assignee: str(formData, 'assignee', 120),
  });

  revalidar();
}

export async function updateTask(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const title = str(formData, 'title', 300);
  if (title) patch.title = title;
  if (formData.has('notes')) patch.notes = str(formData, 'notes', 4000);
  if (formData.has('due_date')) patch.due_date = date(formData, 'due_date');
  if (formData.has('assignee')) patch.assignee = str(formData, 'assignee', 120);
  if (formData.has('phase_id')) patch.phase_id = str(formData, 'phase_id', 64);
  if (formData.has('client_visible')) patch.client_visible = formData.get('client_visible') === 'on';

  const status = str(formData, 'status', 32);
  if (status && TASK_STATUSES.includes(status as TaskStatus)) {
    patch.status = status;
    // Carimba quando ficou pronta; desmarcar limpa, senão a data mente depois.
    patch.done_at = status === 'feito' ? new Date().toISOString() : null;
  }

  await getSupabaseAdmin().from('project_tasks').update(patch).eq('id', id);
  revalidar();
}

export async function deleteTask(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;
  await getSupabaseAdmin().from('project_tasks').delete().eq('id', id);
  revalidar();
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
