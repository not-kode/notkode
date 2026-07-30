// Espelho das tarefas no SimbOS. Fica separado das actions porque é efeito de
// borda: se o SimbOS estiver fora do ar, a tarefa continua salva aqui.
//
// Sentido único aqui (daqui para lá). O caminho de volta é /api/sync/simbos.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  PRIORIDADE_PARA_SIMBOS, SIMBOS_WORKSPACE, STATUS_PARA_SIMBOS, simbosAtivo, simbosCall,
} from '@/lib/simbos';

type TarefaLocal = {
  id: string;
  engagement_id: string;
  title: string;
  notes: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  simbos_task_id: string | null;
  parent_task_id: string | null;
};

const agora = () => new Date().toISOString();

/** Projeto do SimbOS correspondente ao contrato, se houver. */
async function projetoSimbos(engagementId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from('engagements')
    .select('simbos_project_id')
    .eq('id', engagementId)
    .maybeSingle();
  return (data?.simbos_project_id as string | null) ?? null;
}

async function tarefa(id: string): Promise<TarefaLocal | null> {
  const { data } = await getSupabaseAdmin()
    .from('project_tasks')
    .select('id, engagement_id, title, notes, status, priority, due_date, simbos_task_id, parent_task_id')
    .eq('id', id)
    .maybeSingle();
  return (data as TarefaLocal | null) ?? null;
}

/**
 * Cria a tarefa no SimbOS e guarda o id devolvido. Sem projeto correspondente
 * lá (contrato que nasceu aqui), não há onde pendurar: fica só local.
 */
export async function espelharCriacao(id: string): Promise<void> {
  if (!simbosAtivo()) return;
  const t = await tarefa(id);
  if (!t || t.simbos_task_id) return;

  const projectId = await projetoSimbos(t.engagement_id);
  if (!projectId) return;

  // Subtarefa nasce pendurada na tarefa-mãe também do lado do SimbOS, se a mãe
  // já tiver par lá. Sem par, sobe como tarefa solta em vez de não subir.
  let parentSimbos: string | null = null;
  if (t.parent_task_id) parentSimbos = await idSimbosDa(t.parent_task_id);

  const criada = await simbosCall('create_task', {
    workspaceSlug: SIMBOS_WORKSPACE,
    projectId,
    parentTaskId: parentSimbos ?? undefined,
    title: t.title,
    description: t.notes ?? undefined,
    status: STATUS_PARA_SIMBOS[t.status] ?? 'todo',
    priority: PRIORIDADE_PARA_SIMBOS[t.priority] ?? 'medium',
    dueDate: t.due_date ?? undefined,
  }) as { id?: string } | null;

  if (criada?.id) {
    await getSupabaseAdmin()
      .from('project_tasks')
      .update({ simbos_task_id: criada.id, simbos_synced_at: agora() })
      .eq('id', id);
  }
}

/** Leva para o SimbOS o que mudou aqui. Tarefa que nasceu aqui e ainda não tem par é criada. */
export async function espelharAtualizacao(id: string): Promise<void> {
  if (!simbosAtivo()) return;
  const t = await tarefa(id);
  if (!t) return;

  if (!t.simbos_task_id) {
    await espelharCriacao(id);
    return;
  }

  await simbosCall('update_task', {
    workspaceSlug: SIMBOS_WORKSPACE,
    taskId: t.simbos_task_id,
    title: t.title,
    status: STATUS_PARA_SIMBOS[t.status] ?? 'todo',
    priority: PRIORIDADE_PARA_SIMBOS[t.priority] ?? 'medium',
    dueDate: t.due_date,
  });

  await getSupabaseAdmin()
    .from('project_tasks')
    .update({ simbos_synced_at: agora() })
    .eq('id', id);
}

/**
 * Apagar aqui apaga lá. Precisa ler a tarefa ANTES de ela sumir do banco, então
 * quem chama passa o id do SimbOS que já tinha em mão.
 */
export async function espelharExclusao(simbosTaskId: string | null): Promise<void> {
  if (!simbosAtivo() || !simbosTaskId) return;
  await simbosCall('delete_task', { workspaceSlug: SIMBOS_WORKSPACE, taskId: simbosTaskId });
  // Fica na lista de exceções: sem isso, uma falha do delete lá traria a tarefa
  // de volta no próximo ciclo de sincronização.
  await getSupabaseAdmin()
    .from('simbos_ignored')
    .upsert({ simbos_id: simbosTaskId, kind: 'task', reason: 'apagada no sistema' });
}

/** O id do SimbOS de uma tarefa, para guardar antes de apagá-la. */
export async function idSimbosDa(id: string): Promise<string | null> {
  const t = await tarefa(id);
  return t?.simbos_task_id ?? null;
}
