// Caminho de volta da ligação com o SimbOS: puxa as tarefas de lá e reconcilia
// com as de cá. O SimbOS não tem webhook de mudança, então isso roda por cron
// (a cada 10 minutos, ver vercel.json) e também no botão "sincronizar" da tela.
//
// Regras da reconciliação, em uma linha cada:
//   tarefa nova lá, projeto mapeado aqui  → cria aqui
//   tarefa que existe nos dois            → vence quem mudou por último
//   tarefa que sumiu de lá                → apaga aqui
//   tarefa na lista de exceções           → nunca entra
//
// Etapa e ordem do quadro são do sistema, o SimbOS não tem esses conceitos, e
// por isso a sincronização não mexe em phase_id nem em sort.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  PRIORIDADE_DO_SIMBOS, SIMBOS_WORKSPACE, STATUS_DO_SIMBOS, simbosAtivo, simbosCall,
} from '@/lib/simbos';

type TaskSimbos = {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  updatedAt: string;
};

type TaskLocal = {
  id: string;
  engagement_id: string;
  simbos_task_id: string | null;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  updated_at: string;
};

export type ResultadoSync = {
  ok: boolean;
  motivo?: string;
  quando?: string;
  remotas?: number;
  criadas?: number;
  atualizadas?: number;
  apagadas?: number;
  ignoradas?: number;
  sem_projeto_mapeado?: number;
};

/**
 * Sincroniza no máximo uma vez por janela. Chamada quando a tela de Tasks abre,
 * depois de a resposta já ter sido enviada (next/after), então quem navega não
 * paga a espera do SimbOS.
 *
 * É esse gatilho, e não o cron, que faz o sistema parecer ligado ao SimbOS: o
 * plano Hobby da Vercel só permite cron uma vez ao dia, que fica como rede de
 * segurança para quando ninguém abre a tela.
 */
export async function sincronizarSeVencido(janelaSegundos = 120): Promise<void> {
  if (!simbosAtivo()) return;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('sync_state')
    .select('ran_at')
    .eq('chave', 'simbos')
    .maybeSingle();

  const ultima = data?.ran_at ? Date.parse(data.ran_at as string) : 0;
  if (Date.now() - ultima < janelaSegundos * 1000) return;

  // Marca antes de rodar: duas abas abrindo junto não disparam duas varreduras.
  await supabase.from('sync_state').upsert({ chave: 'simbos', ran_at: new Date().toISOString() });
  await sincronizarComSimbos();
}

/** Reconcilia as tarefas dos dois lados. Chamada pelo cron e pelo botão da tela. */
export async function sincronizarComSimbos(): Promise<ResultadoSync> {
  if (!simbosAtivo()) return { ok: false, motivo: 'SimbOS não configurado' };

  const supabase = getSupabaseAdmin();

  const [remotas, { data: locaisData }, { data: engData }, { data: ignoradosData }] = await Promise.all([
    simbosCall('list_tasks', { workspaceSlug: SIMBOS_WORKSPACE }) as Promise<TaskSimbos[] | null>,
    supabase
      .from('project_tasks')
      .select('id, engagement_id, simbos_task_id, title, status, priority, due_date, updated_at'),
    supabase.from('engagements').select('id, simbos_project_id').not('simbos_project_id', 'is', null),
    supabase.from('simbos_ignored').select('simbos_id'),
  ]);

  if (!Array.isArray(remotas)) return { ok: false, motivo: 'SimbOS não respondeu a lista' };

  const locais = (locaisData ?? []) as TaskLocal[];
  const porSimbosId = new Map(locais.filter((t) => t.simbos_task_id).map((t) => [t.simbos_task_id!, t]));
  const engagementDoProjeto = new Map(
    ((engData ?? []) as { id: string; simbos_project_id: string }[]).map((e) => [e.simbos_project_id, e.id]),
  );
  const ignorados = new Set(((ignoradosData ?? []) as { simbos_id: string }[]).map((i) => i.simbos_id));

  const criadas: string[] = [];
  const atualizadas: string[] = [];
  const apagadas: string[] = [];
  const semProjeto: string[] = [];

  for (const r of remotas) {
    if (ignorados.has(r.id)) continue;
    if (r.projectId && ignorados.has(r.projectId)) continue;

    const status = STATUS_DO_SIMBOS[r.status] ?? 'a_fazer';
    const priority = PRIORIDADE_DO_SIMBOS[r.priority] ?? 'media';
    const local = porSimbosId.get(r.id);

    if (!local) {
      const engagementId = engagementDoProjeto.get(r.projectId ?? 'sem-projeto')
        ?? engagementDoProjeto.get('sem-projeto');
      if (!engagementId) { semProjeto.push(r.id); continue; }

      await supabase.from('project_tasks').insert({
        engagement_id: engagementId,
        simbos_task_id: r.id,
        title: r.title,
        notes: r.description,
        status,
        priority,
        due_date: r.dueDate,
        done_at: status === 'feito' ? r.updatedAt : null,
        simbos_synced_at: new Date().toISOString(),
      });
      criadas.push(r.id);
      continue;
    }

    // Mudou nos dois lados desde o último encontro? Ganha o mais recente.
    const mesmo =
      local.title === r.title &&
      local.status === status &&
      local.priority === priority &&
      (local.due_date ?? null) === (r.dueDate ?? null);
    if (mesmo) continue;

    if (Date.parse(r.updatedAt) < Date.parse(local.updated_at)) continue; // o daqui é mais novo

    await supabase
      .from('project_tasks')
      .update({
        title: r.title,
        notes: r.description,
        status,
        priority,
        due_date: r.dueDate,
        done_at: status === 'feito' ? r.updatedAt : null,
        simbos_synced_at: new Date().toISOString(),
      })
      .eq('id', local.id);
    atualizadas.push(r.id);
  }

  // Apagou lá, sai daqui. Só vale para tarefa que veio do SimbOS: o que nasceu
  // aqui e ainda não foi espelhado não tem par para comparar.
  const idsRemotos = new Set(remotas.map((r) => r.id));
  const orfas = locais.filter((t) => t.simbos_task_id && !idsRemotos.has(t.simbos_task_id));
  for (const o of orfas) {
    await supabase.from('project_tasks').delete().eq('id', o.id);
    apagadas.push(o.simbos_task_id!);
  }

  return {
    ok: true,
    quando: new Date().toISOString(),
    remotas: remotas.length,
    criadas: criadas.length,
    atualizadas: atualizadas.length,
    apagadas: apagadas.length,
    ignoradas: ignorados.size,
    sem_projeto_mapeado: semProjeto.length,
  };
}
