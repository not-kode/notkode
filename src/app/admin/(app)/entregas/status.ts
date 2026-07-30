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

// "Backlog" é o que existe mas não entrou na fila; "A fazer" é o que está
// puxado para agora. Sem a distinção, tudo que é ideia futura polui a fila real.
export const TASK_STATUSES = ['backlog', 'a_fazer', 'fazendo', 'revisao', 'feito'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  a_fazer: 'A fazer',
  fazendo: 'Fazendo',
  revisao: 'Revisão',
  feito: 'Feito',
};

/** Bolinha e tarja de cada status. Ficavam copiadas em três telas. */
export const TASK_DOT: Record<TaskStatus, string> = {
  backlog: 'bg-neutral-200',
  a_fazer: 'bg-neutral-300',
  fazendo: 'bg-primary',
  revisao: 'bg-warning',
  feito: 'bg-success',
};

export const TASK_TOM: Record<TaskStatus, string> = {
  backlog: 'bg-black/[0.03] text-text-muted',
  a_fazer: 'bg-black/[0.04] text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  feito: 'bg-success/12 text-[#15803D]',
};

/**
 * Quem toca a tarefa, por padrão. Quase tudo aqui é a Camila que faz; quando for
 * de outra pessoa, troca no campo. Melhor um palpite certo na maioria das vezes
 * do que uma tarefa sem dono nenhum.
 */
export const RESPONSAVEL_PADRAO = 'Camila Gregório';

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
