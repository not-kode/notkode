// Formato que a página serve para as visualizações de Entregas.

import { PRIORITY_ORDER } from './status';
import type { PhaseStatus, Priority, TaskStatus } from './status';

export type PhaseView = {
  id: string; name: string; description: string | null; status: PhaseStatus;
  startDate: string | null; endDate: string | null; clientVisible: boolean;
};

export type TaskView = {
  id: string; phaseId: string | null; title: string; notes: string | null;
  status: TaskStatus; priority: Priority; startDate: string | null; dueDate: string | null;
  assignee: string | null; clientVisible: boolean; sort: number;
  /** Tags da tarefa, por id: o nome e a cor moram na tag do projeto. */
  tagIds: string[];
  /** Quando preenchido, a tarefa é subtarefa desta outra. */
  parentId: string | null;
  /** Tempo já cronometrado, em segundos, sem contar o que está correndo agora. */
  tempoSegundos: number;
  /** Instante em que o cronômetro foi ligado; nulo quando está parado. */
  timerDesde: string | null;
  /** Quando a tarefa entrou no sistema; ordena "mais recentes primeiro". */
  createdAt: string;
};

/** Tarefa como as visões usam: no escopo "todos", carrega de que projeto veio. */
export type TaskComProjeto = TaskView & {
  projetoNome: string; projetoId: string; projetoKind: ProjectKind;
};

export type ProjectKind = 'contrato' | 'negocio';

/**
 * Como a lista de tarefas fica separada: por status (o dia de trabalho) ou por
 * sprint, que são as etapas do cronograma do projeto (o ciclo de entrega).
 */
export type Agrupamento = 'status' | 'sprint';

/** Tag cadastrada num projeto: nome e cor escolhidos uma vez, usados sempre. */
export type TagView = { id: string; nome: string; cor: string; sort: number };

/**
 * As colunas que o cliente pode ver no link de acompanhamento. A ordem daqui é a
 * ordem na tela; `titulo` não entra porque não faz sentido esconder a tarefa.
 */
export const COLUNAS_CLIENTE = ['tags', 'inicio', 'prazo', 'urgencia', 'responsavel', 'status'] as const;
export type ColunaCliente = (typeof COLUNAS_CLIENTE)[number];

export const COLUNA_CLIENTE_LABELS: Record<ColunaCliente, string> = {
  tags: 'Tags',
  inicio: 'Início',
  prazo: 'Prazo',
  urgencia: 'Urgência',
  responsavel: 'Responsável',
  status: 'Status',
};

/** Como o cliente lê a lista: o que aparece e por onde está separada. */
export type VisaoCliente = {
  colunas: ColunaCliente[];
  agrupar: 'sprint' | 'status' | 'nenhum';
  /** Mostrar também o desenho do cronograma (o Gantt), numa aba ao lado da lista. */
  cronograma: boolean;
};

/**
 * O padrão de quem nunca configurou nada: o essencial que o cliente pergunta,
 * sem responsável (que é sempre a casa) e sem urgência (que é conversa interna).
 */
export const VISAO_CLIENTE_PADRAO: VisaoCliente = {
  colunas: ['tags', 'inicio', 'prazo', 'status'],
  agrupar: 'sprint',
  cronograma: true,
};

/** Lê o jsonb do contrato sem confiar no que está lá dentro. */
export function lerVisaoCliente(bruto: unknown): VisaoCliente {
  const v = (bruto ?? {}) as Partial<Record<keyof VisaoCliente, unknown>>;
  const colunas = Array.isArray(v.colunas)
    ? (v.colunas.filter((c) => (COLUNAS_CLIENTE as readonly unknown[]).includes(c)) as ColunaCliente[])
    : null;
  const agrupar = v.agrupar === 'sprint' || v.agrupar === 'status' || v.agrupar === 'nenhum'
    ? v.agrupar
    : VISAO_CLIENTE_PADRAO.agrupar;
  return {
    // Configuração salva sem nenhuma coluna é escolha legítima (lista limpa, só
    // os títulos); só o campo ausente cai no padrão.
    colunas: colunas ?? VISAO_CLIENTE_PADRAO.colunas,
    agrupar,
    cronograma: typeof v.cronograma === 'boolean' ? v.cronograma : VISAO_CLIENTE_PADRAO.cronograma,
  };
}

/**
 * A ordem das tarefas, igual em toda tela: o que vence antes vem primeiro,
 * empate no mesmo dia vai pela prioridade e o que não tem prazo fica no fim.
 *
 * É ordem fixa de propósito. Antes havia um seletor com sete ordens (quadro,
 * mais recentes, prazo mais distante...) e a lista abria na última escolha, que
 * podia ser qualquer uma: dava trabalho para responder "o que é mais urgente",
 * que é a única pergunta que essa tela precisa responder.
 */
export function porPrazo(a: TaskView, b: TaskView): number {
  const prazo = (t: TaskView) => t.dueDate ?? '9999-99-99';
  return prazo(a).localeCompare(prazo(b))
    || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    || a.sort - b.sort;
}


/**
 * De quem é a tarefa nova. O quadro mostra contratos e negócios ganhos ainda sem
 * contrato, e o campo muda conforme o caso — sem isso, tarefa criada dentro de
 * um negócio tentaria virar tarefa de um contrato que não existe.
 */
export function donoDaTarefa(projectId: string, kind: ProjectKind): Record<string, string> {
  return kind === 'negocio' ? { deal_id: projectId } : { engagement_id: projectId };
}

export type ProjectView = {
  id: string; title: string | null; orgName: string | null; lifecycle: string;
  /**
   * De quem são as tarefas: do contrato (o normal) ou de um negócio ganho que
   * ainda não virou contrato. O negócio some daqui assim que o contrato nasce e
   * leva as tarefas junto — é uma sala de espera, não um projeto de verdade:
   * não tem cronograma, link de cliente nem notas.
   */
  kind: 'contrato' | 'negocio';
  startDate: string | null; endDate: string | null; clientUrl: string | null;
  /** Frente da própria casa (o sistema, o site, o pessoal), sem cliente do outro lado. */
  isInternal: boolean;
  /** Arquivado: sai da barra lateral, mas o histórico continua aqui. */
  archivedAt: string | null;
  phases: PhaseView[]; tasks: TaskView[]; tags: TagView[];
  /** O recorte que o cliente vê pelo link. */
  visaoCliente: VisaoCliente;
};

/** O que uma visualização precisa para editar uma tarefa. */
export type Send = (action: (fd: FormData) => Promise<void>, campos: Record<string, string>) => void;

/** Comentário dentro de uma tarefa: o histórico da conversa sobre ela. */
export type ComentarioView = {
  id: string; taskId: string; autor: string | null; texto: string; quando: string;
};

/** Nota da base de conhecimento, presa (ou não) a um projeto. */
export type NotaView = {
  id: string; projetoId: string | null; titulo: string; conteudo: string | null;
  tipo: string; tags: string[]; criadaEm: string; atualizadaEm: string;
};

/**
 * Quem pode tocar uma tarefa: a equipe (quem já aparece como responsável em
 * alguma tarefa) e os contatos e empresas dos clientes, para quando o próximo
 * passo depende do cliente e não da casa.
 */
export type Pessoa = { nome: string; tipo: 'equipe' | 'cliente' };
