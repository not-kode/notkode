'use client';

// Lista de tarefas em blocos: um por status (a fazer, fazendo, revisão, backlog,
// feito). O status não é mais uma coluna nem um menu — é a separação da lista,
// que é como se lê um dia de trabalho. Etapa também saiu daqui: quem quiser
// mexer nela abre a tarefa.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight, GripVertical, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { bulkTasks, createTask, deleteTask, moveTask, toggleTimer, updateTask } from './actions';
import {
  PRIORITIES, PRIORITY_LABELS, PRIORITY_ORDER, TASK_DOT, TASK_LABELS, TASK_STATUSES, type TaskStatus,
} from './status';
import { donoDaTarefa, porPrazo } from './types';
import type { ComentarioView, Pessoa, PhaseView, ProjectKind, Send, TaskComProjeto } from './types';
import { ChipSelect, DateChip, InlineText, MenuContexto, PessoaSelect, PriorityChip, Sigla, TimerChip, hoje } from './ui';
import { TaskDrawer } from './task-drawer';

// A lista tem uma ordem só, `porPrazo`: o que vence antes em cima, empate pela
// prioridade, sem prazo no fim. Arrastar continua servindo para trocar de bloco.
type Coluna = 'titulo' | 'quem' | 'inicio' | 'prazo' | 'prioridade' | 'tempo' | 'projeto';

/** A ordem dos blocos: o que está em jogo primeiro, feito no fim. */
const BLOCOS: TaskStatus[] = ['a_fazer', 'fazendo', 'revisao', 'backlog', 'feito'];

const BLOCO_TOM: Record<TaskStatus, string> = {
  a_fazer: 'bg-neutral-100 text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  backlog: 'bg-black/[0.03] text-text-muted',
  feito: 'bg-success/12 text-[#15803D]',
};

