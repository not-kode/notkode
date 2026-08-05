'use client';

// Lista de tarefas em blocos: um por status (a fazer, fazendo, revisão, backlog,
// feito). O status não é mais uma coluna nem um menu — é a separação da lista,
// que é como se lê um dia de trabalho. Etapa também saiu daqui: quem quiser
// mexer nela abre a tarefa.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { bulkTasks, createTask, deleteTask, moveTask, toggleTimer, updateTask } from './actions';
import {
  PRIORITIES, PRIORITY_LABELS, PRIORITY_ORDER, TASK_DOT, TASK_LABELS, TASK_STATUSES, type TaskStatus,
} from './status';
import { donoDaTarefa } from './types';
import type { ComentarioView, PhaseView, ProjectKind, Send, TaskComProjeto } from './types';
import { Avatar, ChipSelect, DateChip, InlineText, PriorityChip, Sigla, TimerChip, hoje } from './ui';
import { TaskDrawer } from './task-drawer';

// 'urgencia' é a ordem padrão: o que vence antes em cima e, dentro do mesmo dia,
// o mais urgente primeiro. 'manual' é a ordem do quadro, a que você monta
// arrastando. Clicar num cabeçalho troca para aquela coluna; arrastar devolve
// para a manual, senão a lista mostraria uma ordem e o banco guardaria outra.
type Coluna =
  | 'urgencia' | 'manual' | 'criada' | 'titulo' | 'quem' | 'inicio' | 'prazo' | 'prioridade' | 'tempo' | 'projeto';

/** Ordens prontas do seletor do topo, sem precisar caçar o cabeçalho certo. */
const ORDENS: { id: string; label: string; col: Coluna; asc: boolean }[] = [
  { id: 'urgencia',      label: 'Prazo e urgência',   col: 'urgencia',   asc: true },
  { id: 'manual',        label: 'Ordem do quadro',    col: 'manual',     asc: true },
  { id: 'recentes',      label: 'Mais recentes',      col: 'criada',     asc: false },
  { id: 'antigas',       label: 'Mais antigas',       col: 'criada',     asc: true },
  { id: 'prazo',         label: 'Prazo mais próximo', col: 'prazo',      asc: true },
  { id: 'prazo_longe',   label: 'Prazo mais distante', col: 'prazo',     asc: false },
  { id: 'prioridade',    label: 'Prioridade',         col: 'prioridade', asc: true },
];

/** A escolha de ordem é jeito de trabalhar, não dado: fica no navegador. */
const PREF_ORDEM = 'notkode.entregas.ordem';

/** A ordem dos blocos: o que está em jogo primeiro, feito no fim. */
const BLOCOS: TaskStatus[] = ['a_fazer', 'fazendo', 'revisao', 'backlog', 'feito'];

const BLOCO_TOM: Record<TaskStatus, string> = {
  a_fazer: 'bg-neutral-100 text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  backlog: 'bg-black/[0.03] text-text-muted',
  feito: 'bg-success/12 text-[#15803D]',
};

