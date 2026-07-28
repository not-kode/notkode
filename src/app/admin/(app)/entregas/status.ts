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
