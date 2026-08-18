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

/**
 * As colunas da tabela de tarefas, na ordem em que aparecem. É UMA lista só: o
 * que você esconde aqui sai da sua lista e sai do link do cliente junto — foi o
 * pedido, e evita duas configurações dizendo coisas diferentes sobre a mesma
 * tela. `titulo` não entra porque esconder o nome da tarefa não faz sentido, e
 * `tempo` é o cronômetro da casa: nunca vai para o cliente, esteja ligado ou não.
 */
export const COLUNAS = ['tags', 'quem', 'inicio', 'prazo', 'prioridade', 'tempo'] as const;
export type Coluna = (typeof COLUNAS)[number];

export const COLUNA_LABELS: Record<Coluna, string> = {
  tags: 'Tags',
  quem: 'Quem',
  inicio: 'Início',
  prazo: 'Prazo',
  prioridade: 'Prioridade',
  tempo: 'Tempo',
};

/** O que o cliente lê como rótulo, quando a coluna chega no link dele. */
export const COLUNA_LABELS_CLIENTE: Partial<Record<Coluna, string>> = {
  tags: 'Tags',
  quem: 'Responsável',
  inicio: 'Início',
  prazo: 'Prazo',
  prioridade: 'Urgência',
};

/** O cronômetro é conversa interna: não existe do lado do cliente. */
export const COLUNAS_DO_CLIENTE = COLUNAS.filter((c) => c !== 'tempo');

/** Como esta tela está montada neste projeto. Fica no contrato, em `client_view`. */
export type VisaoProjeto = {
  colunas: Coluna[];
  /**
   * Como a lista fica separada. Mora no projeto (e não no navegador) de
   * propósito: é assim que a tela do cliente sai igual à sua, que foi o pedido.
   */
  agrupar: Agrupamento;
  /** O desenho do cronograma entra no fim da página do cliente. */
  cronogramaNoLink: boolean;
};

export const VISAO_PADRAO: VisaoProjeto = {
  colunas: [...COLUNAS],
  agrupar: 'status',
  cronogramaNoLink: true,
};

/** Lê o jsonb do contrato sem confiar no que está lá dentro. */
export function lerVisao(bruto: unknown): VisaoProjeto {
  const v = (bruto ?? {}) as Record<string, unknown>;
  const colunas = Array.isArray(v.colunas)
    ? (v.colunas.filter((c) => (COLUNAS as readonly unknown[]).includes(c)) as Coluna[])
    : null;
  return {
    // Salvar sem nenhuma coluna é escolha legítima (lista só de títulos); campo
    // ausente é que cai no padrão.
    colunas: colunas ?? VISAO_PADRAO.colunas,
    agrupar: v.agrupar === 'sprint' ? 'sprint' : 'status',
    cronogramaNoLink: typeof v.cronograma === 'boolean' ? v.cronograma : VISAO_PADRAO.cronogramaNoLink,
  };
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
  /** Colunas visíveis e o que vai no link do cliente. */
  visao: VisaoProjeto;
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