export function ListView({ tasks, comentarios, phasesDe, projectId, projectKind, mostrarProjeto, onAbrirProjeto, send }: {
  tasks: TaskComProjeto[];
  comentarios: ComentarioView[];
  phasesDe: (projetoId: string) => PhaseView[];
  projectId: string;
  projectKind: ProjectKind;
  mostrarProjeto: boolean;
  /** Clique no nome da empresa: fecha a visão "Todos" e abre só aquele projeto. */
  onAbrirProjeto: (id: string) => void;
  send: Send;
}) {
  const [ordem, setOrdem] = useState<{ col: Coluna; asc: boolean }>({ col: 'urgencia', asc: true });
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

  // A ordem escolhida volta na próxima visita: trocar toda vez cansa.
  useEffect(() => {
    const salva = localStorage.getItem(PREF_ORDEM);
    const achada = ORDENS.find((o) => o.id === salva);
    if (achada) setOrdem({ col: achada.col, asc: achada.asc });
  }, []);

  const guardarOrdem = (col: Coluna, asc: boolean) => {
    setOrdem({ col, asc });
    const achada = ORDENS.find((o) => o.col === col && o.asc === asc);
    if (achada) localStorage.setItem(PREF_ORDEM, achada.id);
    else localStorage.removeItem(PREF_ORDEM);
  };

  // Esc larga a seleção: é a saída sem risco de esbarrar num botão da barra.
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelecao([]); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  // Com vários projetos juntos, a coluna que identifica a tarefa é a EMPRESA, não
  // o responsável (que hoje é sempre a mesma pessoa). O responsável continua
  // editável dentro da tarefa, na gaveta. Num projeto só, vale o contrário.
  const colunas: { id: Coluna; label: string; cls: string }[] = [
    { id: 'titulo', label: 'Tarefa', cls: 'min-w-[14rem]' },
    mostrarProjeto
      ? { id: 'projeto', label: 'Empresa', cls: 'w-44' }
      : { id: 'quem', label: 'Quem', cls: 'w-32' },
    { id: 'inicio', label: 'Início', cls: 'w-28' },
    { id: 'prazo', label: 'Prazo', cls: 'w-28' },
    { id: 'prioridade', label: 'Prioridade', cls: 'w-28' },
    { id: 'tempo', label: 'Tempo', cls: 'w-32' },
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
      case 'criada': return t.createdAt;
      case 'prazo': return t.dueDate ?? '9999';
      case 'manual': return t.sort;
      // Prazo manda; empate no mesmo dia (e o monte sem prazo) vai pela
      // prioridade. Sem prazo fica no fim, que é onde ele não atrapalha.
      default: return `${t.dueDate ?? '9999-99-99'}#${PRIORITY_ORDER[t.priority]}`;
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
  // Toda ação em lote encerra a seleção: a barra sumir é o sinal de que a ação
  // foi para o banco, e barra parada na tela vira clique sem querer.
  const editarLote = (campos: Record<string, string>) => {
    // Responsável vale para a tarefa e para as subtarefas dela: elas não estão
    // na lista para serem marcadas, e quem toca a mãe toca as filhas.
    const ids = 'assignee' in campos
      ? [...new Set(selecao.flatMap((id) => [id, ...subs(id).map((s) => s.id)]))]
      : selecao;
    send(bulkTasks, { acao: 'editar', ids: ids.join(','), ...campos });
    setSelecao([]);
  };
  const apagarLote = () => {
    send(bulkTasks, { acao: 'apagar', ids: selecao.join(',') });
    setSelecao([]);
  };

  /** As selecionadas na ordem em que aparecem na tela, bloco a bloco. */
  const selecaoEmOrdem = () =>
    BLOCOS.flatMap((s) => ordenar(raizes.filter((t) => t.status === s)))
      .map((t) => t.id)
      .filter((id) => selecao.includes(id));

  /**
   * Soltou: as tarefas vão para o status do bloco de destino, na posição em que
   * foram soltas (`before` vazio = fim do bloco). Arrastar uma linha que está
   * marcada leva o lote inteiro junto — foi para isso que ele foi selecionado.
   * Como a posição só existe na ordem manual, arrastar devolve a lista para ela.
   */
  const soltar = (id: string, status: TaskStatus, before: string) => {
    setArrastando(null);
    setAlvo(null);
    if (!id || id === before) return;
    const lote = marcada(id) && selecao.length > 1;
    const ids = lote ? selecaoEmOrdem() : [id];
    if (ids.includes(before)) return;
    guardarOrdem('manual', true);
    send(moveTask, { ids: ids.join(','), status, before });
    if (lote) setSelecao([]);
  };

  const ordemAtual = ORDENS.find((o) => o.col === ordem.col && o.asc === ordem.asc);

  return (
    <div className="flex flex-col gap-3">
      {/* Como a lista está ordenada. As colunas continuam clicáveis; isto aqui é
          o atalho para as ordens que se usa todo dia, "mais recentes" à frente. */}
      <div className="flex items-center justify-end gap-1.5">
        <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" />
        <ChipSelect
          value={ordemAtual?.id ?? '—'}
          placeholder="personalizada"
          titulo="Ordenar a lista"
          onChange={(v) => {
            const o = ORDENS.find((x) => x.id === v);
            if (o) guardarOrdem(o.col, o.asc);
          }}
          options={ORDENS.map((o) => ({ value: o.id, label: o.label }))}
        />
      </div>

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
                    onClick={() => guardarOrdem('manual', true)}
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
                              onClick={() => guardarOrdem(c.id, ordem.col === c.id ? !ordem.asc : true)}
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
                            // O lote inteiro esmaece: dá para ver o que vai junto.
                            arrastando && (arrastando === t.id || (marcada(arrastando) && marcada(t.id))) ? 'opacity-40' : ''
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

                          {mostrarProjeto ? (
                            <td className="px-3 py-2">
                              {/* Clicar na empresa sai de "Todos" e abre só as tarefas dela. */}
                              <button
                                onClick={() => onAbrirProjeto(t.projetoId)}
                                title={`Ver só as tarefas de ${t.projetoNome}`}
                                className="flex w-full min-w-0 items-center gap-1.5 rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-black/[0.04]"
                              >
                                <Sigla nome={t.projetoNome} />
                                <span className="min-w-0 truncate text-[12px] font-medium text-text-secondary">
                                  {t.projetoNome}
                                </span>
                              </button>
                            </td>
                          ) : (
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
                          )}

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
                              não tem volta. */}
                          <td className="px-2 py-2 text-right">
                            <button
                              onClick={() => { if (confirm(`Apagar a tarefa "${t.title}"? Não tem como desfazer.`)) send(deleteTask, { id: t.id }); }}
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
                          <NovaLinha projectId={projectId} projectKind={projectKind} status={status} send={send} onFim={() => setCriandoEm(null)} />
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

      {selecao.length > 0 && (
        <BarraSelecao
          quantas={selecao.length}
          etapas={mostrarProjeto ? null : phasesDe(projectId)}
          editar={editarLote}
          apagar={apagarLote}
          limpar={() => setSelecao([])}
        />
      )}

      {aberta && (
        <TaskDrawer
          task={aberta}
          comentarios={comentarios.filter((c) => c.taskId === aberta.id)}
          subtarefas={subs(aberta.id)}
          phases={phasesDe(aberta.projetoId)}
          projectId={aberta.projetoId}
          projectKind={aberta.projetoKind}
          send={send}
          onFechar={() => setAberta(null)}
        />
      )}
    </div>
  );
}