export function ListView({ tasks, comentarios, phasesDe, projectId, projectKind, pessoas, mostrarProjeto, onAbrirProjeto, send }: {
  tasks: TaskComProjeto[];
  comentarios: ComentarioView[];
  phasesDe: (projetoId: string) => PhaseView[];
  projectId: string;
  projectKind: ProjectKind;
  pessoas: Pessoa[];
  mostrarProjeto: boolean;
  /** Clique no nome da empresa: fecha a visão "Todos" e abre só aquele projeto. */
  onAbrirProjeto: (id: string) => void;
  send: Send;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [punho, setPunho] = useState<string | null>(null);
  const [criandoEm, setCriandoEm] = useState<TaskStatus | null>(null);
  // Bloco aberto ou fechado, só quando você mandou. Sem dito seu vale o padrão:
  // bloco vazio nasce fechado (uma faixa fina em vez de "nada aqui" ocupando a
  // tela) e Done também, que é histórico, não fila.
  const [dobra, setDobra] = useState<Partial<Record<TaskStatus, boolean>>>({});
  const [abertaId, setAberta] = useState<string | null>(null);
  // Seleção para agir em lote: concluir dez tarefas uma a uma é trabalho à toa.
  const [selecao, setSelecao] = useState<string[]>([]);
  // Botão direito numa linha: onde abrir o menu e sobre qual tarefa.
  const [menu, setMenu] = useState<{ task: TaskComProjeto; x: number; y: number } | null>(null);
  // Subtarefa nasce à vista, aninhada na mãe: quem lê a lista (ou o cliente no
  // link de acompanhamento) entende o que é cada tarefa sem abrir uma por uma.
  // Aqui ficam só as que você mandou recolher.
  const [recolhidas, setRecolhidas] = useState<string[]>([]);

  const subs = (id: string) => tasks.filter((t) => t.parentId === id);
  const aberta = tasks.find((t) => t.id === abertaId) ?? null;

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

  const ordenar = (lista: TaskComProjeto[]) => [...lista].sort(porPrazo);

  const raizes = tasks.filter((t) => !t.parentId);
  const marcada = (id: string) => selecao.includes(id);
  const alternar = (id: string) =>
    setSelecao((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  // Toda ação em lote encerra a seleção: a barra sumir é o sinal de que a ação
  // foi para o banco, e barra parada na tela vira clique sem querer.
  const editarLote = (campos: Record<string, string>) => {
    // Responsável vale para a tarefa e para as subtarefas dela: quem toca a mãe
    // toca as filhas, mesmo as que estiverem recolhidas na hora da seleção.
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
   * A posição dentro do bloco fica guardada e serve de desempate, mas quem manda
   * na ordem da lista é o prazo.
   */
  const soltar = (id: string, status: TaskStatus, before: string) => {
    setArrastando(null);
    setAlvo(null);
    if (!id || id === before) return;
    const lote = marcada(id) && selecao.length > 1;
    const ids = lote ? selecaoEmOrdem() : [id];
    if (ids.includes(before)) return;
    send(moveTask, { ids: ids.join(','), status, before });
    if (lote) setSelecao([]);
  };


  /**
   * Uma linha da tabela. A mesma para tarefa e subtarefa: a filha entra
   * recuada, com o pontinho do próprio status (o bloco é o da mãe) e sem punho
   * de arrastar — subtarefa se move mudando de mãe, não de bloco.
   */
  const linha = (t: TaskComProjeto, filha: boolean) => {
    const atrasada = !!t.dueDate && t.dueDate < hoje() && t.status !== 'feito';
    const filhas = filha ? [] : subs(t.id);
    const aberto = filhas.length > 0 && !recolhidas.includes(t.id);

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
          if (!filha && arrastando && arrastando !== t.id) { e.preventDefault(); setAlvo(t.id); }
        }}
        onDrop={(e) => {
          if (filha) return;
          e.preventDefault();
          e.stopPropagation();
          soltar(e.dataTransfer.getData('text/plain'), t.status, t.id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ task: t, x: e.clientX, y: e.clientY });
        }}
        className={`group border-b border-black/[0.04] transition-colors last:border-0 ${
          // O lote inteiro esmaece: dá para ver o que vai junto.
          arrastando && (arrastando === t.id || (marcada(arrastando) && marcada(t.id))) ? 'opacity-40' : ''
        } ${alvo === t.id && arrastando && arrastando !== t.id ? 'border-t-2 border-t-primary' : ''} ${
          marcada(t.id) ? 'bg-primary/[0.05]' : filha ? 'bg-neutral-50/40 hover:bg-neutral-50' : 'hover:bg-neutral-50/70'
        }`}
      >
        <td
          onMouseDown={() => { if (!filha) setPunho(t.id); }}
          onMouseUp={() => setPunho(null)}
          title={filha ? undefined : 'Arraste para reordenar ou mudar de bloco'}
          className={`py-2 pl-2 pr-0 text-text-muted/40 transition-colors ${
            filha ? '' : 'cursor-grab hover:text-text-muted active:cursor-grabbing'
          }`}
        >
          {!filha && <GripVertical className="h-3.5 w-3.5" />}
        </td>

        {/* Duas caixas na mesma linha confundiam qual era a de
            concluir. A de selecionar só aparece com o mouse em
            cima (ou quando já está marcada); em repouso fica a
            de concluir, que é a de todo dia. */}
        <td className="py-2 pl-1 pr-0">
          <input
            type="checkbox"
            checked={marcada(t.id)}
            onChange={() => alternar(t.id)}
            aria-label={`Selecionar ${t.title}`}
            className={`h-3.5 w-3.5 accent-primary transition-opacity focus:opacity-100 group-hover:opacity-100 ${
              marcada(t.id) ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </td>

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
          <div className={`flex min-w-0 items-center gap-2 ${filha ? 'pl-5' : ''}`}>
            {filha && (
              <span
                title={TASK_LABELS[t.status]}
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${TASK_DOT[t.status]}`}
              />
            )}
            <button
              onClick={() => setAberta(t.id)}
              className={`flex min-w-0 items-center text-left transition-colors hover:text-primary ${
                filha ? 'text-[12.5px]' : 'text-[13px]'
              } ${t.status === 'feito' ? 'text-text-muted line-through' : filha ? 'text-text-secondary' : 'text-text-primary'}`}
              title="Abrir tarefa"
            >
              <span className="min-w-0 truncate">{t.title}</span>
            </button>
            {filhas.length > 0 && (
              // O contador abre e fecha as subtarefas ali mesmo, sem tirar
              // ninguém da lista para ir ver o que tem dentro.
              <button
                onClick={() =>
                  setRecolhidas((r) => (r.includes(t.id) ? r.filter((x) => x !== t.id) : [...r, t.id]))
                }
                title={aberto ? 'Esconder as subtarefas' : 'Mostrar as subtarefas'}
                aria-expanded={aberto}
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-black/[0.06] py-0.5 pl-0.5 pr-1.5 text-[10px] tabular-nums text-text-muted transition-colors hover:bg-black/[0.1] hover:text-text-primary"
              >
                <ChevronRight className={`h-3 w-3 transition-transform ${aberto ? 'rotate-90' : ''}`} />
                {filhas.filter((s) => s.status === 'feito').length}/{filhas.length}
              </button>
            )}
          </div>
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
            <PessoaSelect
              value={t.assignee}
              pessoas={pessoas}
              onChange={(v) => send(updateTask, { id: t.id, assignee: v })}
            />
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

        {/* Apagar mora no botão direito da linha: é ação de
            exceção e não precisa de uma coluna inteira. */}
        <td className="px-2 py-2 text-right">
          <button
            onClick={(e) => setMenu({ task: t, x: e.clientX, y: e.clientY })}
            className="rounded p-1 text-text-muted/45 opacity-0 transition group-hover:opacity-100 hover:bg-black/[0.05] hover:text-text-primary"
            aria-label="Mais ações"
            title="Mais ações (ou clique com o botão direito)"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>
    );
  };

  /** A tarefa e, logo abaixo, as subtarefas dela quando não estão recolhidas. */
  const linhas = (t: TaskComProjeto) => {
    const filhas = recolhidas.includes(t.id) ? [] : ordenar(subs(t.id));
    return [linha(t, false), ...filhas.map((f) => linha(f, true))];
  };

  return (
    <div className="flex flex-col gap-3">
      {BLOCOS.map((status) => {
        const doBloco = ordenar(raizes.filter((t) => t.status === status));
        // Vazio (e Done) fecha sozinho; o que você abriu ou fechou na mão vence.
        const fechado = dobra[status] ?? (doBloco.length === 0 || status === 'feito');
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
                onClick={() => setDobra((d) => ({ ...d, [status]: !fechado }))}
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
                <button
                  onClick={() => { setCriandoEm(status); setDobra((d) => ({ ...d, [status]: false })); }}
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
                      {colunas.map((c) => (
                        <th
                          key={c.id}
                          className={`${c.cls} px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-text-muted`}
                        >
                          {c.label}
                        </th>
                      ))}
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {doBloco.flatMap((t) => linhas(t))}

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
          pessoas={pessoas}
          etapas={mostrarProjeto ? null : phasesDe(projectId)}
          editar={editarLote}
          apagar={apagarLote}
          limpar={() => setSelecao([])}
        />
      )}

      {menu && (
        <MenuContexto
          em={{ x: menu.x, y: menu.y }}
          fechar={() => setMenu(null)}
          itens={[
            { label: 'Abrir tarefa', onClick: () => setAberta(menu.task.id) },
            {
              label: menu.task.status === 'feito' ? 'Reabrir' : 'Marcar como concluída',
              onClick: () => send(updateTask, {
                id: menu.task.id,
                status: menu.task.status === 'feito' ? 'a_fazer' : 'feito',
              }),
            },
            {
              label: 'Apagar tarefa',
              perigo: true,
              onClick: () => {
                if (confirm(`Apagar a tarefa "${menu.task.title}"? Não tem como desfazer.`)) {
                  send(deleteTask, { id: menu.task.id });
                }
              },
            },
          ]}
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
          pessoas={pessoas}
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
function BarraSelecao({ quantas, pessoas, etapas, editar, apagar, limpar }: {
  quantas: number;
  pessoas: Pessoa[];
  etapas: PhaseView[] | null;
  editar: (campos: Record<string, string>) => void;
  apagar: () => void;
  limpar: () => void;
}) {

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

      {/* Mesma lista de nomes da tarefa: escolher passa o lote inteiro para essa pessoa. */}
      <ChipSelect
        value="—"
        placeholder="Responsável"
        titulo="Responsável das selecionadas"
        onChange={(v) => editar({ assignee: v })}
        options={[
          { value: '', label: 'sem responsável' },
          ...pessoas.map((p) => ({ value: p.nome, label: p.nome })),
        ]}
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
