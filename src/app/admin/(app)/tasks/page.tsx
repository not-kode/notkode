import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { emBlocos } from '@/lib/mcp/nucleo';
import { TasksView } from './tasks-view';
import { VISAO_PADRAO, lerVisao } from './types';
import type { AnexoView, ComentarioView, ContagemProjeto, NotaView, Pessoa, ProjectView, TagView } from './types';
import type { PhaseStatus, Priority, TaskStatus } from './status';

export const dynamic = 'force-dynamic';
// Ações em lote (responsável de duzentas tarefas de uma vez) precisam de mais
// que os 10s padrão para terminar.
export const maxDuration = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

type EngRow = {
  id: string;
  title: string | null;
  lifecycle: string;
  start_date: string | null;
  end_date: string | null;
  client_token: string | null;
  organization_id: string | null;
  is_internal: boolean | null;
  archived_at: string | null;
  repo_path: string | null;
  client_view: unknown;
  organizations: { id: string; name: string | null } | null;
};
type PhaseRow = {
  id: string; engagement_id: string; name: string; description: string | null;
  status: PhaseStatus; start_date: string | null; end_date: string | null;
  sort: number; client_visible: boolean;
};
type TaskRow = {
  id: string; engagement_id: string | null; deal_id: string | null; phase_id: string | null; title: string;
  notes: string | null; status: TaskStatus; priority: Priority | null;
  start_date: string | null; due_date: string | null;
  assignee: string | null; client_visible: boolean; sort: number | null;
  parent_task_id: string | null;
  tag_ids: string[] | null;
  time_spent_seconds: number | null; timer_started_at: string | null;
  created_at: string;
};
type TagRow = { id: string; engagement_id: string; name: string; color: string; sort: number };
type DealRow = {
  id: string;
  organizations: { name: string | null } | { name: string | null }[] | null;
};

