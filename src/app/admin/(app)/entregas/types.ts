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
  phases: PhaseView[]; tasks: TaskView[];
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
