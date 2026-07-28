// Formato que a página serve para as visualizações de Entregas.

import type { PhaseStatus, Priority, TaskStatus } from './status';

export type PhaseView = {
  id: string; name: string; description: string | null; status: PhaseStatus;
  startDate: string | null; endDate: string | null; clientVisible: boolean;
};

export type TaskView = {
  id: string; phaseId: string | null; title: string; notes: string | null;
  status: TaskStatus; priority: Priority; startDate: string | null; dueDate: string | null;
  assignee: string | null; clientVisible: boolean; sort: number;
};

export type ProjectView = {
  id: string; title: string | null; orgName: string | null; lifecycle: string;
  startDate: string | null; endDate: string | null; clientUrl: string | null;
  phases: PhaseView[]; tasks: TaskView[];
};

/** O que uma visualização precisa para editar uma tarefa. */
export type Send = (action: (fd: FormData) => Promise<void>, campos: Record<string, string>) => void;