export default async function EntregasPage({ searchParams }: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = getSupabaseAdmin();
  const sp = (await searchParams) ?? {};
  // Qual projeto está aberto e se a tela está na visão geral vêm da URL, porque
  // é o servidor que decide QUAIS tarefas buscar. Antes ele trazia as de todos
  // os clientes e o navegador escondia o resto: passado de mil tarefas no total,
  // o banco cortava a consulta e as mais novas sumiam da tela.
  const escopoTodos = sp.escopo === 'todos';
  const pedido = sp.p ?? null;

  const [{ data: engData }, { data: phaseData }, { data: contagemData }] = await Promise.all([
    supabase
      .from('engagements')
      .select('id, title, lifecycle, start_date, end_date, client_token, organization_id, is_internal, archived_at, repo_path, client_view, organizations(id, name)')
      .order('created_at', { ascending: false }),
    supabase.from('project_phases').select('*').order('sort'),
    supabase.from('project_task_counters').select('*'),
  ]);

  const contagens: Record<string, ContagemProjeto> = {};
  for (const c of (contagemData ?? []) as {
    owner_id: string; total: number; abertas: number; para_hoje: number; atrasadas: number;
  }[]) {
    contagens[c.owner_id] = {
      total: Number(c.total), abertas: Number(c.abertas),
      paraHoje: Number(c.para_hoje), atrasadas: Number(c.atrasadas),
    };
  }

  const engRows = (engData ?? []) as unknown as EngRow[];
  const comEtapa = new Set(((phaseData ?? []) as PhaseRow[]).map((p) => p.engagement_id));

  // Contrato encerrado sem nenhuma tarefa/etapa é ruído: não tem entrega para
  // acompanhar. Some da lista, mas volta assim que ganhar um cronograma.
  const naLista = engRows.filter(
    (e) => e.lifecycle !== 'encerrado' || (contagens[e.id]?.total ?? 0) > 0 || comEtapa.has(e.id),
  );
  const ativosIds = naLista.filter((e) => !e.archived_at).map((e) => e.id);
  const todosIds = new Set(engRows.map((e) => e.id));
  // Owner que não é contrato é negócio ganho: o checklist do fechamento.
  const dealIds = Object.keys(contagens).filter((id) => !todosIds.has(id));
  // O projeto aberto tem que ser decidido aqui: é ele que diz quais tarefas
  // buscar. Sem nada na URL, abre o primeiro da lista, como a tela sempre fez.
  const abertoId = pedido && (todosIds.has(pedido) || dealIds.includes(pedido))
    ? pedido
    : ativosIds[0] ?? engRows[0]?.id ?? null;

  // Aqui está o ponto da mudança: em "Tudo em aberto" a busca é a lista inteira,
  // em blocos para não bater no teto de mil; num projeto, só as tarefas dele.
  // Um negócio ganho é dono pelo deal_id, um contrato pelo engagement_id.
  const taskData = !escopoTodos && !abertoId ? [] : await emBlocos<TaskRow>((de, ate) => {
    const q = supabase.from('project_tasks').select('*').order('sort').range(de, ate);
    return escopoTodos ? q : q.or(`engagement_id.eq.${abertoId},deal_id.eq.${abertoId}`);
  });

  const { data: tagData } = await supabase.from('project_tags').select('*').order('sort');

  // Conversa das tarefas e base de notas: vieram do SimbOS junto com as tarefas
  // e são leves o bastante para a tela receber tudo de uma vez.
  const [comentarioData, notaData, anexoData] = await Promise.all([
    emBlocos<{ id: string; task_id: string; author: string | null; content: string; created_at: string }>(
      (de, ate) => supabase.from('task_comments')
        .select('id, task_id, author, content, created_at').order('created_at').range(de, ate)),
    emBlocos<{
      id: string; engagement_id: string | null; title: string; content: string | null;
      kind: string; tags: string[] | null; created_at: string; updated_at: string;
    }>((de, ate) => supabase.from('notes')
      .select('id, engagement_id, title, content, kind, tags, created_at, updated_at')
      .order('updated_at', { ascending: false }).range(de, ate)),
    emBlocos<{
      id: string; task_id: string; file_name: string; mime_type: string | null;
      size_bytes: number | null; uploaded_by: string | null; created_at: string;
    }>((de, ate) => supabase.from('task_attachments')
      .select('id, task_id, file_name, mime_type, size_bytes, uploaded_by, created_at')
      .order('created_at').range(de, ate)),
  ]);

  const anexos: AnexoView[] = anexoData.map((a) => ({
    id: a.id, taskId: a.task_id, nome: a.file_name, tipo: a.mime_type,
    tamanho: a.size_bytes, autor: a.uploaded_by, quando: a.created_at,
  }));

  const comentarios: ComentarioView[] = comentarioData.map((c) => ({ id: c.id, taskId: c.task_id, autor: c.author, texto: c.content, quando: c.created_at }));

  const notas: NotaView[] = notaData.map((n) => ({
    id: n.id, projetoId: n.engagement_id, titulo: n.title, conteudo: n.content,
    tipo: n.kind, tags: n.tags ?? [], criadaEm: n.created_at, atualizadaEm: n.updated_at,
  }));

  const phases = (phaseData ?? []) as PhaseRow[];
  const tasks = taskData;
  const tagRows = (tagData ?? []) as TagRow[];

  const projects: ProjectView[] = naLista.map((e) => ({
    id: e.id,
    title: e.title,
    orgName: e.organizations?.name ?? null,
    lifecycle: e.lifecycle,
    kind: 'contrato' as const,
    startDate: e.start_date,
    endDate: e.end_date,
    clientUrl: e.client_token ? `${SITE_URL}/acompanhamento/${e.client_token}` : null,
    isInternal: e.is_internal ?? false,
    archivedAt: e.archived_at,
    repoPath: e.repo_path,
    phases: phases
      .filter((p) => p.engagement_id === e.id)
      .map((p) => ({
        id: p.id, name: p.name, description: p.description, status: p.status,
        startDate: p.start_date, endDate: p.end_date, clientVisible: p.client_visible,
      })),
    tasks: tasks
      .filter((t) => t.engagement_id === e.id)
      .map((t) => ({
        id: t.id, phaseId: t.phase_id, title: t.title, notes: t.notes, status: t.status,
        priority: t.priority ?? 'media', startDate: t.start_date, dueDate: t.due_date,
        assignee: t.assignee, clientVisible: t.client_visible, sort: t.sort ?? 0,
        parentId: t.parent_task_id,
        tagIds: t.tag_ids ?? [],
        tempoSegundos: t.time_spent_seconds ?? 0,
        timerDesde: t.timer_started_at,
        createdAt: t.created_at,
      })),
    tags: tagRows
      .filter((tg) => tg.engagement_id === e.id)
      .map((tg): TagView => ({ id: tg.id, nome: tg.name, cor: tg.color, sort: tg.sort })),
    visao: lerVisao(e.client_view),
  }));

  // Negócio ganho que ainda não virou contrato: o checklist do fechamento nasce
  // preso a ele, e sem isso essas tarefas não apareceriam em lugar nenhum. Some
  // daqui no clique de "Gerar contrato", que leva as tarefas para o contrato.
  // Quem tem checklist vem dos contadores: as tarefas em si só são buscadas
  // quando o fechamento é o projeto aberto.
  const daqueles = tasks.filter((t) => t.deal_id);
  const negocios: ProjectView[] = [];
  if (dealIds.length > 0) {
    const { data: dealData } = await supabase
      .from('deals')
      .select('id, organizations(name)')
      .in('id', dealIds);

    for (const d of (dealData ?? []) as unknown as DealRow[]) {
      const org = Array.isArray(d.organizations) ? d.organizations[0] : d.organizations;
      negocios.push({
        id: d.id,
        title: 'Fechamento do negócio',
        orgName: org?.name ?? 'Negócio ganho',
        lifecycle: 'ativo',
        kind: 'negocio',
        startDate: null,
        endDate: null,
        clientUrl: null,
        isInternal: false,
        archivedAt: null,
        repoPath: null,
        phases: [],
        tags: [],
        visao: VISAO_PADRAO,
        tasks: daqueles
          .filter((t) => t.deal_id === d.id)
          .map((t) => ({
            id: t.id, phaseId: null, title: t.title, notes: t.notes, status: t.status,
            priority: t.priority ?? 'media', startDate: t.start_date, dueDate: t.due_date,
            assignee: t.assignee, clientVisible: t.client_visible, sort: t.sort ?? 0,
            parentId: t.parent_task_id,
            tagIds: t.tag_ids ?? [],
            tempoSegundos: t.time_spent_seconds ?? 0,
            timerDesde: t.timer_started_at,
            createdAt: t.created_at,
          })),
      });
    }
  }

  // Quem pode tocar tarefa: a equipe (quem tem login) e os nomes que já
  // respondem por alguma tarefa. A agenda de contatos e as empresas saíram
  // daqui: traziam a mesma pessoa duas vezes (o contato "Bruno" e a empresa
  // "Casa da IPE", a "Vânia" e o "Brechó da Dona Inhá") e uma lista de dezenas
  // de nomes para escolher entre três. Nome de fora entra digitando, e da
  // próxima vez já aparece na lista.
  const { data: usuarioData } = await supabase.from('admin_users').select('nome').eq('ativo', true);

  const equipe = [...new Set(
    ((usuarioData ?? []) as { nome: string | null }[]).map((u) => (u.nome ?? '').trim()).filter(Boolean),
  )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  // Os nomes de fora vêm da view: dependiam de ter todas as tarefas carregadas,
  // e agora a tela carrega só as do projeto aberto.
  const { data: responsavelData } = await supabase.from('task_assignee_names').select('nome');

  const daCasa = new Set(equipe.map((n) => n.toLowerCase()));
  const outros = [...new Set(
    ((responsavelData ?? []) as { nome: string | null }[]).map((r) => (r.nome ?? '').trim()).filter(Boolean),
  )]
    .filter((n) => !daCasa.has(n.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const pessoas: Pessoa[] = [
    ...equipe.map((nome) => ({ nome, tipo: 'equipe' as const })),
    ...outros.map((nome) => ({ nome, tipo: 'externo' as const })),
  ];

  // Para o formulário de nova pasta escolher de qual cliente ela é.
  const { data: orgData } = await supabase.from('organizations').select('id, name');
  const organizacoes = ((orgData ?? []) as { id: string; name: string | null }[])
    .map((o) => ({ id: o.id, nome: (o.name ?? '').trim() }))
    .filter((o) => o.nome)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <TasksView
      projects={[...negocios, ...projects]}
      contagens={contagens}
      abertoId={abertoId}
      escopo={escopoTodos ? 'todos' : 'projeto'}
      comentarios={comentarios}
      anexos={anexos}
      notas={notas}
      pessoas={pessoas}
      organizacoes={organizacoes}
    />
  );
}
