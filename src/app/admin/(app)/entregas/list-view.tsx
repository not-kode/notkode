'use client';

// Lista de tarefas em grupos. O agrupamento é escolha sua: por STATUS (a fazer,
// fazendo, revisão, backlog, feito), que é como se lê um dia de trabalho, ou por
// SPRINT — as etapas do cronograma do projeto —, que é como se lê um ciclo de
// entrega. Tarefa solta, sem sprint, cai num grupo próprio no fim.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown, ArrowUp, Check, ChevronRight, ChevronsUpDown, GripVertical, MoreHorizontal, Plus, Trash2,
} from 'lucide-react';
import {
  apagarTag, atualizarTag, bulkTasks, createPhase, createTask, criarTagNaTarefa, deletePhase,
  deleteTask, moveTask, toggleTimer, updatePhase, updateTask,
} from './actions';
import {
  PHASE_LABELS, PHASE_STATUSES, PRIORITIES, PRIORITY_LABELS, PRIORITY_ORDER, TASK_DOT, TASK_LABELS,
  TASK_STATUSES, TASK_TOM, type PhaseStatus, type TaskStatus,
} from './status';
import { COLUNA_LABELS, donoDaTarefa, porPrazo } from './types';
import type {
  Agrupamento, Coluna, ComentarioView, Pessoa, PhaseView, ProjectKind, Send, TagView, TaskComProjeto,
} from './types';
import {
  ChipSelect, DateChip, InlineText, MenuContexto, PessoaSelect, PriorityChip, Sigla, TagsSelect,
  TimerChip, hoje,
} from './ui';
import { TaskDrawer } from './task-drawer';

// A lista tem uma ordem só dentro do grupo, `porPrazo`: o que vence antes em
// cima, empate pela prioridade, sem prazo no fim.

/** A ordem dos blocos de status: o que está em jogo primeiro, feito no fim. */
const BLOCOS: TaskStatus[] = ['a_fazer', 'fazendo', 'revisao', 'backlog', 'feito'];

const BLOCO_TOM: Record<TaskStatus, string> = {
  a_fazer: 'bg-neutral-100 text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  backlog: 'bg-black/[0.03] text-text-muted',
  feito: 'bg-success/12 text-[#15803D]',
};

/**
 * Um grupo da lista. `status` preenchido: arrastar para cá muda o status da
 * tarefa. `phaseId` preenchido (ou nulo explícito, no grupo "Sem sprint"):
 * arrastar para cá muda de sprint.
 */
type Grupo = {
  chave: string;
  titulo: string;
  /** A sprint deste grupo, quando ele é uma: dá para renomear e datar no lugar. */
  sprint: PhaseView | null;
  tom: string;
  dot: string | null;
  status: TaskStatus | null;
  phaseId: string | null;
  /** Grupo de sprint aceita arrastar mesmo com phaseId nulo ("Sem sprint"). */
  aceitaSprint: boolean;
  fechaSozinho: boolean;
  tarefas: TaskComProjeto[];
};

