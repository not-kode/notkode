'use client';

// Contexto completo de uma tarefa, numa gaveta lateral: o que a lista e o card
// não têm espaço para mostrar (descrição longa, subtarefas, todas as datas).
//
// Clicar na tarefa abre isso. Antes o título era editável no lugar, o que dava
// para corrigir uma palavra mas não para entender do que a tarefa trata.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { apagarComentario, createTask, criarComentario, deleteTask, toggleTimer, updateTask } from './actions';
import { TASK_DOT, TASK_LABELS, TASK_STATUSES, TASK_TOM } from './status';
import type { ComentarioView, PhaseView, Send, TaskView } from './types';
import { ChipSelect, DateChip, PriorityChip, TimerChip, hoje } from './ui';

export function TaskDrawer({ task, comentarios, subtarefas, phases, projectId, send, onFechar }: {
  task: TaskView;
  comentarios: ComentarioView[];
  subtarefas: TaskView[];
  phases: PhaseView[];
  projectId: string;
  send: Send;
  onFechar: () => void;
}) {
  const [titulo, setTitulo] = useState(task.title);
  const [notas, setNotas] = useState(task.notes ?? '');
  const [novaSub, setNovaSub] = useState('');
  const [comentario, setComentario] = useState('');

  // Trocar de tarefa sem fechar a gaveta tem que recarregar os campos.
  useEffect(() => {
    setTitulo(task.title);
    setNotas(task.notes ?? '');
  }, [task.id, task.title, task.notes]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onFechar]);

  const salvarTitulo = () => {
    const limpo = titulo.trim();
    if (limpo && limpo !== task.title) send(updateTask, { id: task.id, title: limpo });
  };
  const salvarNotas = () => {
    if (notas !== (task.notes ?? '')) send(updateTask, { id: task.id, notes: notas });
  };

  const criarSub = () => {
    const limpo = novaSub.trim();
    if (!limpo) return;
    send(createTask, {
      engagement_id: projectId,
      parent_task_id: task.id,
      title: limpo,
      status: 'a_fazer',
      phase_id: task.phaseId ?? '',
    });
    setNovaSub('');
  };

  const feitas = subtarefas.filter((s) => s.status === 'feito').length;
  const atrasada = !!task.dueDate && task.dueDate < hoje() && task.status !== 'feito';

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fechar" onClick={onFechar} className="flex-1 bg-black/25" />

      <aside className="flex w-full max-w-md flex-col overflow-y-auto border-l border-black/[0.08] bg-white shadow-[-8px_0_32px_rgba(16,24,40,0.12)]">
        <header className="sticky top-0 flex items-center gap-2 border-b border-black/[0.06] bg-white px-4 py-3">
          <button
            onClick={() => send(updateTask, { id: task.id, status: task.status === 'feito' ? 'a_fazer' : 'feito' })}
            title={task.status === 'feito' ? 'Reabrir tarefa' : 'Marcar como concluída'}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
              task.status === 'feito'
                ? 'border-success bg-success text-white'
                : 'border-black/25 bg-white text-transparent hover:border-success hover:text-success/40'
            }`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
          <span className="flex-1 font-label text-[10px] uppercase tracking-wider text-text-muted">Tarefa</span>
          <button
            onClick={() => { if (confirm(`Apagar a tarefa "${task.title}"? Não tem como desfazer.`)) { send(deleteTask, { id: task.id }); onFechar(); } }}
            title="Apagar tarefa"
            className="rounded p-1 text-text-muted/60 transition hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={onFechar} title="Fechar" className="rounded p-1 text-text-muted transition hover:bg-black/[0.05] hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-col gap-5 px-4 py-4">
          <textarea
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={salvarTitulo}
            rows={2}
            className={`w-full resize-none rounded-sm border border-transparent px-1.5 py-1 text-[17px] font-semibold leading-snug text-text-primary outline-none transition-colors hover:border-black/[0.08] focus:border-primary/40 ${
              task.status === 'feito' ? 'text-text-muted line-through' : ''
            }`}
          />

          {/* Propriedades em duas colunas, como ficha. */}
          <dl className="grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-2.5 text-[12px]">
            <dt className="text-text-muted">Status</dt>
            <dd>
              <ChipSelect
                value={task.status}
                onChange={(v) => send(updateTask, { id: task.id, status: v })}
                tone={TASK_TOM[task.status]}
                titulo="Status"
                options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_LABELS[s], dot: TASK_DOT[s] }))}
              />
            </dd>

            <dt className="text-text-muted">Prioridade</dt>
            <dd><PriorityChip value={task.priority} onChange={(v) => send(updateTask, { id: task.id, priority: v })} /></dd>

            <dt className="text-text-muted">Tempo</dt>
            <dd>
              <TimerChip
                segundos={task.tempoSegundos}
                rodandoDesde={task.timerDesde}
                onToggle={() => send(toggleTimer, { id: task.id })}
                desabilitado={task.status === 'feito'}
              />
            </dd>

            <dt className="text-text-muted">Início</dt>
            <dd><DateChip value={task.startDate} onSave={(v) => send(updateTask, { id: task.id, start_date: v })} placeholder="sem início" /></dd>

            <dt className="text-text-muted">Prazo</dt>
            <dd><DateChip value={task.dueDate} onSave={(v) => send(updateTask, { id: task.id, due_date: v })} atrasada={atrasada} placeholder="sem prazo" /></dd>

            <dt className="text-text-muted">Etapa</dt>
            <dd>
              <ChipSelect
                value={task.phaseId ?? ''}
                onChange={(v) => send(updateTask, { id: task.id, phase_id: v })}
                titulo="Etapa do cronograma"
                placeholder="sem etapa"
                options={[{ value: '', label: 'sem etapa' }, ...phases.map((p) => ({ value: p.id, label: p.name }))]}
              />
            </dd>

            <dt className="text-text-muted">Quem</dt>
            <dd>
              <input
                defaultValue={task.assignee ?? ''}
                onBlur={(e) => send(updateTask, { id: task.id, assignee: e.target.value })}
                placeholder="ninguém"
                className="w-full rounded-sm border border-transparent px-1.5 py-0.5 text-[12px] text-text-secondary outline-none transition-colors hover:border-black/[0.08] focus:border-primary/40"
              />
            </dd>
          </dl>

          <div>
            <p className="mb-1.5 font-label text-[10px] uppercase tracking-wider text-text-muted">Descrição</p>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={salvarNotas}
              rows={6}
              placeholder="O contexto que você vai querer na próxima vez que abrir isso."
              className="w-full resize-y rounded-sm border border-black/[0.08] px-2.5 py-2 text-[13px] leading-relaxed text-text-primary outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-2 font-label text-[10px] uppercase tracking-wider text-text-muted">
              Subtarefas
              {subtarefas.length > 0 && (
                <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 tabular-nums normal-case tracking-normal">
                  {feitas}/{subtarefas.length}
                </span>
              )}
            </p>

            {subtarefas.length > 0 && (
              <ul className="mb-1.5 flex flex-col">
                {subtarefas.map((s) => (
                  <li key={s.id} className="group flex items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-black/[0.02]">
                    <button
                      onClick={() => send(updateTask, { id: s.id, status: s.status === 'feito' ? 'a_fazer' : 'feito' })}
                      title={s.status === 'feito' ? 'Reabrir' : 'Concluir'}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                        s.status === 'feito'
                          ? 'border-success bg-success text-white'
                          : 'border-black/25 bg-white text-transparent hover:border-success hover:text-success/40'
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </button>
                    <span className={`min-w-0 flex-1 truncate text-[13px] ${s.status === 'feito' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {s.title}
                    </span>
                    <button
                      onClick={() => send(deleteTask, { id: s.id })}
                      title="Apagar subtarefa"
                      className="shrink-0 rounded p-0.5 text-text-muted/45 transition hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              <input
                value={novaSub}
                onChange={(e) => setNovaSub(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') criarSub(); }}
                onBlur={criarSub}
                placeholder="Nova subtarefa"
                className="w-full rounded-sm border border-transparent px-1 py-1 text-[13px] text-text-primary outline-none transition-colors hover:border-black/[0.08] focus:border-primary/40"
              />
            </div>
          </div>

          {/* A conversa da tarefa: veio do SimbOS e continua aqui, porque é onde
              fica registrado o que foi decidido no meio do caminho. */}
          <div>
            <p className="mb-1.5 flex items-center gap-2 font-label text-[10px] uppercase tracking-wider text-text-muted">
              Conversa
              {comentarios.length > 0 && (
                <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 tabular-nums normal-case tracking-normal">
                  {comentarios.length}
                </span>
              )}
            </p>

            {comentarios.length > 0 && (
              <ul className="mb-2 flex flex-col gap-2">
                {comentarios.map((c) => (
                  <li key={c.id} className="group rounded-md border border-black/[0.06] bg-neutral-50 px-2.5 py-2">
                    <p className="mb-1 flex items-center gap-2 text-[11px] text-text-muted">
                      <span className="font-medium text-text-secondary">{c.autor ?? 'alguém'}</span>
                      {new Date(c.quando).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                      <button
                        onClick={() => { if (confirm('Apagar este comentário?')) send(apagarComentario, { id: c.id }); }}
                        className="ml-auto rounded p-0.5 text-text-muted/40 transition hover:bg-danger/10 hover:text-danger"
                        aria-label="Apagar comentário"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </p>
                    <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-text-primary">{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              onKeyDown={(e) => {
                // Enter manda; Shift+Enter quebra linha, como em qualquer chat.
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const limpo = comentario.trim();
                  if (limpo) { send(criarComentario, { task_id: task.id, content: limpo }); setComentario(''); }
                }
              }}
              rows={2}
              placeholder="Escrever um comentário (Enter manda)"
              className="w-full resize-y rounded-sm border border-black/[0.08] px-2.5 py-2 text-[13px] leading-relaxed text-text-primary outline-none transition-colors focus:border-primary/40"
            />
          </div>

          {/* Visível para o cliente: mesma chave da etapa, no nível da tarefa. */}
          <label className="flex items-center gap-2 border-t border-black/[0.06] pt-4 text-[12px] text-text-secondary">
            <input
              type="checkbox"
              checked={task.clientVisible}
              onChange={(e) => send(updateTask, { id: task.id, client_visible: e.target.checked ? 'on' : 'off' })}
              className="h-3.5 w-3.5 accent-primary"
            />
            O cliente vê esta tarefa no link de acompanhamento
          </label>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
