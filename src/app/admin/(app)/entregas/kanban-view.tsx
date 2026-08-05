'use client';

// Quadro de tarefas: uma coluna por status, arrastar para mover. O drag é o
// nativo do HTML5, mesmo padrão do quadro de negócios em pipeline/board.tsx,
// para não trazer dependência nova só por causa disso.

import { useState } from 'react';
import { Check, MoreHorizontal, Plus } from 'lucide-react';
import { createTask, deleteTask, moveTask, toggleTimer, updateTask } from './actions';
import { TASK_LABELS, TASK_STATUSES, type TaskStatus } from './status';
import { donoDaTarefa, porPrazo } from './types';
import type { ComentarioView, Pessoa, PhaseView, ProjectKind, Send, TaskComProjeto, TaskView } from './types';
import { ChipSelect, DateChip, MenuContexto, PessoaSelect, PriorityChip, TimerChip, hoje } from './ui';
import { TaskDrawer } from './task-drawer';

/** Faixa colorida no topo da coluna: dá para achar o estágio sem ler. */
const COLUNA_TOM: Record<TaskStatus, string> = {
  backlog: 'bg-neutral-200',
  a_fazer: 'bg-neutral-300',
  fazendo: 'bg-primary',
  revisao: 'bg-warning',
  feito: 'bg-success',
};

export function KanbanView({ tasks, comentarios, phasesDe, projectId, projectKind, pessoas, mostrarProjeto, onAbrirProjeto, pending, send }: {
  tasks: TaskComProjeto[];
  comentarios: ComentarioView[];
  phasesDe: (projetoId: string) => PhaseView[];
  projectId: string;
  projectKind: ProjectKind;
  pessoas: Pessoa[];
  mostrarProjeto: boolean;
  /** Clique no nome da empresa no card: abre só as tarefas daquele projeto. */
  onAbrirProjeto: (id: string) => void;
  pending: boolean;
  send: Send;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<TaskStatus | null>(null);
  const [criandoEm, setCriandoEm] = useState<TaskStatus | null>(null);
  const [abertaId, setAberta] = useState<string | null>(null);
  const subs = (id: string) => tasks.filter((t) => t.parentId === id);
  const aberta = tasks.find((t) => t.id === abertaId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {TASK_STATUSES.map((status) => {
        // Mesma ordem da lista: o que vence antes fica no topo da coluna.
        const daColuna = tasks.filter((t) => t.status === status && !t.parentId).sort(porPrazo);
        const destacada = alvo === status && arrastando;

        return (
          <section
            key={status}
            onDragOver={(e) => { if (arrastando) { e.preventDefault(); setAlvo(status); } }}
            onDragLeave={() => setAlvo((a) => (a === status ? null : a))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain');
              setArrastando(null);
              setAlvo(null);
              if (id) send(moveTask, { id, status, before: '' });
            }}
            className={`flex flex-col overflow-hidden rounded-md border transition-colors ${
              daColuna.length === 0 ? '' : 'min-h-[9rem]'
            } ${
              destacada ? 'border-primary/50 bg-primary/[0.04]' : 'border-black/[0.07] bg-neutral-50'
            }`}
          >
            <span className={`h-1 w-full ${COLUNA_TOM[status]}`} aria-hidden />

            <header className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-text-primary">{TASK_LABELS[status]}</h3>
                <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-text-muted">
                  {daColuna.length}
                </span>
              </div>
              <button
                onClick={() => setCriandoEm(status)}
                className="rounded-sm p-1 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-primary"
                title="Nova tarefa nesta coluna"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
              {daColuna.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  phases={phasesDe(t.projetoId)}
                  pessoas={pessoas}
                  projeto={mostrarProjeto ? t.projetoNome : null}
                  onAbrirProjeto={() => onAbrirProjeto(t.projetoId)}
                  send={send}
                  onDragStart={() => setArrastando(t.id)}
                  onDragEnd={() => { setArrastando(null); setAlvo(null); }}
                  onDropBefore={(id) => send(moveTask, { id, status, before: t.id })}
                  arrastando={arrastando}
                  onAbrir={() => setAberta(t.id)}
                  subtarefas={subs(t.id)}
                />
              ))}

              {criandoEm === status && (
                <NovaTarefa
                  projectId={projectId}
                  projectKind={projectKind}
                  status={status}
                  send={send}
                  onFim={() => setCriandoEm(null)}
                />
              )}

              {/* Coluna vazia não precisa de um vão grande anunciando o vazio:
                  fica só a faixa de convite, do tamanho de uma linha. */}
              {daColuna.length === 0 && criandoEm !== status && (
                <button
                  onClick={() => setCriandoEm(status)}
                  className="flex items-center justify-center rounded-sm border border-dashed border-black/10 py-2 text-[12px] text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {pending ? 'salvando…' : 'nada aqui'}
                </button>
              )}
            </div>
          </section>
        );
      })}

      {aberta && (
        <TaskDrawer
          task={aberta}
          comentarios={comentarios.filter((c) => c.taskId === aberta.id)}
          subtarefas={subs(aberta.id)}
          phases={phasesDe(aberta.projetoId)}
          projectId={aberta.projetoId}
          projectKind={aberta.projetoKind}
          pessoas={pessoas}
          send={send}
          onFechar={() => setAberta(null)}
        />
      )}
    </div>
  );
}

