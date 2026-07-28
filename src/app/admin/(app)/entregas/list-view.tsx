'use client';

// Mesma base do Kanban, em tabela: dá para ver prazo, responsável e prioridade de
// todas as tarefas de uma vez, e ordenar pela coluna que interessa no momento.

import { useState } from 'react';
import { createTask, deleteTask, updateTask } from './actions';
import { PRIORITY_ORDER, PRIORITY_TONE, TASK_LABELS, TASK_ORDER, TASK_STATUSES, type TaskStatus } from './status';
import type { PhaseView, Send, TaskView } from './types';
import { DateCell, InlineText, hoje, inputCls } from './ui';
import { PrioritySelect } from './kanban-view';

type Coluna = 'titulo' | 'etapa' | 'quem' | 'inicio' | 'prazo' | 'prioridade' | 'status';

const cabecalhos: { id: Coluna; label: string; cls: string }[] = [
  { id: 'titulo', label: 'Tarefa', cls: 'min-w-[12rem]' },
  { id: 'etapa', label: 'Etapa', cls: 'w-36' },
  { id: 'quem', label: 'Quem', cls: 'w-24' },
  { id: 'inicio', label: 'Início', cls: 'w-24' },
  { id: 'prazo', label: 'Prazo', cls: 'w-24' },
  { id: 'prioridade', label: 'Prioridade', cls: 'w-24' },
  { id: 'status', label: 'Status', cls: 'w-28' },
];

export function ListView({ tasks, phases, projectId, pending, send }: {
  tasks: TaskView[];
  phases: PhaseView[];
  projectId: string;
  pending: boolean;
  send: Send;
}) {
  const [ordem, setOrdem] = useState<{ col: Coluna; asc: boolean }>({ col: 'status', asc: true });
  const nomeEtapa = (id: string | null) => phases.find((p) => p.id === id)?.name ?? '';

  const chave = (t: TaskView): string | number => {
    switch (ordem.col) {
      case 'titulo': return t.title.toLowerCase();
      case 'etapa': return nomeEtapa(t.phaseId).toLowerCase();
      case 'quem': return (t.assignee ?? '').toLowerCase();
      case 'inicio': return t.startDate ?? '9999';
      case 'prazo': return t.dueDate ?? '9999';
      case 'prioridade': return PRIORITY_ORDER[t.priority];
      default: return TASK_ORDER[t.status];
    }
  };

  const ordenadas = [...tasks].sort((a, b) => {
    const va = chave(a), vb = chave(b);
    const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
    // Empate cai no prazo: entre duas tarefas iguais, vale a que vence antes.
    return (ordem.asc ? cmp : -cmp) || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
  });

  return (
    <div className="rounded-md border border-black/[0.06] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">
          <thead>
            <tr className="border-b border-black/[0.06]">
              {cabecalhos.map((c) => (
                <th key={c.id} className={`${c.cls} px-2 py-2 text-left`}>
                  <button
                    onClick={() => setOrdem((o) => ({ col: c.id, asc: o.col === c.id ? !o.asc : true }))}
                    className="font-label text-[10px] uppercase tracking-wider text-text-muted transition-colors hover:text-text-primary"
                  >
                    {c.label}
                    {ordem.col === c.id && <span className="ml-1">{ordem.asc ? '↑' : '↓'}</span>}
                  </button>
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((t) => {
              const atrasada = !!t.dueDate && t.dueDate < hoje() && t.status !== 'feito';
              return (
                <tr key={t.id} className="group border-b border-black/[0.04] last:border-0">
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-3.5 w-1 shrink-0 rounded-full ${PRIORITY_TONE[t.priority]}`} aria-hidden />
                      <InlineText
                        value={t.title}
                        onSave={(v) => send(updateTask, { id: t.id, title: v })}
                        className={`flex-1 text-[13px] ${t.status === 'feito' ? 'text-text-muted line-through' : 'text-text-primary'}`}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={t.phaseId ?? ''}
                      onChange={(e) => send(updateTask, { id: t.id, phase_id: e.target.value })}
                      disabled={pending}
                      className="w-full truncate rounded border border-black/[0.08] bg-white px-1 py-0.5 font-label text-[11px] text-text-secondary"
                    >
                      <option value="">sem etapa</option>
                      {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <InlineText
                      value={t.assignee ?? ''}
                      onSave={(v) => send(updateTask, { id: t.id, assignee: v })}
                      placeholder="quem"
                      className="font-label text-[11px] text-text-secondary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <DateCell value={t.startDate} onSave={(v) => send(updateTask, { id: t.id, start_date: v })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <DateCell value={t.dueDate} onSave={(v) => send(updateTask, { id: t.id, due_date: v })} atrasada={atrasada} />
                  </td>
                  <td className="px-2 py-1.5">
                    <PrioritySelect value={t.priority} onChange={(v) => send(updateTask, { id: t.id, priority: v })} disabled={pending} />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={t.status}
                      onChange={(e) => send(updateTask, { id: t.id, status: e.target.value })}
                      disabled={pending}
                      className="w-full rounded border border-black/[0.08] bg-white px-1 py-0.5 font-label text-[11px] text-text-secondary"
                    >
                      {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-1 py-1.5 text-right">
                    <button
                      onClick={() => send(deleteTask, { id: t.id })}
                      disabled={pending}
                      className="font-label text-[14px] leading-none text-text-muted/40 opacity-0 transition group-hover:opacity-100 hover:text-danger"
                      aria-label="Apagar tarefa"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-black/[0.05] px-2 py-2">
        <NovaLinha projectId={projectId} send={send} />
      </div>
    </div>
  );
}

function NovaLinha({ projectId, send }: { projectId: string; send: Send }) {
  const [titulo, setTitulo] = useState('');
  const criar = (status: TaskStatus = 'a_fazer') => {
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
      onBlur={() => criar()}
      placeholder="+ nova tarefa"
      className={`${inputCls} border-transparent bg-transparent text-[13px] placeholder:text-text-muted`}
    />
  );
}