/**
 * Barra do que fazer com as selecionadas. Acompanha a rolagem e some quando nada
 * está marcado. Depois de uma mudança a seleção continua de pé: mudar o
 * responsável e o prazo do mesmo lote é a sequência normal, não duas tarefas.
 *
 * A etapa só entra quando a lista é de um projeto só: em "Todos", cada tarefa
 * pertence a um cronograma diferente e não existe etapa comum para aplicar.
 */
function BarraSelecao({ quantas, etapas, editar, apagar, limpar }: {
  quantas: number;
  etapas: PhaseView[] | null;
  editar: (campos: Record<string, string>) => void;
  apagar: () => void;
  limpar: () => void;
}) {
  const [quem, setQuem] = useState('');

  // Em portal e fixa na janela: dentro da tabela ela ficava presa no fim da
  // página (o conteúdo do admin rola na horizontal, e isso mata o sticky).
  return createPortal(
    <div className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(16,24,40,0.16)]">
      <span className="px-1 text-[12px] font-medium tabular-nums text-text-primary">
        {quantas} selecionada{quantas === 1 ? '' : 's'}
      </span>

      <button
        onClick={() => editar({ status: 'feito' })}
        className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-[12px] font-semibold text-white transition hover:opacity-90"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        Concluir
      </button>

      <span className="h-4 w-px bg-black/[0.08]" />

      <ChipSelect
        value=""
        placeholder="Mover para"
        titulo="Mover as selecionadas para outro bloco"
        onChange={(v) => editar({ status: v })}
        options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_LABELS[s], dot: TASK_DOT[s] }))}
      />

      <ChipSelect
        value=""
        placeholder="Prioridade"
        titulo="Prioridade das selecionadas"
        onChange={(v) => editar({ priority: v })}
        options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
      />

      {etapas && etapas.length > 0 && (
        <ChipSelect
          // Nenhuma opção casa com este valor, então o chip mostra o rótulo em
          // vez de fingir que as selecionadas já estão numa etapa.
          value="—"
          placeholder="Etapa"
          titulo="Etapa do cronograma"
          onChange={(v) => editar({ phase_id: v })}
          options={[{ value: '', label: 'sem etapa' }, ...etapas.map((e) => ({ value: e.id, label: e.name }))]}
        />
      )}

      {/* Enter aplica; vazio limpa o responsável de todas. */}
      <input
        value={quem}
        onChange={(e) => setQuem(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { editar({ assignee: quem }); setQuem(''); } }}
        placeholder="Responsável"
        title="Digite o nome e aperte Enter"
        className="w-28 rounded-full border border-black/[0.1] px-2.5 py-1 text-[12px] text-text-primary outline-none transition-colors focus:border-primary/40"
      />

      <input
        type="date"
        onChange={(e) => editar({ due_date: e.target.value })}
        title="Prazo das selecionadas"
        className="rounded-full border border-black/[0.1] px-2.5 py-1 text-[12px] text-text-secondary outline-none transition-colors focus:border-primary/40"
      />

      <span className="h-4 w-px bg-black/[0.08]" />

      <button
        onClick={() => { if (confirm(`Apagar ${quantas} tarefa(s)? Não tem como desfazer.`)) apagar(); }}
        className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] px-3 py-1 text-[12px] font-medium text-text-secondary transition hover:border-danger/40 hover:text-danger"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Apagar
      </button>

      <button
        onClick={limpar}
        className="rounded-full px-2 py-1 text-[12px] text-text-muted transition hover:text-text-primary"
      >
        Limpar
      </button>
    </div>,
    document.body,
  );
}

function NovaLinha({ projectId, projectKind, status, send, onFim }: {
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
