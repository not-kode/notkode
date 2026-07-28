// Constantes do cronograma e das tarefas. Módulo "normal" (sem 'use server'),
// para poder ser importado por server actions e por client components.

export const PHASE_STATUSES = ['pendente', 'em_andamento', 'concluida', 'pausada'] as const;
export type PhaseStatus = (typeof PHASE_STATUSES)[number];

export const PHASE_LABELS: Record<PhaseStatus, string> = {
  pendente: 'A começar',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  pausada: 'Pausada',
};

export const TASK_STATUSES = ['a_fazer', 'fazendo', 'revisao', 'feito'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_LABELS: Record<TaskStatus, string> = {
  a_fazer: 'A fazer',
  fazendo: 'Fazendo',
  revisao: 'Revisão',
  feito: 'Feito',
};

/** Ordem em que a tarefa aparece na lista: o que está em jogo primeiro. */
export const TASK_ORDER: Record<TaskStatus, number> = {
  fazendo: 0,
  revisao: 1,
  a_fazer: 2,
  feito: 3,
};

export const PRIORITIES = ['baixa', 'media', 'alta', 'urgente'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

/** Tarja do card e ponto da lista. Média é o padrão, então não grita. */
export const PRIORITY_TONE: Record<Priority, string> = {
  baixa: 'bg-black/15',
  media: 'bg-primary/50',
  alta: 'bg-warning',
  urgente: 'bg-danger',
};

/** Prioridade alta primeiro; empate cai para a ordem manual do quadro. */
export const PRIORITY_ORDER: Record<Priority, number> = {
  urgente: 0,
  alta: 1,
  media: 2,
  baixa: 3,
};
