'use client';

// Quadro de tarefas: uma coluna por status, arrastar para mover. O drag é o
// nativo do HTML5, mesmo padrão do quadro de negócios em pipeline/board.tsx,
// para não trazer dependência nova só por causa disso.

import { useState } from 'react';
import { createTask, deleteTask, moveTask, updateTask } from './actions';
import {
  PRIORITIES, PRIORITY_LABELS, PRIORITY_TONE, TASK_LABELS, TASK_STATUSES,
  type Priority, type TaskStatus,
} from './status';
import type { PhaseView, Send, TaskView } from './types';
import { DateCell, InlineText, hoje, inputCls } from './ui';

export function KanbanView({ tasks, phases, projectId, pending, send }: {
  tasks: TaskView[];
  phases: PhaseView[];
  projectId: string;
  pending: boolean;
  send: Send;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const daColuna = tasks
          .filter((t) => t.status === status)
          .sort((a, b) => a.sort - b.sort);

        return (
          <div
            key={status}
            onDragOver={(e) => { if (arrastando) e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain');
              setArrastando(null);
              if (!id) return;
              const atual = tasks.find((t) => t.id === id);
              // Soltar no vazio da coluna = fim da fila.
              if (atual && atual.status === status && daColuna[daColuna.length - 1]?.id === id) return;
              send(moveTask, { id, status, before: '' });
            }}
            className="flex min-h-[8rem] flex-col rounded-md border border-black/[0.06] bg-black/[0.015] p-2"
          >
            <div className="mb-2 flex items-baseline justify-between px-1">
              <span className="font-label text-[11px] uppercase tracking-wider text-text-secondary">
                {TASK_LABELS[status]}
              </span>
              <span className="font-label text-[11px] tabular-nums text-text-muted">{daColuna.length}</span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {daColuna.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  phases={phases}
                  pending={pending}
                  send={send}
                  onDragStart={() => setArrastando(t.id)}
                  onDragEnd={() => setArrastando(null)}
                  onDropBefore={(id) => send(moveTask, { id, status, before: t.id })}
                  arrastando={arrastando}
                />
              ))}
            </div>

            <NovaTarefa projectId={projectId} status={status} send={send} />
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, phases, pending, send, onDragStart, onDragEnd, onDropBefore, arrastando }: {
  task: TaskView;
  phases: PhaseView[];
  pending: boolean;
  send: Send;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropBefore: (id: string) => void;
  arrastando: string | null;
}) {
  const atrasada = !!task.dueDate && task.dueDate < hoje() && task.status !== 'feito';

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => { if (arrastando && arrastando !== task.id) e.preventDefault(); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = e.dataTransfer.getData('text/plain');
        if (id && id !== task.id) onDropBefore(id);
      }}
      className={`group relative overflow-hidden rounded-md border border-black/[0.07] bg-white pl-2 pr-2.5 py-2 transition-shadow hover:shadow-sm ${
        arrastando === task.id ? 'opacity-40' : ''
      }`}
    >
      {/* Tarja de prioridade */}
      <span className={`absolute left-0 top-0 h-full w-1 ${PRIORITY_TONE[task.priority]}`} aria-hidden />

      <div className="flex items-start gap-1.5 pl-1.5">
        <InlineText
          value={task.title}
          onSave={(v) => send(updateTask, { id: task.id, title: v })}
          className="flex-1 text-[13px] text-text-primary"
        />
        <button
          onClick={() => send(deleteTask, { id: task.id })}
          disabled={pending}
          className="shrink-0 font-label text-[14px] leading-none text-text-muted/40 opacity-0 transition group-hover:opacity-100 hover:text-danger"
          aria-label="Apagar tarefa"
        >
          ×
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-1.5">
        <InlineText
          value={task.assignee ?? ''}
          onSave={(v) => send(updateTask, { id: task.id, assignee: v })}
          placeholder="quem"
          className="font-label text-[11px] text-text-secondary"
          title="Clique para definir o responsável"
        />
        <DateCell
          value={task.dueDate}
          onSave={(v) => send(updateTask, { id: task.id, due_date: v })}
          atrasada={atrasada}
          placeholder="prazo"
        />
        <PrioritySelect value={task.priority} onChange={(v) => send(updateTask, { id: task.id, priority: v })} disabled={pending} />
        {phases.length > 0 && (
          <select
            value={task.phaseId ?? ''}
            onChange={(e) => send(updateTask, { id: task.id, phase_id: e.target.value })}
            disabled={pending}
            className="max-w-[8rem] truncate rounded border border-black/[0.08] bg-white px-1 py-0.5 font-label text-[10px] text-text-secondary"
            title="Etapa do cronograma"
          >
            <option value="">sem etapa</option>
            {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

export function PrioritySelect({ value, onChange, disabled }: {
  value: Priority;
  onChange: (v: Priority) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      disabled={disabled}
      className="rounded border border-black/[0.08] bg-white px-1 py-0.5 font-label text-[10px] text-text-secondary"
      title="Prioridade"
    >
      {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
    </select>
  );
}

/** Cadastro em sequência: envia, limpa e o cursor continua no campo. */
function NovaTarefa({ projectId, status, send }: { projectId: string; status: TaskStatus; send: Send }) {
  const [titulo, setTitulo] = useState('');

  const criar = () => {
    const limpo = titulo.trim();
    if (!limpo) return;
    send(createTask, { engagement_id: projectId, title: limpo, status });
    setTitulo('');
  };

  return (
    <input
      value={titulo}
      onChange={(e) => setTitulo(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') criar(); }}
      onBlur={criar}
      placeholder="+ tarefa"
      className={`${inputCls} mt-2 bg-transparent py-1 text-[13px] placeholder:text-text-muted`}
    />
  );
}
