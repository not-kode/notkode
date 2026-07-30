'use client';

// Lista de tarefas em blocos: um por status (a fazer, fazendo, revisão, backlog,
// feito). O status não é mais uma coluna nem um menu — é a separação da lista,
// que é como se lê um dia de trabalho. Etapa também saiu daqui: quem quiser
// mexer nela abre a tarefa.

import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { bulkTasks, createTask, deleteTask, moveTask, toggleTimer, updateTask } from './actions';
import { PRIORITY_ORDER, TASK_DOT, TASK_LABELS, type TaskStatus } from './status';
import type { PhaseView, Send, TaskComProjeto } from './types';
import { Avatar, DateChip, InlineText, PriorityChip, TimerChip, hoje } from './ui';
import { TaskDrawer } from './task-drawer';

// 'manual' é a ordem do quadro, a que você monta arrastando. Clicar num
// cabeçalho troca para aquela coluna; arrastar de volta devolve para a manual,
// senão a lista mostraria uma ordem e o banco guardaria outra.
type Coluna = 'manual' | 'titulo' | 'quem' | 'inicio' | 'prazo' | 'prioridade' | 'tempo' | 'projeto';

/** A ordem dos blocos: o que está em jogo primeiro, feito no fim. */
const BLOCOS: TaskStatus[] = ['a_fazer', 'fazendo', 'revisao', 'backlog', 'feito'];

const BLOCO_TOM: Record<TaskStatus, string> = {
  a_fazer: 'bg-neutral-100 text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  backlog: 'bg-black/[0.03] text-text-muted',
  feito: 'bg-success/12 text-[#15803D]',
};

