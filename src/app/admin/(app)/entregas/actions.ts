'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  PHASE_STATUSES, PRIORITIES, RESPONSAVEL_PADRAO, TASK_STATUSES,
  type PhaseStatus, type Priority, type TaskStatus,
} from './status';
import { SIMBOS_WORKSPACE, simbosCall } from '@/lib/simbos';
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

/**
 * O que gravar para parar o cronômetro de uma tarefa, somando o que correu desde
 * que foi ligado. Devolve objeto vazio quando o relógio já estava parado.
 */
async function fecharRelogio(id: string): Promise<Record<string, unknown>> {
  const { data } = await getSupabaseAdmin()
    .from('project_tasks')
    .select('time_spent_seconds, timer_started_at')
    .eq('id', id)
    .maybeSingle();

  const desde = data?.timer_started_at as string | null | undefined;
  if (!desde) return {};

  const corrido = Math.max(0, Math.round((Date.now() - Date.parse(desde)) / 1000));
  return {
    time_spent_seconds: ((data?.time_spent_seconds as number | null) ?? 0) + corrido,
    timer_started_at: null,
  };
}

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
    parent_task_id: str(formData, 'parent_task_id', 64),
    title,
    start_date: date(formData, 'start_date'),
    due_date: date(formData, 'due_date'),
    // Sem responsável dito, a tarefa nasce na mão da Camila: é quem toca quase tudo.
    assignee: str(formData, 'assignee', 120) ?? RESPONSAVEL_PADRAO,
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
    // Tarefa concluída não pode continuar contando tempo.
    if (status === 'feito') Object.assign(patch, await fecharRelogio(id));
  }

  await getSupabaseAdmin().from('project_tasks').update(patch).eq('id', id);
  await espelharAtualizacao(id);
  revalidar();
}

/**
 * Arrastar no quadro ou na lista: muda o status e recoloca as tarefas na ordem
 * da coluna de destino. `before` é o id da tarefa sobre a qual foram soltas
 * (vazio = fim da coluna), e `ids` aceita mais de uma, porque arrastar um lote
 * selecionado tem que mover o lote inteiro de uma vez.
 *
 * A reordenação reescreve o sort da coluna toda, que é barato no volume de
 * tarefas de um projeto e evita brigas de índice.
 */
export async function moveTask(formData: FormData): Promise<void> {
  const pedidos = (str(formData, 'ids', 8000) ?? str(formData, 'id', 64) ?? '')
    .split(',')
    .filter(Boolean)
    .slice(0, 500);
  const status = str(formData, 'status', 32);
  const before = str(formData, 'before', 64);
  if (!pedidos.length || !status || !TASK_STATUSES.includes(status as TaskStatus)) return;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('project_tasks')
    .select('id, engagement_id, status')
    .in('id', pedidos);

  const atuais = (data ?? []) as { id: string; engagement_id: string; status: string }[];
  if (!atuais.length) return;

  const agora = new Date().toISOString();
  for (const t of atuais) {
    await supabase
      .from('project_tasks')
      .update({
        status,
        // Mesma regra do updateTask: a data de conclusão não pode mentir depois.
        done_at: status === 'feito' ? agora : null,
        updated_at: agora,
        ...(status === 'feito' ? await fecharRelogio(t.id) : {}),
      })
      .eq('id', t.id);
  }

  // A ordem pedida é a que aparece na tela; o lote entra junto, na sequência.
  const porProjeto = new Map<string, string[]>();
  for (const id of pedidos) {
    const t = atuais.find((x) => x.id === id);
    if (!t) continue;
    porProjeto.set(t.engagement_id, [...(porProjeto.get(t.engagement_id) ?? []), id]);
  }

  for (const [engagementId, movidas] of porProjeto) {
    const { data: coluna } = await supabase
      .from('project_tasks')
      .select('id, sort')
      .eq('engagement_id', engagementId)
      .eq('status', status)
      .order('sort');

    const ids = (coluna ?? []).map((t) => t.id as string).filter((t) => !movidas.includes(t));
    const alvo = before ? ids.indexOf(before) : -1;
    ids.splice(alvo >= 0 ? alvo : ids.length, 0, ...movidas);

    await Promise.all(ids.map((taskId, i) => supabase.from('project_tasks').update({ sort: i }).eq('id', taskId)));
  }

  // Arrastar entre colunas é mudança de status: o SimbOS tem que saber.
  await espelharVarias(atuais.filter((t) => t.status !== status).map((t) => t.id));
  revalidar();
}

/**
 * Mesma mudança em várias tarefas de uma vez: é o que a seleção da lista manda.
 * `acao` é 'apagar' ou 'editar'; editar aplica só os campos que vierem no
 * formulário (status, prioridade, responsável, prazo, etapa).
 */