function TaskCard({ task, phases, pessoas, projeto, onAbrirProjeto, send, onDragStart, onDragEnd, onDropBefore, arrastando, onAbrir, subtarefas }: {
  task: TaskView;
  phases: PhaseView[];
  pessoas: Pessoa[];
  /** Nome do projeto, só quando o quadro mostra vários juntos. */
  projeto: string | null;
  onAbrirProjeto: () => void;
  send: Send;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropBefore: (id: string) => void;
  arrastando: string | null;
  onAbrir: () => void;
  subtarefas: TaskView[];
}) {
  const atrasada = !!task.dueDate && task.dueDate < hoje() && task.status !== 'feito';
  const etapa = phases.find((p) => p.id === task.phaseId);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  return (
    <article
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
      onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); }}
      className={`group cursor-grab rounded-md border border-black/[0.07] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(16,24,40,0.10)] active:cursor-grabbing ${
        arrastando === task.id ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-start gap-1.5">
        {/* Concluir direto no card, sem precisar arrastar até a coluna Feito. */}
        <button
          onClick={() => send(updateTask, { id: task.id, status: task.status === 'feito' ? 'a_fazer' : 'feito' })}
          title={task.status === 'feito' ? 'Reabrir tarefa' : 'Marcar como concluída'}
          aria-label={task.status === 'feito' ? 'Reabrir tarefa' : 'Marcar como concluída'}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
            task.status === 'feito'
              ? 'border-success bg-success text-white'
              : 'border-black/25 bg-white text-transparent hover:border-success hover:text-success/40'
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </button>

        <button
          onClick={onAbrir}
          title="Abrir tarefa"
          className={`flex-1 text-left text-[13px] leading-snug transition-colors hover:text-primary ${
            task.status === 'feito' ? 'text-text-muted line-through' : 'text-text-primary'
          }`}
        >
          {task.title}
        </button>

        {/* Apagar e reabrir moram no botão direito do card; aqui fica só o
            atalho para quem não pensa em clicar com o direito. */}
        <button
          onClick={(e) => setMenu({ x: e.clientX, y: e.clientY })}
          className="shrink-0 rounded p-0.5 text-text-muted/45 opacity-0 transition group-hover:opacity-100 hover:bg-black/[0.05] hover:text-text-primary"
          aria-label="Mais ações"
          title="Mais ações (ou clique com o botão direito)"
        >
          <MoreHorizontal className="h-3 w-3" />
        </button>
      </div>

      {menu && (
        <MenuContexto
          em={menu}
          fechar={() => setMenu(null)}
          itens={[
            { label: 'Abrir tarefa', onClick: onAbrir },
            {
              label: task.status === 'feito' ? 'Reabrir' : 'Marcar como concluída',
              onClick: () => send(updateTask, {
                id: task.id,
                status: task.status === 'feito' ? 'a_fazer' : 'feito',
              }),
            },
            {
              label: 'Apagar tarefa',
              perigo: true,
              onClick: () => {
                if (confirm(`Apagar a tarefa "${task.title}"? Não tem como desfazer.`)) {
                  send(deleteTask, { id: task.id });
                }
              },
            },
          ]}
        />
      )}

      {(etapa || projeto || subtarefas.length > 0) && (
        <p className="mt-1.5 flex items-center gap-2 text-[11px] text-text-muted">
          {projeto && (
            <button
              onClick={onAbrirProjeto}
              title={`Ver só as tarefas de ${projeto}`}
              className="min-w-0 truncate rounded-sm px-1 py-0.5 font-medium text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-primary"
            >
              {projeto}
            </button>
          )}
          {etapa && <span className="min-w-0 truncate" title={etapa.name}>{etapa.name}</span>}
          {subtarefas.length > 0 && (
            <span className="shrink-0 tabular-nums" title="Subtarefas concluídas">
              ☑ {subtarefas.filter((s) => s.status === 'feito').length}/{subtarefas.length}
            </span>
          )}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityChip value={task.priority} onChange={(v) => send(updateTask, { id: task.id, priority: v })} />
        <DateChip
          value={task.dueDate}
          onSave={(v) => send(updateTask, { id: task.id, due_date: v })}
          atrasada={atrasada}
        />
        <TimerChip
          segundos={task.tempoSegundos}
          rodandoDesde={task.timerDesde}
          onToggle={() => send(toggleTimer, { id: task.id })}
          desabilitado={task.status === 'feito'}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-black/[0.05] pt-2">
        <PessoaSelect
          value={task.assignee}
          pessoas={pessoas}
          onChange={(v) => send(updateTask, { id: task.id, assignee: v })}
        />

        {phases.length > 0 && (
          <ChipSelect
            value={task.phaseId ?? ''}
            onChange={(v) => send(updateTask, { id: task.id, phase_id: v })}
            titulo="Etapa do cronograma"
            placeholder="etapa"
            options={[{ value: '', label: 'sem etapa' }, ...phases.map((p) => ({ value: p.id, label: p.name }))]}
          />
        )}
      </div>
    </article>
  );
}

/** Cartão em branco no fim da coluna: digita, Enter cria e já abre o próximo. */
function NovaTarefa({ projectId, projectKind, status, send, onFim }: {
  projectId: string;
  projectKind: ProjectKind;
  status: TaskStatus;
  send: Send;
  onFim: () => void;
}) {
  const [titulo, setTitulo] = useState('');

  const criar = (continuar: boolean) => {
    const limpo = titulo.trim();
    if (limpo) send(createTask, { ...donoDaTarefa(projectId, projectKind), title: limpo, status });
    setTitulo('');
    if (!continuar || !limpo) onFim();
  };

  return (
    <div className="rounded-md border border-primary/30 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
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
      <p className="mt-1 text-[10px] text-text-muted">Enter para criar · Esc para fechar</p>
    </div>
  );
}
