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

/**
 * Cor do chip da sprint. Cinza para o que ainda não começou, azul para o que
 * está andando, verde para o que fechou e âmbar para o que parou no meio: o
 * pausado precisa saltar aos olhos, senão a sprint parada some na lista.
 */
export const PHASE_TOM: Record<PhaseStatus, string> = {
  pendente: 'bg-black/[0.04] text-text-secondary',
  em_andamento: 'bg-primary/10 text-primary',
  concluida: 'bg-success/12 text-[#15803D]',
  pausada: 'bg-warning/15 text-[#B45309]',
};

export const PHASE_DOT: Record<PhaseStatus, string> = {
  pendente: 'bg-neutral-300',
  em_andamento: 'bg-primary',
  concluida: 'bg-success',
  pausada: 'bg-warning',
};

// "Backlog" é o que existe mas não entrou na fila; "A fazer" é o que está
// puxado para agora. Sem a distinção, tudo que é ideia futura polui a fila real.
export const TASK_STATUSES = ['backlog', 'a_fazer', 'fazendo', 'revisao', 'feito'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// Rótulos em inglês, como o menu do admin: são nomes curtos de ferramenta, os
// mesmos que a gente usa falando ("está em review", "joga no backlog"). O que o
// cliente vê pelo link de acompanhamento não passa por aqui e segue em português.
export const TASK_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  a_fazer: 'To do',
  fazendo: 'In progress',
  revisao: 'Review',
  feito: 'Done',
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

// ── Tags ─────────────────────────────────────────────────────────────────────

/**
 * Paleta das tags. A tag guarda a chave da cor, não o hex: assim a tag
 * acompanha o tema do sistema e do link do cliente sem precisar migrar dado.
 */
export const TAG_COLORS = ['azul', 'verde', 'ambar', 'vermelho', 'violeta', 'cinza'] as const;
export type TagColor = (typeof TAG_COLORS)[number];

export const TAG_COLOR_LABELS: Record<TagColor, string> = {
  azul: 'Azul',
  verde: 'Verde',
  ambar: 'Âmbar',
  vermelho: 'Vermelho',
  violeta: 'Violeta',
  cinza: 'Cinza',
};

/** Chip da tag: fundo lavado, texto forte, sem borda gritando. */
export const TAG_TOM: Record<TagColor, string> = {
  azul: 'bg-primary/10 text-primary',
  verde: 'bg-success/12 text-[#15803D]',
  ambar: 'bg-warning/15 text-[#B45309]',
  vermelho: 'bg-danger/10 text-danger',
  violeta: 'bg-[#7C3AED]/10 text-[#6D28D9]',
  cinza: 'bg-black/[0.06] text-text-secondary',
};

/** Bolinha cheia da cor, para o seletor: o tom lavado do chip não se vê num ponto. */
export const TAG_DOT: Record<TagColor, string> = {
  azul: 'bg-primary',
  verde: 'bg-success',
  ambar: 'bg-warning',
  vermelho: 'bg-danger',
  violeta: 'bg-[#7C3AED]',
  cinza: 'bg-neutral-400',
};

export const corDaTag = (cor: string): TagColor =>
  (TAG_COLORS as readonly string[]).includes(cor) ? (cor as TagColor) : 'cinza';