export async function bulkTasks(formData: FormData): Promise<void> {
  const acao = str(formData, 'acao', 16);
  const ids = (str(formData, 'ids', 8000) ?? '').split(',').filter(Boolean).slice(0, 500);
  if (!ids.length || !acao) return;

  const supabase = getSupabaseAdmin();

  if (acao === 'apagar') {
    for (const id of ids) {
      const simbosId = await idSimbosDa(id);
      await supabase.from('project_tasks').delete().eq('id', id);
      await espelharExclusao(simbosId);
    }
    revalidar();
    return;
  }

  if (acao !== 'editar') return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const status = str(formData, 'status', 32);
  if (status && TASK_STATUSES.includes(status as TaskStatus)) {
    patch.status = status;
    patch.done_at = status === 'feito' ? new Date().toISOString() : null;
  }
  const priority = str(formData, 'priority', 16);
  if (priority && PRIORITIES.includes(priority as Priority)) patch.priority = priority;
  // Campo presente e vazio quer dizer "limpar": é assim que se tira um prazo.
  if (formData.has('assignee')) patch.assignee = str(formData, 'assignee', 120);
  if (formData.has('due_date')) patch.due_date = date(formData, 'due_date');
  if (formData.has('phase_id')) patch.phase_id = str(formData, 'phase_id', 64);
  if (Object.keys(patch).length === 1) return;

  // Um update para o lote inteiro: em massa, uma consulta por tarefa estoura o
  // tempo da função antes de terminar.
  await supabase.from('project_tasks').update(patch).in('id', ids);

  // O relógio só precisa ser fechado em quem estava contando.
  if (patch.status === 'feito') {
    const { data: correndo } = await supabase
      .from('project_tasks')
      .select('id')
      .in('id', ids)
      .not('timer_started_at', 'is', null);
    for (const t of (correndo ?? []) as { id: string }[]) {
      await supabase.from('project_tasks').update(await fecharRelogio(t.id)).eq('id', t.id);
    }
  }

  // O SimbOS não conhece responsável nem etapa: mudar só isso não precisa de
  // espelho nenhum. O que ele conhece vai em paralelo, em blocos.
  if (['status', 'priority', 'due_date'].some((k) => k in patch)) await espelharVarias(ids);

  revalidar();
}

/** Espelha um monte de tarefas sem serializar uma atrás da outra. */
async function espelharVarias(ids: string[], porVez = 8): Promise<void> {
  for (let i = 0; i < ids.length; i += porVez) {
    await Promise.all(ids.slice(i, i + porVez).map((id) => espelharAtualizacao(id)));
  }
}

/**
 * Liga ou desliga o cronômetro da tarefa. Só um relógio corre por vez: ligar um
 * pausa o que estiver correndo, porque ninguém faz duas coisas ao mesmo tempo e
 * relógio esquecido ligado estraga a média.
 */
export async function toggleTimer(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('project_tasks')
    .select('timer_started_at')
    .eq('id', id)
    .maybeSingle();
  if (!data) return;

  if (data.timer_started_at) {
    await supabase.from('project_tasks').update(await fecharRelogio(id)).eq('id', id);
    revalidar();
    return;
  }

  const { data: correndo } = await supabase
    .from('project_tasks')
    .select('id')
    .not('timer_started_at', 'is', null);
  for (const t of (correndo ?? []) as { id: string }[]) {
    await supabase.from('project_tasks').update(await fecharRelogio(t.id)).eq('id', t.id);
  }

  await supabase
    .from('project_tasks')
    .update({ timer_started_at: new Date().toISOString() })
    .eq('id', id);
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

// ── Arquivo do projeto ───────────────────────────────────────────────────────

/**
 * Arquiva (ou desarquiva) o projeto aqui e no SimbOS. Arquivar não apaga nada:
 * o projeto sai da barra lateral e das contas, e volta com um clique.
 */
export async function setProjectArchived(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  if (!engagement_id) return;
  const arquivar = formData.get('arquivar') !== 'off';

  const supabase = getSupabaseAdmin();
  await supabase
    .from('engagements')
    .update({ archived_at: arquivar ? new Date().toISOString() : null })
    .eq('id', engagement_id);

  const { data } = await supabase
    .from('engagements')
    .select('simbos_project_id')
    .eq('id', engagement_id)
    .maybeSingle();

  const projectId = data?.simbos_project_id as string | null | undefined;
  if (projectId) {
    // O update_project do SimbOS limpa o que não vier na chamada, então o nome,
    // a descrição e o resto são relidos e repassados. O repoPath sai junto com o
    // arquivamento de propósito: um repositório só tem um projeto ativo.
    const lista = await simbosCall('list_projects', { workspaceSlug: SIMBOS_WORKSPACE }) as
      | { id: string; name?: string; description?: string; repoPath?: string | null; goal?: string | null }[]
      | null;
    const atual = Array.isArray(lista) ? lista.find((p) => p.id === projectId) : null;

    await simbosCall('update_project', {
      workspaceSlug: SIMBOS_WORKSPACE,
      projectId,
      status: arquivar ? 'archived' : 'active',
      ...(atual?.name ? { name: atual.name } : {}),
      ...(atual?.description ? { description: atual.description } : {}),
      goal: atual?.goal ?? null,
      repoPath: arquivar ? null : atual?.repoPath ?? null,
    });
  }

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