export function ListView({
  tasks, comentarios, phasesDe, tagsDe, projectId, projectKind, pessoas, mostrarProjeto,
  agrupar, colunas: visiveis, onAbrirProjeto, send,
}: {
  tasks: TaskComProjeto[];
  comentarios: ComentarioView[];
  phasesDe: (projetoId: string) => PhaseView[];
  tagsDe: (projetoId: string) => TagView[];
  projectId: string;
  projectKind: ProjectKind;
  pessoas: Pessoa[];
  mostrarProjeto: boolean;
  /** Por status (o jeito de todo dia) ou por sprint (o ciclo de entrega). */
  agrupar: Agrupamento;
  /** As colunas ligadas neste projeto; o que está fora daqui não aparece. */
  colunas: Coluna[];
  /** Clique no nome da empresa: fecha a visão "Todos" e abre só aquele projeto. */
  onAbrirProjeto: (id: string) => void;
  send: Send;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [punho, setPunho] = useState<string | null>(null);
  const [criandoEm, setCriandoEm] = useState<string | null>(null);
  const [criandoSprint, setCriandoSprint] = useState(false);
  // Grupo aberto ou fechado, só quando você mandou. Sem dito seu vale o padrão:
  // grupo vazio nasce fechado (uma faixa fina em vez de "nada aqui" ocupando a
  // tela), e Done e sprint concluída também, que são histórico, não fila.
  const [dobra, setDobra] = useState<Record<string, boolean>>({});
  const [abertaId, setAberta] = useState<string | null>(null);
  // Seleção para agir em lote: concluir dez tarefas uma a uma é trabalho à toa.
  const [selecao, setSelecao] = useState<string[]>([]);
  // Botão direito numa linha: onde abrir o menu e sobre qual tarefa.
  const [menu, setMenu] = useState<{ task: TaskComProjeto; x: number; y: number } | null>(null);
  // Subtarefa nasce à vista, aninhada na mãe: quem lê a lista entende o que é
  // cada tarefa sem abrir uma por uma. Aqui ficam só as que você mandou recolher.
  const [recolhidas, setRecolhidas] = useState<string[]>([]);
  /**
   * Ordem da lista. Sem escolha sua, vale a de sempre: vence antes em cima,
   * empate pela prioridade. Clicar no nome da coluna passa a ordenar por ela e
   * o segundo clique inverte — é o gesto de planilha, e cada tela pode ficar
   * ordenada de um jeito sem virar configuração do projeto.
   */
  const [ordem, setOrdem] = useState<{ col: Coluna | 'titulo'; desc: boolean } | null>(null);
  /** Última linha marcada: serve de âncora para o Shift+clique pegar o intervalo. */
  const [ancora, setAncora] = useState<string | null>(null);

  const subs = (id: string) => tasks.filter((t) => t.parentId === id);
  const aberta = tasks.find((t) => t.id === abertaId) ?? null;

  // Sprint é o cronograma de UM projeto: na visão "Todos", cada tarefa pertence
  // a um cronograma diferente e não existe grupo comum. Ali vale sempre status.
  const porSprint = agrupar === 'sprint' && !mostrarProjeto;

  // Esc larga a seleção: é a saída sem risco de esbarrar num botão da barra.
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelecao([]); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  // Com vários projetos juntos, a coluna que identifica a tarefa é a EMPRESA, não
  // o responsável (que hoje é sempre a mesma pessoa). O responsável continua
  // editável dentro da tarefa, na gaveta. Num projeto só, vale o contrário.
  const ver = (c: Coluna) => visiveis.includes(c);
  const colunas: { id: string; label: string; cls: string; ordenavel?: Coluna | 'titulo' }[] = [
    { id: 'titulo', label: 'Tarefa', cls: 'min-w-[14rem]', ordenavel: 'titulo' },
    ...(ver('tags') ? [{ id: 'tags', label: 'Tags', cls: 'w-40' }] : []),
    // A empresa identifica a linha na visão geral e não é opcional ali; num
    // projeto só, o lugar dessa coluna é do responsável.
    ...(mostrarProjeto
      ? [{ id: 'projeto', label: 'Empresa', cls: 'w-44' }]
      : ver('quem') ? [{ id: 'quem', label: COLUNA_LABELS.quem, cls: 'w-16', ordenavel: 'quem' as const }] : []),
    ...(ver('inicio') ? [{ id: 'inicio', label: COLUNA_LABELS.inicio, cls: 'w-28', ordenavel: 'inicio' as const }] : []),
    ...(ver('prazo') ? [{ id: 'prazo', label: COLUNA_LABELS.prazo, cls: 'w-28', ordenavel: 'prazo' as const }] : []),
    ...(ver('prioridade') ? [{ id: 'prioridade', label: COLUNA_LABELS.prioridade, cls: 'w-28', ordenavel: 'prioridade' as const }] : []),
    // Agrupada por sprint, a lista mistura estados no mesmo grupo: aí o status
    // precisa de coluna. Agrupada por status, o grupo já é a resposta.
    ...(porSprint ? [{ id: 'status', label: 'Status', cls: 'w-32' }] : []),
    ...(ver('tempo') ? [{ id: 'tempo', label: COLUNA_LABELS.tempo, cls: 'w-32', ordenavel: 'tempo' as const }] : []),
  ];
  const colspan = colunas.length + 4;
  /** Com alguma tarefa marcada, a lista entra em modo seleção e mostra as caixas. */
  const selecionando = selecao.length > 0;

  const valorDe = (t: TaskComProjeto, col: Coluna | 'titulo'): string | number => {
    switch (col) {
      case 'titulo': return t.title.toLowerCase();
      case 'quem': return (t.assignee ?? '').toLowerCase() || 'zzz';
      case 'inicio': return t.startDate ?? '9999-99-99';
      case 'prazo': return t.dueDate ?? '9999-99-99';
      case 'prioridade': return PRIORITY_ORDER[t.priority];
      case 'tempo': return t.tempoSegundos;
      case 'tags': return t.tagIds.length;
      default: return 0;
    }
  };

  const ordenar = (lista: TaskComProjeto[]) => {
    if (!ordem) return [...lista].sort(porPrazo);
    return [...lista].sort((a, b) => {
      const x = valorDe(a, ordem.col);
      const y = valorDe(b, ordem.col);
      const dif = typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y), 'pt-BR');
      return ordem.desc ? -dif : dif;
    });
  };

  /** Clicou no nome da coluna: ordena por ela, inverte, e no terceiro volta ao padrão. */
  const alternarOrdem = (col: Coluna | 'titulo') =>
    setOrdem((o) => (o?.col !== col ? { col, desc: false } : o.desc ? null : { col, desc: true }));
  /**
   * Dentro de uma sprint convivem tarefas em qualquer estado, então o que já foi
   * entregue desce para o fim: senão o começo do bloco é um paredão de riscado e
   * o que falta fazer fica escondido no meio.
   */
  const ordenarNaSprint = (lista: TaskComProjeto[]) =>
    ordenar(lista).sort((a, b) => Number(a.status === 'feito') - Number(b.status === 'feito'));

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

  /** Os grupos da lista, na ordem em que aparecem na tela. */
  const grupos: Grupo[] = porSprint
    ? [
      ...phasesDe(projectId).map((p): Grupo => ({
        chave: p.id,
        titulo: p.name,
        sprint: p,
        tom: p.status === 'concluida'
          ? 'bg-success/12 text-[#15803D]'
          : p.status === 'em_andamento'
            ? 'bg-primary/10 text-primary'
            : 'bg-neutral-100 text-text-secondary',
        dot: null,
        status: null,
        phaseId: p.id,
        aceitaSprint: true,
        fechaSozinho: p.status === 'concluida',
        tarefas: ordenarNaSprint(raizes.filter((t) => t.phaseId === p.id)),
      })),
      {
        chave: 'sem-sprint',
        titulo: 'Sem sprint',
        sprint: null,
        tom: 'bg-black/[0.03] text-text-muted',
        dot: null,
        status: null,
        phaseId: null,
        aceitaSprint: true,
        fechaSozinho: false,
        tarefas: ordenarNaSprint(raizes.filter((t) => !t.phaseId)),
      },
    ]
    : BLOCOS.map((s): Grupo => ({
      chave: s,
      titulo: TASK_LABELS[s],
      sprint: null,
      tom: BLOCO_TOM[s],
      dot: TASK_DOT[s],
      status: s,
      phaseId: null,
      aceitaSprint: false,
      fechaSozinho: s === 'feito',
      tarefas: ordenar(raizes.filter((t) => t.status === s)),
    }));

  /** As selecionadas na ordem em que aparecem na tela, grupo a grupo. */
  const selecaoEmOrdem = () =>
    grupos.flatMap((g) => g.tarefas).map((t) => t.id).filter((id) => selecao.includes(id));

  /**
   * Soltou num grupo. Agrupada por status, as tarefas vão para o status do grupo
   * de destino, na posição em que foram soltas (`before` vazio = fim do grupo).
   * Agrupada por sprint, o que muda é a sprint — o status fica como estava, que é
   * o certo: mover trabalho de ciclo não é dizer que ele andou.
   *
   * Arrastar uma linha que está marcada leva o lote inteiro junto: foi para isso
   * que ele foi selecionado.
   */
  const soltar = (id: string, grupo: Grupo, before: string) => {
    setArrastando(null);
    setAlvo(null);
    if (!id || id === before) return;
    const lote = marcada(id) && selecao.length > 1;
    const ids = lote ? selecaoEmOrdem() : [id];
    if (ids.includes(before)) return;

    if (grupo.aceitaSprint) {
      send(bulkTasks, { acao: 'editar', ids: ids.join(','), phase_id: grupo.phaseId ?? '' });
    } else if (grupo.status) {
      send(moveTask, { ids: ids.join(','), status: grupo.status, before });
    }
    if (lote) setSelecao([]);
  };

  /**
   * Uma linha da tabela. A mesma para tarefa e subtarefa: a filha entra
   * recuada, com o pontinho do próprio status (o grupo é o da mãe) e sem punho
   * de arrastar — subtarefa se move mudando de mãe, não de grupo.
   */
  const linha = (t: TaskComProjeto, grupo: Grupo, filha: boolean) => {
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
          soltar(e.dataTransfer.getData('text/plain'), grupo, t.id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ task: t, x: e.clientX, y: e.clientY });
        }}
        onClick={(e) => {
          // ⌘/Ctrl marca uma; Shift pega o intervalo desde a última marcada.
          // Clique simples não seleciona: senão você abriria a gaveta e marcaria
          // a linha ao mesmo tempo.
          if (e.metaKey || e.ctrlKey) {
            alternar(t.id);
            setAncora(t.id);
          } else if (e.shiftKey && ancora) {
            const ids = grupo.tarefas.map((x) => x.id);
            const de = ids.indexOf(ancora);
            const ate = ids.indexOf(t.id);
            if (de >= 0 && ate >= 0) {
              const faixa = ids.slice(Math.min(de, ate), Math.max(de, ate) + 1);
              setSelecao((sel) => [...new Set([...sel, ...faixa])]);
            }
          }
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
          title={filha ? undefined : 'Arraste para reordenar ou mudar de grupo'}
          className={`py-2 pl-2 pr-0 text-text-muted/40 transition-colors ${
            filha ? '' : 'cursor-grab hover:text-text-muted active:cursor-grabbing'
          }`}
        >
          {!filha && <GripVertical className="h-3.5 w-3.5" />}
        </td>

        {/* Duas caixas na mesma linha (uma de marcar, outra de concluir) era a
            maior confusão da tela. Em repouso existe UMA: a de concluir. A de
            selecionar só aparece quando o modo seleção já está ligado — pelo
            checkbox do grupo, ou por ⌘/Ctrl+clique numa linha. */}
        {selecionando && (
          <td className="py-2 pl-1 pr-0">
            <input
              type="checkbox"
              checked={marcada(t.id)}
              onChange={() => alternar(t.id)}
              aria-label={`Selecionar ${t.title}`}
              className="h-3.5 w-3.5 accent-primary"
            />
          </td>
        )}

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

        {ver('tags') && (
          <td className="px-3 py-2">
            <TagsSelect
              value={t.tagIds}
              tags={tagsDe(t.projetoId)}
              onChange={(ids) => send(updateTask, { id: t.id, tag_ids: ids.join(',') })}
              onCriar={(nome, cor) => send(criarTagNaTarefa, {
                engagement_id: t.projetoId, task_id: t.id, name: nome, color: cor,
              })}
              onCor={(id, cor) => send(atualizarTag, { id, color: cor })}
              onApagar={(tag) => {
                if (confirm(`Apagar a tag "${tag.nome}"? Ela sai das tarefas que a usam.`)) {
                  send(apagarTag, { id: tag.id, engagement_id: t.projetoId });
                }
              }}
              compacto={filha}
            />
          </td>
        )}

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
        ) : ver('quem') ? (
          <td className="px-3 py-2">
            {/* Só o avatar: o nome por extenso repetido em cinquenta linhas era
                a coluna mais larga da tabela para dizer sempre a mesma coisa.
                O nome aparece ao passar o mouse. */}
            <PessoaSelect
              value={t.assignee}
              pessoas={pessoas}
              compacto
              onChange={(v) => send(updateTask, { id: t.id, assignee: v })}
            />
          </td>
        ) : null}

        {ver('inicio') && (
          <td className="px-3 py-2">
            <DateChip value={t.startDate} onSave={(v) => send(updateTask, { id: t.id, start_date: v })} placeholder="começa" />
          </td>
        )}
        {ver('prazo') && (
          <td className="px-3 py-2">
            <DateChip value={t.dueDate} onSave={(v) => send(updateTask, { id: t.id, due_date: v })} atrasada={atrasada} placeholder="termina" />
          </td>
        )}
        {ver('prioridade') && (
          <td className="px-3 py-2">
            <PriorityChip value={t.priority} onChange={(v) => send(updateTask, { id: t.id, priority: v })} />
          </td>
        )}

        {porSprint && (
          <td className="px-3 py-2">
            <ChipSelect
              value={t.status}
              tone={TASK_TOM[t.status]}
              titulo="Status da tarefa"
              onChange={(v) => send(updateTask, { id: t.id, status: v })}
              options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_LABELS[s], dot: TASK_DOT[s] }))}
            />
          </td>
        )}

        {ver('tempo') && (
          <td className="px-3 py-2">
            <TimerChip
              segundos={t.tempoSegundos}
              rodandoDesde={t.timerDesde}
              onToggle={() => send(toggleTimer, { id: t.id })}
              desabilitado={t.status === 'feito'}
            />
          </td>
        )}

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
  const linhas = (t: TaskComProjeto, grupo: Grupo) => {
    const filhas = recolhidas.includes(t.id) ? [] : ordenar(subs(t.id));
    return [linha(t, grupo, false), ...filhas.map((f) => linha(f, grupo, true))];
  };

  return (
    <div className="flex flex-col gap-3">
      {grupos.map((grupo) => {
        const doGrupo = grupo.tarefas;
        // Vazio (e Done, e sprint concluída) fecha sozinho; o que você abriu ou
        // fechou na mão vence.
        const fechado = dobra[grupo.chave] ?? (doGrupo.length === 0 || grupo.fechaSozinho);
        const grupoTodo = doGrupo.length > 0 && doGrupo.every((t) => marcada(t.id));
        const prontas = doGrupo.filter((t) => t.status === 'feito').length;

        return (
          <section
            key={grupo.chave}
            onDragOver={(e) => { if (arrastando) { e.preventDefault(); setAlvo(grupo.chave); } }}
            onDragLeave={() => setAlvo((a) => (a === grupo.chave ? null : a))}
            onDrop={(e) => {
              e.preventDefault();
              soltar(e.dataTransfer.getData('text/plain'), grupo, '');
            }}
            className={`overflow-hidden rounded-md border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-colors ${
              arrastando && alvo === grupo.chave ? 'border-primary/50' : 'border-black/[0.07]'
            }`}
          >
            <header className="flex items-center gap-2 border-b border-black/[0.06] bg-neutral-50 px-3 py-2">
              <input
                type="checkbox"
                checked={grupoTodo}
                disabled={doGrupo.length === 0}
                onChange={() =>
                  setSelecao((s) => {
                    const ids = doGrupo.map((t) => t.id);
                    return grupoTodo ? s.filter((x) => !ids.includes(x)) : [...new Set([...s, ...ids])];
                  })
                }
                title="Selecionar todas deste grupo (⌘+clique marca uma a uma)"
                aria-label="Selecionar todas deste grupo"
                className="h-3.5 w-3.5 accent-primary disabled:opacity-30"
              />
              <button
                onClick={() => setDobra((d) => ({ ...d, [grupo.chave]: !fechado }))}
                aria-label={fechado ? 'Abrir grupo' : 'Fechar grupo'}
                className="rounded p-0.5 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
              >
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${fechado ? '' : 'rotate-90'}`} />
              </button>

              {grupo.sprint ? (
                // A sprint se edita onde ela aparece: nome, começo, fim e em que
                // pé está. Ir até a aba Cronograma para trocar uma data era o
                // tipo de caminho que faz ninguém manter o cronograma em dia.
                <>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${grupo.tom}`}>
                    <InlineText
                      value={grupo.sprint.name}
                      onSave={(v) => send(updatePhase, { id: grupo.sprint!.id, name: v })}
                      title="Renomear a sprint"
                      className="text-[11px] font-semibold uppercase tracking-wide"
                    />
                  </span>
                  <DateChip
                    value={grupo.sprint.startDate}
                    onSave={(v) => send(updatePhase, { id: grupo.sprint!.id, start_date: v })}
                    placeholder="começo"
                  />
                  <DateChip
                    value={grupo.sprint.endDate}
                    onSave={(v) => send(updatePhase, { id: grupo.sprint!.id, end_date: v })}
                    placeholder="fim"
                  />
                  <ChipSelect
                    value={grupo.sprint.status}
                    titulo="Em que pé está a sprint"
                    onChange={(v) => send(updatePhase, { id: grupo.sprint!.id, status: v })}
                    options={PHASE_STATUSES.map((st) => ({ value: st, label: PHASE_LABELS[st as PhaseStatus] }))}
                  />
                </>
              ) : (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${grupo.tom}`}>
                  {grupo.dot && <span className={`h-1.5 w-1.5 rounded-full ${grupo.dot}`} />}
                  {grupo.titulo}
                </span>
              )}
              <span className="text-[11px] tabular-nums text-text-muted">
                {porSprint && doGrupo.length > 0 ? `${prontas}/${doGrupo.length}` : doGrupo.length}
              </span>

              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={() => { setCriandoEm(grupo.chave); setDobra((d) => ({ ...d, [grupo.chave]: false })); }}
                  className="inline-flex items-center gap-1 text-[12px] text-text-muted transition-colors hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tarefa
                </button>

                {grupo.sprint && (
                  <button
                    onClick={() => {
                      if (confirm(`Apagar a sprint "${grupo.sprint!.name}"? As ${doGrupo.length} tarefas dela não somem: voltam para "Sem sprint".`)) {
                        send(deletePhase, { id: grupo.sprint!.id });
                      }
                    }}
                    title="Apagar a sprint (as tarefas ficam)"
                    aria-label="Apagar a sprint"
                    className="rounded p-1 text-text-muted/50 transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </header>

            {!fechado && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.05]">
                      <th className="w-6" />
                      {selecionando && <th className="w-8" />}
                      <th className="w-9" />
                      {colunas.map((c) => {
                        const ativa = !!c.ordenavel && ordem?.col === c.ordenavel;
                        return (
                          <th
                            key={c.id}
                            className={`${c.cls} px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-text-muted`}
                          >
                            {c.ordenavel ? (
                              <button
                                onClick={() => alternarOrdem(c.ordenavel!)}
                                title={
                                  ativa && ordem?.desc
                                    ? 'Voltar à ordem normal (prazo mais perto primeiro)'
                                    : ativa
                                      ? `Inverter: ${c.label.toLowerCase()} do maior para o menor`
                                      : `Ordenar por ${c.label.toLowerCase()}`
                                }
                                className={`group/ord inline-flex items-center gap-1 uppercase transition-colors hover:text-text-primary ${
                                  ativa ? 'text-text-primary' : ''
                                }`}
                              >
                                {c.label}
                                {ativa
                                  ? (ordem?.desc
                                    ? <ArrowDown className="h-3 w-3" />
                                    : <ArrowUp className="h-3 w-3" />)
                                  : <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover/ord:opacity-60" />}
                              </button>
                            ) : c.label}
                          </th>
                        );
                      })}
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {doGrupo.flatMap((t) => linhas(t, grupo))}

                    {criandoEm === grupo.chave && (
                      <tr>
                        <td colSpan={colspan} className="px-3 py-2">
                          <NovaLinha
                            projectId={projectId}
                            projectKind={projectKind}
                            // A tarefa nasce dentro do grupo em que foi criada:
                            // no bloco de status, com aquele status; na sprint,
                            // presa naquela sprint.
                            status={grupo.status ?? 'a_fazer'}
                            phaseId={grupo.aceitaSprint ? grupo.phaseId : null}
                            send={send}
                            onFim={() => setCriandoEm(null)}
                          />
                        </td>
                      </tr>
                    )}

                    {doGrupo.length === 0 && criandoEm !== grupo.chave && (
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

      {/* Criar sprint mora no fim da lista de sprints: é o gesto de "abrir o
          próximo ciclo", e não faz sentido na lista por status. */}
      {porSprint && (
        <div>
          {criandoSprint ? (
            <NovaSprint projectId={projectId} send={send} onFim={() => setCriandoSprint(false)} />
          ) : (
            <button
              onClick={() => setCriandoSprint(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-black/[0.12] px-3 py-1.5 text-[12px] text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova sprint
            </button>
          )}
        </div>
      )}

      {selecao.length > 0 && (
        <BarraSelecao
          quantas={selecao.length}
          pessoas={pessoas}
          etapas={mostrarProjeto ? null : phasesDe(projectId)}
          tags={mostrarProjeto ? [] : tagsDe(projectId)}
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
          tags={tagsDe(aberta.projetoId)}
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
 * A sprint e as tags só entram quando a lista é de um projeto só: em "Todos",
 * cada tarefa pertence a um cronograma e a um vocabulário diferentes.
 */
function BarraSelecao({ quantas, pessoas, etapas, tags, editar, apagar, limpar }: {
  quantas: number;
  pessoas: Pessoa[];
  etapas: PhaseView[] | null;
  tags: TagView[];
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
        titulo="Mover as selecionadas para outro status"
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
          // vez de fingir que as selecionadas já estão numa sprint.
          value="—"
          placeholder="Sprint"
          titulo="Sprint do cronograma"
          onChange={(v) => editar({ phase_id: v })}
          options={[{ value: '', label: 'sem sprint' }, ...etapas.map((e) => ({ value: e.id, label: e.name }))]}
        />
      )}

      {tags.length > 0 && (
        <ChipSelect
          value="—"
          placeholder="Tags"
          // Troca as tags do lote pela escolhida: em massa, somar tag a tag daria
          // um resultado diferente em cada tarefa, e ninguém confere depois.
          titulo="Trocar as tags das selecionadas por esta"
          onChange={(v) => editar({ tag_ids: v })}
          options={[{ value: '', label: 'sem tag' }, ...tags.map((t) => ({ value: t.id, label: t.nome }))]}
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

function NovaLinha({ projectId, projectKind, status, phaseId, send, onFim }: {
  projectId: string;
  projectKind: ProjectKind;
  status: TaskStatus;
  phaseId: string | null;
  send: Send;
  onFim: () => void;
}) {
  const [titulo, setTitulo] = useState('');

  const criar = (continuar: boolean) => {
    const limpo = titulo.trim();
    if (limpo) {
      send(createTask, {
        ...donoDaTarefa(projectId, projectKind),
        title: limpo,
        status,
        ...(phaseId ? { phase_id: phaseId } : {}),
      });
    }
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

/** Abre uma sprint: nome e o período dela, que é o que o cliente lê no link. */
function NovaSprint({ projectId, send, onFim }: { projectId: string; send: Send; onFim: () => void }) {
  const [nome, setNome] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  const criar = () => {
    const limpo = nome.trim();
    if (!limpo) { onFim(); return; }
    send(createPhase, { engagement_id: projectId, name: limpo, start_date: inicio, end_date: fim });
    onFim();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-black/[0.08] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <input
        autoFocus
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') criar(); if (e.key === 'Escape') onFim(); }}
        placeholder="Nome da sprint (ex.: Sprint 1, Agosto, Fase de dados)"
        className="min-w-[16rem] flex-1 text-[13px] text-text-primary outline-none placeholder:text-text-muted"
      />
      <input
        type="date"
        value={inicio}
        onChange={(e) => setInicio(e.target.value)}
        title="Começa em"
        className="rounded-sm border border-black/[0.1] px-2 py-1 text-[12px] text-text-secondary outline-none focus:border-primary/40"
      />
      <input
        type="date"
        value={fim}
        onChange={(e) => setFim(e.target.value)}
        title="Termina em"
        className="rounded-sm border border-black/[0.1] px-2 py-1 text-[12px] text-text-secondary outline-none focus:border-primary/40"
      />
      <button
        onClick={criar}
        className="rounded-full bg-primary px-3 py-1 text-[12px] font-semibold text-white transition hover:opacity-90"
      >
        Criar
      </button>
      <button onClick={onFim} className="px-2 py-1 text-[12px] text-text-muted transition hover:text-text-primary">
        Cancelar
      </button>
    </div>
  );
}
