'use client';

// Mesma base do Kanban, em tabela: dá para ver prazo, responsável e prioridade de
// todas as tarefas de uma vez, e ordenar pela coluna que interessa no momento.

import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { createTask, deleteTask, updateTask } from './actions';
import { PRIORITY_ORDER, TASK_LABELS, TASK_ORDER, TASK_STATUSES } from './status';
import type { PhaseView, Send, TaskView } from './types';
import { Avatar, ChipSelect, DateChip, InlineText, PriorityChip, hoje } from './ui';

type Coluna = 'titulo' | 'etapa' | 'quem' | 'inicio' | 'prazo' | 'prioridade' | 'status';

const cabecalhos: { id: Coluna; label: string; cls: string }[] = [
  { id: 'titulo', label: 'Tarefa', cls: 'min-w-[14rem]' },
  { id: 'quem', label: 'Quem', cls: 'w-32' },
  { id: 'inicio', label: 'Início', cls: 'w-24' },
  { id: 'prazo', label: 'Prazo', cls: 'w-24' },
  { id: 'prioridade', label: 'Prioridade', cls: 'w-28' },
  { id: 'status', label: 'Status', cls: 'w-32' },
  { id: 'etapa', label: 'Etapa', cls: 'w-36' },
];

const STATUS_DOT: Record<string, string> = {
  a_fazer: 'bg-neutral-300',
  fazendo: 'bg-primary',
  revisao: 'bg-warning',
  feito: 'bg-success',
};

const STATUS_TOM: Record<string, string> = {
  a_fazer: 'bg-black/[0.04] text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  feito: 'bg-success/12 text-[#15803D]',
};

export function ListView({ tasks, phases, projectId, send }: {
  tasks: TaskView[];
  phases: PhaseView[];
  projectId: string;
  pending: boolean;
  send: Send;
}) {
  const [ordem, setOrdem] = useState<{ col: Coluna; asc: boolean }>({ col: 'status', asc: true });
  const [criando, setCriando] = useState(false);
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
    <div className="overflow-hidden rounded-md border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/[0.07] bg-neutral-50">
              {cabecalhos.map((c) => {
                const ativa = ordem.col === c.id;
                return (
                  <th key={c.id} className={`${c.cls} px-3 py-2 text-left`}>
                    <button
                      onClick={() => setOrdem((o) => ({ col: c.id, asc: o.col === c.id ? !o.asc : true }))}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                        ativa ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {c.label}
                      {ativa && (ordem.asc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </th>
                );
              })}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((t) => {
              const atrasada = !!t.dueDate && t.dueDate < hoje() && t.status !== 'feito';
              return (
                <tr key={t.id} className="group border-b border-black/[0.04] transition-colors last:border-0 hover:bg-neutral-50/70">
                  <td className="px-3 py-2">
                    <InlineText
                      value={t.title}
                      onSave={(v) => send(updateTask, { id: t.id, title: v })}
                      className={`text-[13px] ${t.status === 'feito' ? 'text-text-muted line-through' : 'text-text-primary'}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Avatar nome={t.assignee} />
                      <InlineText
                        value={t.assignee ?? ''}
                        onSave={(v) => send(updateTask, { id: t.id, assignee: v })}
                        placeholder="quem"
                        className="text-[12px] text-text-secondary"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <DateChip value={t.startDate} onSave={(v) => send(updateTask, { id: t.id, start_date: v })} placeholder="início" />
                  </td>
                  <td className="px-3 py-2">
                    <DateChip value={t.dueDate} onSave={(v) => send(updateTask, { id: t.id, due_date: v })} atrasada={atrasada} />
                  </td>
                  <td className="px-3 py-2">
                    <PriorityChip value={t.priority} onChange={(v) => send(updateTask, { id: t.id, priority: v })} />
                  </td>
                  <td className="px-3 py-2">
                    <ChipSelect
                      value={t.status}
                      onChange={(v) => send(updateTask, { id: t.id, status: v })}
                      tone={STATUS_TOM[t.status]}
                      titulo="Status"
                      options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_LABELS[s], dot: STATUS_DOT[s] }))}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <ChipSelect
                      value={t.phaseId ?? ''}
                      onChange={(v) => send(updateTask, { id: t.id, phase_id: v })}
                      titulo="Etapa do cronograma"
                      placeholder="sem etapa"
                      options={[{ value: '', label: 'sem etapa' }, ...phases.map((p) => ({ value: p.id, label: p.name }))]}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={() => send(deleteTask, { id: t.id })}
                      className="rounded p-1 text-text-muted/50 opacity-0 transition group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
                      aria-label="Apagar tarefa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {ordenadas.length === 0 && !criando && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-text-muted">
                  Nenhuma tarefa ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-black/[0.05] px-3 py-2">
        {criando ? (
          <NovaLinha projectId={projectId} send={send} onFim={() => setCriando(false)} />
        ) : (
          <button
            onClick={() => setCriando(true)}
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova tarefa
          </button>
        )}
      </div>
    </div>
  );
}

function NovaLinha({ projectId, send, onFim }: { projectId: string; send: Send; onFim: () => void }) {
  const [titulo, setTitulo] = useState('');

  const criar = (continuar: boolean) => {
    const limpo = titulo.trim();
    if (limpo) send(createTask, { engagement_id: projectId, title: limpo, status: 'a_fazer' });
    setTitulo('');
    if (!continuar || !limpo) onFim();
  };

  return (
    <input
      autoFocus
      value={titulo}
      onChange={(e) => setTitulo(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') criar(true);
        if (e.key === 'Escape') onFim();
      }}
      onBlur={() => criar(false)}
      placeholder="O que precisa ser feito?"
      className="w-full text-[13px] text-text-primary outline-none placeholder:text-text-muted"
    />
  );
}
