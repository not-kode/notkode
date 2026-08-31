'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  PHASE_STATUSES, PRIORITIES, RESPONSAVEL_PADRAO, TAG_COLORS, TASK_STATUSES,
  type PhaseStatus, type Priority, type TagColor, type TaskStatus,
} from './status';
import { COLUNAS, type Coluna } from './types';

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

/** Lista de uuids separada por vírgula, como as tags chegam do formulário. */
const uuids = (fd: FormData, key: string): string[] | null => {
  if (!fd.has(key)) return null;
  const bruto = fd.get(key);
  if (typeof bruto !== 'string') return null;
  return [...new Set(
    bruto.split(',').map((s) => s.trim()).filter((s) => /^[0-9a-f-]{36}$/i.test(s)),
  )].slice(0, 20);
};

/**
 * O caminho da pasta como o banco guarda: sem barra no fim, e sempre completo —
 * atalho do shell (`~`) não existe do lado do servidor, que é quem grava. Vazio
 * é resposta válida: desliga o vínculo.
 */
function repoPathDe(fd: FormData): { caminho: string | null } | { erro: string } {
  const caminho = str(fd, 'repo_path', 300)?.replace(/\/+$/, '') ?? null;
  if (caminho && !caminho.startsWith('/')) {
    return { erro: 'A pasta precisa ser o caminho completo, começando com /.' };
  }
  return { caminho };
}

function revalidar(): void {
  revalidatePath('/admin/entregas');
  revalidatePath('/admin');
}

// ── Projetos ─────────────────────────────────────────────────────────────────

/**
 * Abre um projeto (a "pasta" onde as tarefas moram). Dois casos, e a tela
 * pergunta qual antes de chegar aqui: trabalho de um cliente, que se pendura na
 * organização dele, ou frente interna (marketing, comercial, um estudo nosso),
 * que nasce sem cliente e cai no grupo Interno.
 *
 * Nada de valor, prazo ou cobrança: isso é contrato, se preenche depois em
 * Clientes, e exigir aqui só atrapalharia quem só quer um lugar para as tarefas.
 */
export async function createProject(formData: FormData): Promise<{ id: string } | { erro: string }> {
  const titulo = str(formData, 'title', 200);
  if (!titulo) return { erro: 'Dê um nome para a pasta.' };

  const interno = str(formData, 'kind', 20) !== 'cliente';
  const organizationId = interno ? null : str(formData, 'organization_id', 64);
  if (!interno && !organizationId) return { erro: 'Escolha de qual cliente é, ou marque como interno.' };

  // A pasta do repositório é o que faz a tarefa criada do terminal cair aqui:
  // é o mesmo `repo_path` que o "projeto_daqui" do MCP lê. Opcional.
  const pasta = repoPathDe(formData);
  if ('erro' in pasta) return pasta;
  const repoPath = pasta.caminho;

  const { data, error } = await getSupabaseAdmin()
    .from('engagements')
    .insert({
      organization_id: organizationId,
      title: titulo,
      type: 'pontual',
      status: 'aguardando',
      lifecycle: 'ativo',
      is_internal: interno,
      repo_path: repoPath,
    })
    .select('id')
    .maybeSingle();

  // Uma pasta do computador pertence a um projeto ativo só, e o banco garante
  // isso: sem esta mensagem, o erro do índice chegaria cru na tela.
  if (error?.message.includes('engagements_repo_path_ativo_idx')) {
    return { erro: `A pasta ${repoPath} já está ligada a outro projeto ativo.` };
  }
  if (error) return { erro: error.message };
  revalidar();
  return { id: (data as { id: string }).id };
}

/**
 * Renomeia a pasta. Mexe só no título do projeto: o nome do cliente é do
 * cadastro dele e continua igual em todo o CRM, e nas pastas de cliente é o
 * nome do cliente que a lista mostra.
 */