export function ListView({ tasks, phasesDe, projectId, mostrarProjeto, send }: {
  tasks: TaskComProjeto[];
  phasesDe: (projetoId: string) => PhaseView[];
  projectId: string;
  mostrarProjeto: boolean;
  send: Send;
}) {
  const [ordem, setOrdem] = useState<{ col: Coluna; asc: boolean }>({ col: 'manual', asc: true });
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [punho, setPunho] = useState<string | null>(null);
  const [criandoEm, setCriandoEm] = useState<TaskStatus | null>(null);
  // Feito nasce fechado: é histórico, não fila.
  const [fechados, setFechados] = useState<TaskStatus[]>(['feito']);
  const [abertaId, setAberta] = useState<string | null>(null);
  // Seleção para agir em lote: concluir dez tarefas uma a uma é trabalho à toa.
  const [selecao, setSelecao] = useState<string[]>([]);

  const subs = (id: string) => tasks.filter((t) => t.parentId === id);
  const aberta = tasks.find((t) => t.id === abertaId) ?? null;

  const colunas: { id: Coluna; label: string; cls: string }[] = [
    { id: 'titulo', label: 'Tarefa', cls: 'min-w-[14rem]' },
    ...(mostrarProjeto ? [{ id: 'projeto' as Coluna, label: 'Projeto', cls: 'w-36' }] : []),
    { id: 'quem', label: 'Quem', cls: 'w-32' },
    { id: 'inicio', label: 'Início', cls: 'w-24' },
    { id: 'prazo', label: 'Prazo', cls: 'w-24' },
    { id: 'prioridade', label: 'Prioridade', cls: 'w-28' },
    { id: 'tempo', label: 'Tempo', cls: 'w-28' },
  ];
  const colspan = colunas.length + 4;

  const chave = (t: TaskComProjeto): string | number => {
    switch (ordem.col) {
      case 'titulo': return t.title.toLowerCase();
      case 'projeto': return t.projetoNome.toLowerCase();
      case 'quem': return (t.assignee ?? '').toLowerCase();
      case 'inicio': return t.startDate ?? '9999';
      case 'prioridade': return PRIORITY_ORDER[t.priority];
      case 'tempo': return -t.tempoSegundos;
      case 'prazo': return t.dueDate ?? '9999';
      default: return t.sort;
    }
  };

  const ordenar = (lista: TaskComProjeto[]) =>
    [...lista].sort((a, b) => {
      const va = chave(a), vb = chave(b);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      // Empate cai no prazo: entre duas tarefas iguais, vale a que vence antes.
      return (ordem.asc ? cmp : -cmp) || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
    });

  const raizes = tasks.filter((t) => !t.parentId);
  const marcada = (id: string) => selecao.includes(id);
  const alternar = (id: string) =>
    setSelecao((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const emLote = (acao: 'concluir' | 'reabrir' | 'apagar') => {
    send(bulkTasks, { acao, ids: selecao.join(',') });
    setSelecao([]);
  };

  /**
   * Soltou: a tarefa vai para o status do bloco de destino, na posição em que
   * foi solta (`before` vazio = fim do bloco). Como a posição só existe na ordem
   * manual, arrastar devolve a lista para ela.
   */
  const soltar = (id: string, status: TaskStatus, before: string) => {
    setArrastando(null);
    setAlvo(null);
    if (!id || id === before) return;
    setOrdem({ col: 'manual', asc: true });
    send(moveTask, { id, status, before });
  };

  return (
    <div className="flex flex-col gap-3">
      {BLOCOS.map((status) => {
        const doBloco = ordenar(raizes.filter((t) => t.status === status));
        const fechado = fechados.includes(status);
        const blocoTodo = doBloco.length > 0 && doBloco.every((t) => marcada(t.id));

        return (
          <section
            key={status}
            onDragOver={(e) => { if (arrastando) { e.preventDefault(); setAlvo(status); } }}
            onDragLeave={() => setAlvo((a) => (a === status ? null : a))}
            onDrop={(e) => {
              e.preventDefault();
              soltar(e.dataTransfer.getData('text/plain'), status, '');
            }}
            className={`overflow-hidden rounded-md border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-colors ${
              arrastando && alvo === status ? 'border-primary/50' : 'border-black/[0.07]'
            }`}
          >
            <header className="flex items-center gap-2 border-b border-black/[0.06] bg-neutral-50 px-3 py-2">
              <input
                type="checkbox"
                checked={blocoTodo}
                disabled={doBloco.length === 0}
                onChange={() =>
                  setSelecao((s) => {
                    const ids = doBloco.map((t) => t.id);
                    return blocoTodo ? s.filter((x) => !ids.includes(x)) : [...new Set([...s, ...ids])];
                  })
                }
                title="Selecionar todas deste bloco"
                aria-label="Selecionar todas deste bloco"
                className="h-3.5 w-3.5 accent-primary disabled:opacity-30"
              />
              <button
                onClick={() => setFechados((f) => (fechado ? f.filter((s) => s !== status) : [...f, status]))}
                aria-label={fechado ? 'Abrir bloco' : 'Fechar bloco'}
                className="rounded p-0.5 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
              >
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${fechado ? '' : 'rotate-90'}`} />
              </button>

              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${BLOCO_TOM[status]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${TASK_DOT[status]}`} />
                {TASK_LABELS[status]}
              </span>
              <span className="text-[11px] tabular-nums text-text-muted">{doBloco.length}</span>

              <div className="ml-auto flex items-center gap-3">
                {/* Ordenado por uma coluna, arrastar não teria onde encaixar:
                    este atalho devolve a lista para a ordem que você monta. */}
                {ordem.col !== 'manual' && (
                  <button
                    onClick={() => setOrdem({ col: 'manual', asc: true })}
                    className="text-[11px] text-text-muted underline decoration-dotted transition-colors hover:text-primary"
                  >
                    voltar à ordem manual
                  </button>
                )}
                <button
                  onClick={() => { setCriandoEm(status); setFechados((f) => f.filter((s) => s !== status)); }}
                  className="inline-flex items-center gap-1 text-[12px] text-text-muted transition-colors hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tarefa
                </button>
              </div>
            </header>

            {!fechado && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.05]">
                      <th className="w-6" />
                      <th className="w-8" />
                      <th className="w-9" />
                      {colunas.map((c) => {
                        const ativa = ordem.col === c.id;
                        return (
                          <th key={c.id} className={`${c.cls} px-3 py-1.5 text-left`}>
                            <button
                              onClick={() => setOrdem((o) => ({ col: c.id, asc: o.col === c.id ? !o.asc : true }))}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
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
                    {doBloco.map((t) => {
                      const atrasada = !!t.dueDate && t.dueDate < hoje() && t.status !== 'feito';
                      const filhas = subs(t.id);
                      return (
                        <tr
                          key={t.id}
                          // Só o punho puxa: linha inteira arrastável impede
                          // selecionar texto e editar os campos de dentro.
                          draggable={punho === t.id}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', t.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setArrastando(t.id);
                          }}
                          onDragEnd={() => { setArrastando(null); setAlvo(null); setPunho(null); }}
                          onDragOver={(e) => {
                            if (arrastando && arrastando !== t.id) { e.preventDefault(); setAlvo(t.id); }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            soltar(e.dataTransfer.getData('text/plain'), status, t.id);
                          }}
                          className={`group border-b border-black/[0.04] transition-colors last:border-0 ${
                            arrastando === t.id ? 'opacity-40' : ''
                          } ${alvo === t.id && arrastando && arrastando !== t.id ? 'border-t-2 border-t-primary' : ''} ${
                            marcada(t.id) ? 'bg-primary/[0.05]' : 'hover:bg-neutral-50/70'
                          }`}
                        >
                          <td
                            onMouseDown={() => setPunho(t.id)}
                            onMouseUp={() => setPunho(null)}
                            title="Arraste para reordenar ou mudar de bloco"
                            className="cursor-grab py-2 pl-2 pr-0 text-text-muted/40 transition-colors hover:text-text-muted active:cursor-grabbing"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </td>

                          <td className="py-2 pl-1 pr-0">
                            <input
                              type="checkbox"
                              checked={marcada(t.id)}
                              onChange={() => alternar(t.id)}
                              aria-label={`Selecionar ${t.title}`}
                              className="h-3.5 w-3.5 accent-primary"
                            />
                          </td>

                          {/* Concluir sem abrir menu: é a ação de todo dia. */}
                          <td className="py-2 pl-2 pr-0">
                            <button
                              onClick={() => send(updateTask, { id: t.id, status: t.status === 'feito' ? 'a_fazer' : 'feito' })}
                              title={t.status === 'feito' ? 'Reabrir tarefa' : 'Marcar como concluída'}
                              aria-label={t.status === 'feito' ? 'Reabrir tarefa' : 'Marcar como concluída'}
                              className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
                                t.status === 'feito'
                                  ? 'border-success bg-success text-white'
                                  : 'border-black/25 bg-white text-transparent hover:border-success hover:text-success/40'
                              }`}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </button>
                          </td>

                          <td className="px-3 py-2">
                            <button
                              onClick={() => setAberta(t.id)}
                              className={`flex w-full items-center gap-2 text-left text-[13px] transition-colors hover:text-primary ${
                                t.status === 'feito' ? 'text-text-muted line-through' : 'text-text-primary'
                              }`}
                              title="Abrir tarefa"
                            >
                              <span className="min-w-0 truncate">{t.title}</span>
                              {filhas.length > 0 && (
                                <span className="shrink-0 rounded-full bg-black/[0.06] px-1.5 text-[10px] tabular-nums text-text-muted">
                                  {filhas.filter((s) => s.status === 'feito').length}/{filhas.length}
                                </span>
                              )}
                            </button>
                          </td>

                          {mostrarProjeto && (
                            <td className="px-3 py-2">
                              <span className="block truncate text-[11px] text-text-muted" title={t.projetoNome}>
                                {t.projetoNome}
                              </span>
                            </td>
                          )}

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
                            <TimerChip
                              segundos={t.tempoSegundos}
                              rodandoDesde={t.timerDesde}
                              onToggle={() => send(toggleTimer, { id: t.id })}
                              desabilitado={t.status === 'feito'}
                            />
                          </td>

                          {/* Sempre visível, de propósito: escondido no hover, ninguém
                              descobre que existe. Confirma antes, porque apagar aqui
                              apaga também no SimbOS. */}
                          <td className="px-2 py-2 text-right">
                            <button
                              onClick={() => { if (confirm(`Apagar a tarefa "${t.title}"? Ela sai também do SimbOS.`)) send(deleteTask, { id: t.id }); }}
                              className="rounded p-1 text-text-muted/45 transition hover:bg-danger/10 hover:text-danger"
                              aria-label="Apagar tarefa"
                              title="Apagar tarefa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {criandoEm === status && (
                      <tr>
                        <td colSpan={colspan} className="px-3 py-2">
                          <NovaLinha projectId={projectId} status={status} send={send} onFim={() => setCriandoEm(null)} />
                        </td>
                      </tr>
                    )}

                    {doBloco.length === 0 && criandoEm !== status && (
                      <tr>
                        <td colSpan={colspan} className="px-3 py-4 text-center text-[12px] text-text-muted">
                          Nada aqui.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      {/* Barra da seleção: acompanha a rolagem, some quando nada está marcado. */}
      {selecao.length > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto flex flex-wrap items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(16,24,40,0.16)]">
          <span className="px-1 text-[12px] font-medium text-text-primary tabular-nums">
            {selecao.length} selecionada{selecao.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={() => emLote('concluir')}
            className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-[12px] font-semibold text-white transition hover:opacity-90"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Concluir
          </button>
          <button
            onClick={() => emLote('reabrir')}
            className="rounded-full border border-black/[0.1] px-3 py-1 text-[12px] font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
          >
            Reabrir
          </button>
          <button
            onClick={() => {
              if (confirm(`Apagar ${selecao.length} tarefa(s)? Elas saem também do SimbOS.`)) emLote('apagar');
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] px-3 py-1 text-[12px] font-medium text-text-secondary transition hover:border-danger/40 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Apagar
          </button>
          <button
            onClick={() => setSelecao([])}
            className="rounded-full px-2 py-1 text-[12px] text-text-muted transition hover:text-text-primary"
          >
            Limpar
          </button>
        </div>
      )}

      {aberta && (
        <TaskDrawer
          task={aberta}
          subtarefas={subs(aberta.id)}
          phases={phasesDe(aberta.projetoId)}
          projectId={aberta.projetoId}
          send={send}
          onFechar={() => setAberta(null)}
        />
      )}
    </div>
  );
}

function NovaLinha({ projectId, status, send, onFim }: {
  projectId: string;
  status: TaskStatus;
  send: Send;
  onFim: () => void;
}) {
  const [titulo, setTitulo] = useState('');

  const criar = (continuar: boolean) => {
    const limpo = titulo.trim();
    if (limpo) send(createTask, { engagement_id: projectId, title: limpo, status });
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
      placeholder={`O que precisa ser feito? (entra em ${TASK_LABELS[status].toLowerCase()})`}
      className="w-full text-[13px] text-text-primary outline-none placeholder:text-text-muted"
    />
  );
}