export async function renameProject(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  const title = str(formData, 'title', 200);
  if (!engagement_id || !title) return;

  await getSupabaseAdmin()
    .from('engagements')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', engagement_id);

  revalidar();
}

/**
 * Liga (ou desliga) a pasta do computador ao projeto. É o mesmo campo que o
 * "definir_repositorio" do MCP escreve: com ele preenchido, tarefa criada de
 * dentro do repositório sabe de quem é sem ninguém dizer o nome do cliente.
 */
export async function setProjectRepo(formData: FormData): Promise<{ erro: string } | null> {
  const engagement_id = str(formData, 'engagement_id', 64);
  if (!engagement_id) return null;

  const pasta = repoPathDe(formData);
  if ('erro' in pasta) return pasta;

  const { error } = await getSupabaseAdmin()
    .from('engagements')
    .update({ repo_path: pasta.caminho, updated_at: new Date().toISOString() })
    .eq('id', engagement_id);

  // Uma pasta pertence a um projeto ativo só, e o banco garante isso.
  if (error?.message.includes('engagements_repo_path_ativo_idx')) {
    return { erro: `A pasta ${pasta.caminho} já está ligada a outro projeto ativo.` };
  }
  if (error) return { erro: error.message };

  revalidar();
  return null;
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
  // A tarefa pode ser de um contrato ou de um negócio ganho que ainda não virou
  // contrato — o quadro mostra os dois, e um dos dois campos sempre vem.
  const engagement_id = str(formData, 'engagement_id', 64);
  const deal_id = str(formData, 'deal_id', 64);
  const title = str(formData, 'title', 300);
  if ((!engagement_id && !deal_id) || !title) return;

  const status = str(formData, 'status', 32);
  const priority = str(formData, 'priority', 16);
  const supabase = getSupabaseAdmin();

  // Entra no fim da coluna em que foi criada, para não embaralhar a ordem manual.
  const { data: ultima } = await supabase
    .from('project_tasks')
    .select('sort')
    .eq(engagement_id ? 'engagement_id' : 'deal_id', engagement_id ?? deal_id)
    .order('sort', { ascending: false })
    .limit(1);

  const { data: criada } = await supabase.from('project_tasks').insert({
    engagement_id,
    deal_id,
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
    tag_ids: uuids(formData, 'tag_ids') ?? [],
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
  if (formData.has('start_date')) patch.start_date = date(formData, 'start_date');
  if (formData.has('due_date')) patch.due_date = date(formData, 'due_date');
  if (formData.has('assignee')) patch.assignee = str(formData, 'assignee', 120);
  if (formData.has('phase_id')) patch.phase_id = str(formData, 'phase_id', 64);
  if (formData.has('client_visible')) patch.client_visible = formData.get('client_visible') === 'on';
  const tags = uuids(formData, 'tag_ids');
  if (tags) patch.tag_ids = tags;

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

  const supabase = getSupabaseAdmin();
  await supabase.from('project_tasks').update(patch).eq('id', id);

  // Concluir a tarefa-mãe conclui as partes dela: ninguém entrega o todo e deixa
  // pedaço aberto atrás. Reabrir NÃO reabre as filhas — o que já ficou pronto
  // continua pronto, e reabrir uma coisa não desfaz o trabalho das outras.
  if (patch.status === 'feito') {
    const { data: filhas } = await supabase
      .from('project_tasks')
      .select('id, timer_started_at')
      .eq('parent_task_id', id)
      .neq('status', 'feito');

    for (const f of (filhas ?? []) as { id: string; timer_started_at: string | null }[]) {
      await supabase
        .from('project_tasks')
        .update({
          status: 'feito',
          done_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(f.timer_started_at ? await fecharRelogio(f.id) : {}),
        })
        .eq('id', f.id);
    }
  }

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
    await supabase.from('project_tasks').delete().in('id', ids);
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
  const tagsLote = uuids(formData, 'tag_ids');
  if (tagsLote) patch.tag_ids = tagsLote;
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

  revalidar();
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
  await getSupabaseAdmin().from('project_tasks').delete().eq('id', id);
  revalidar();
}


// ── Arquivo do projeto ───────────────────────────────────────────────────────

/**
 * Arquiva (ou desarquiva) o projeto. Arquivar não apaga nada:
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

// ── Conversa dentro da tarefa ────────────────────────────────────────────────

export async function criarComentario(formData: FormData): Promise<void> {
  const task_id = str(formData, 'task_id', 64);
  const content = str(formData, 'content', 8000);
  if (!task_id || !content) return;

  await getSupabaseAdmin().from('task_comments').insert({
    task_id,
    content,
    author: str(formData, 'author', 120) ?? RESPONSAVEL_PADRAO,
  });
  revalidar();
}

export async function apagarComentario(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;
  await getSupabaseAdmin().from('task_comments').delete().eq('id', id);
  revalidar();
}

// ── Notas ────────────────────────────────────────────────────────────────────

const NOTE_KINDS = ['nota', 'aprendizado', 'pessoa', 'recurso'];

export async function criarNota(formData: FormData): Promise<void> {
  const title = str(formData, 'title', 300);
  if (!title) return;
  const kind = str(formData, 'kind', 24);

  await getSupabaseAdmin().from('notes').insert({
    engagement_id: str(formData, 'engagement_id', 64),
    title,
    content: str(formData, 'content', 40000),
    kind: kind && NOTE_KINDS.includes(kind) ? kind : 'nota',
  });
  revalidar();
}

export async function atualizarNota(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const title = str(formData, 'title', 300);
  if (title) patch.title = title;
  if (formData.has('content')) patch.content = str(formData, 'content', 40000);
  if (formData.has('engagement_id')) patch.engagement_id = str(formData, 'engagement_id', 64);
  const kind = str(formData, 'kind', 24);
  if (kind && NOTE_KINDS.includes(kind)) patch.kind = kind;

  await getSupabaseAdmin().from('notes').update(patch).eq('id', id);
  revalidar();
}

export async function apagarNota(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;
  await getSupabaseAdmin().from('notes').delete().eq('id', id);
  revalidar();
}

// ── Tags do projeto ──────────────────────────────────────────────────────────

/** Cadastra uma tag no projeto. Nome repetido não cria outra: reaproveita. */
export async function criarTag(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  const name = str(formData, 'name', 60);
  if (!engagement_id || !name) return;

  const cor = str(formData, 'color', 16);
  const supabase = getSupabaseAdmin();

  // Mesmo nome (sem olhar maiúscula) já existe: não cria a segunda "Site".
  const { data: igual } = await supabase
    .from('project_tags')
    .select('id')
    .eq('engagement_id', engagement_id)
    .ilike('name', name)
    .maybeSingle();
  if (igual) return;

  const { data: ultima } = await supabase
    .from('project_tags')
    .select('sort')
    .eq('engagement_id', engagement_id)
    .order('sort', { ascending: false })
    .limit(1);

  await supabase.from('project_tags').insert({
    engagement_id,
    name,
    color: cor && TAG_COLORS.includes(cor as TagColor) ? cor : 'azul',
    sort: ((ultima?.[0]?.sort as number | undefined) ?? -1) + 1,
  });

  revalidar();
}

/**
 * Cria a tag e já marca a tarefa com ela, num passo. É assim que a tag nasce no
 * dia a dia: você está numa tarefa, o nome da frente ainda não existe, digita e
 * pronto. Nome repetido reaproveita a tag que já existe em vez de duplicar.
 */
export async function criarTagNaTarefa(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  const task_id = str(formData, 'task_id', 64);
  const name = str(formData, 'name', 60);
  if (!engagement_id || !task_id || !name) return;

  const supabase = getSupabaseAdmin();
  const cor = str(formData, 'color', 16);

  const { data: igual } = await supabase
    .from('project_tags')
    .select('id')
    .eq('engagement_id', engagement_id)
    .ilike('name', name)
    .maybeSingle();

  let tagId = (igual as { id: string } | null)?.id ?? null;

  if (!tagId) {
    const { data: ultima } = await supabase
      .from('project_tags')
      .select('sort')
      .eq('engagement_id', engagement_id)
      .order('sort', { ascending: false })
      .limit(1);

    const { data: criada } = await supabase
      .from('project_tags')
      .insert({
        engagement_id,
        name,
        color: cor && TAG_COLORS.includes(cor as TagColor) ? cor : 'azul',
        sort: ((ultima?.[0]?.sort as number | undefined) ?? -1) + 1,
      })
      .select('id')
      .maybeSingle();
    tagId = (criada as { id: string } | null)?.id ?? null;
  }

  if (!tagId) return;

  const { data: tarefa } = await supabase
    .from('project_tasks')
    .select('tag_ids')
    .eq('id', task_id)
    .maybeSingle();

  const atuais = ((tarefa as { tag_ids: string[] | null } | null)?.tag_ids ?? []);
  if (!atuais.includes(tagId)) {
    await supabase
      .from('project_tasks')
      .update({ tag_ids: [...atuais, tagId], updated_at: new Date().toISOString() })
      .eq('id', task_id);
  }

  revalidar();
}

export async function atualizarTag(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  if (!id) return;

  const patch: Record<string, unknown> = {};
  const name = str(formData, 'name', 60);
  if (name) patch.name = name;
  const cor = str(formData, 'color', 16);
  if (cor && TAG_COLORS.includes(cor as TagColor)) patch.color = cor;
  if (!Object.keys(patch).length) return;

  await getSupabaseAdmin().from('project_tags').update(patch).eq('id', id);
  revalidar();
}

/**
 * Apaga a tag e a tira das tarefas que a usavam. Sem a limpeza, o id ficaria no
 * array das tarefas e a tag apagada voltaria como chip fantasma.
 */
export async function apagarTag(formData: FormData): Promise<void> {
  const id = str(formData, 'id', 64);
  const engagement_id = str(formData, 'engagement_id', 64);
  if (!id) return;

  const supabase = getSupabaseAdmin();
  if (engagement_id) {
    const { data: usando } = await supabase
      .from('project_tasks')
      .select('id, tag_ids')
      .eq('engagement_id', engagement_id)
      .contains('tag_ids', [id]);

    for (const t of (usando ?? []) as { id: string; tag_ids: string[] | null }[]) {
      await supabase
        .from('project_tasks')
        .update({ tag_ids: (t.tag_ids ?? []).filter((x) => x !== id) })
        .eq('id', t.id);
    }
  }

  await supabase.from('project_tags').delete().eq('id', id);
  revalidar();
}

// ── Como esta tela está montada ──────────────────────────────────────────────

/**
 * Salva as colunas visíveis do projeto e se o cronograma entra no link do
 * cliente. A mesma lista vale para a sua tela e para o link: coluna escondida
 * some dos dois lados.
 */
export async function salvarColunas(formData: FormData): Promise<void> {
  const engagement_id = str(formData, 'engagement_id', 64);
  if (!engagement_id) return;

  // A ORDEM que veio é a ordem da tabela (arrastar o cabeçalho reescreve esta
  // lista), então filtra pelo que é válido sem reordenar nada.
  const colunas = (str(formData, 'colunas', 300) ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter((c, i, todas) => (COLUNAS as readonly string[]).includes(c) && todas.indexOf(c) === i) as Coluna[];
  const agrupar = str(formData, 'agrupar', 16) === 'sprint' ? 'sprint' : 'status';

  await getSupabaseAdmin()
    .from('engagements')
    .update({ client_view: { colunas, agrupar, cronograma: formData.get('cronograma') === 'on' } })
    .eq('id', engagement_id);

  revalidar();
}
