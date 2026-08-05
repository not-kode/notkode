'use client';

// Entregas: as tarefas de cada contrato em Kanban ou Lista, e o cronograma em
// Gantt. Duas faces na mesma tela — aqui você vê tudo; o cliente, pelo link, vê
// só o cronograma com o que estiver marcado como visível.
//
// O topo não tem mais uma segunda lista de tarefas: o recorte de tempo (hoje,
// amanhã, semana, mês) virou filtro da própria lista de baixo, e o que ficou em
// cima são os números do trabalho e o tempo médio por tarefa.

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPhase, updatePhase, deletePhase, movePhase,
  setProjectArchived, generateClientToken, revokeClientToken,
} from './actions';
import {
  Archive, ArchiveRestore, ChevronDown, ChevronUp, Eye, EyeOff, LayoutGrid,
  Link2, List, PanelLeftClose, PanelLeftOpen, Plus, Trash2,
} from 'lucide-react';
import { PHASE_LABELS, PHASE_STATUSES, type PhaseStatus } from './status';
import type { ComentarioView, NotaView, PhaseView, ProjectView, Send, TaskComProjeto, TaskView } from './types';
import { KanbanView } from './kanban-view';
import { ListView } from './list-view';
import { Gantt } from './gantt';
import { NotasView } from './notas-view';
import { ChipSelect, DateChip, InlineText, fmtDuracao, hoje, inputCls, somaDias } from './ui';

export type { PhaseView, ProjectView, TaskView } from './types';

const PREF_VISAO = 'notkode.entregas.visao';
const PREF_PROJETO = 'notkode.entregas.projeto';
const PREF_LISTA_PROJETOS = 'notkode.entregas.lista-projetos';

const tabCls = (ativo: boolean) =>
  `inline-flex max-w-[12rem] items-center gap-1.5 truncate rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
    ativo ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]' : 'text-text-muted hover:text-text-primary'
  }`;

const PHASE_STATUS_DOT: Record<PhaseStatus, string> = {
  pendente: 'bg-neutral-300',
  em_andamento: 'bg-primary',
  concluida: 'bg-success',
  pausada: 'bg-warning',
};

const PHASE_STATUS_TOM: Record<PhaseStatus, string> = {
  pendente: 'bg-black/[0.04] text-text-secondary',
  em_andamento: 'bg-primary/10 text-primary',
  concluida: 'bg-success/12 text-[#15803D]',
  pausada: 'bg-warning/15 text-[#B45309]',
};

const PERIODOS = [
  { id: 'tudo',      label: 'Tudo' },
  { id: 'atrasadas', label: 'Atrasadas' },
  { id: 'hoje',      label: 'Hoje' },
  { id: 'amanha',    label: 'Amanhã' },
  { id: 'semana',    label: 'Semana' },
  { id: 'mes',       label: 'Mês' },
  { id: 'sem_prazo', label: 'Sem prazo' },
] as const;
type Periodo = (typeof PERIODOS)[number]['id'];

/** Tasks, cronograma e a base de notas do cliente. */
type Aba = 'tasks' | 'cronograma' | 'notas';

export function EntregasView({ projects, comentarios, notas }: {
  projects: ProjectView[];
  comentarios: ComentarioView[];
  notas: NotaView[];
}) {
  const ativos = useMemo(() => projects.filter((p) => !p.archivedAt), [projects]);
  const arquivados = useMemo(() => projects.filter((p) => p.archivedAt), [projects]);

  const [abertoId, setAbertoId] = useState<string | null>(ativos[0]?.id ?? projects[0]?.id ?? null);
  const [aba, setAba] = useState<Aba>('tasks');
  const [visao, setVisao] = useState<'kanban' | 'lista'>('lista');
  const [escopo, setEscopo] = useState<'projeto' | 'todos'>('projeto');
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const [verArquivados, setVerArquivados] = useState(false);
  // A lista de projetos come 15rem da largura; em "Todos" a tabela é que precisa
  // do espaço. Recolher fica guardado, como as outras preferências de trabalho.
  const [listaProjetos, setListaProjetos] = useState(true);
  const [pending, start] = useTransition();

  const router = useRouter();

  const send: Send = (action, campos) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(campos)) fd.set(k, v);
    // O refresh depois da ação é cinto de segurança: a revalidação do servidor já
    // deveria trazer o dado novo, e sem ele uma falha de cache aparece como
    // "sumiu/não apareceu" na tela.
    start(async () => { await action(fd); router.refresh(); });
  };

  // Tarefa criada em outro lugar (o MCP no terminal, outra aba, o celular) tem
  // que cair aqui sozinha. Enquanto a aba está à vista, a tela se atualiza de tempos em
  // tempos; escondida, para de buscar, para não ficar consultando à toa.
  useEffect(() => {
    const atualizar = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const timer = setInterval(atualizar, 20_000);
    document.addEventListener('visibilitychange', atualizar);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', atualizar);
    };
  }, [router]);

  const aberto = projects.find((p) => p.id === abertoId) ?? ativos[0] ?? null;

  // Preferências de trabalho, não do dado: ficam no navegador. O projeto aberto
  // entra aqui porque recarregar a página não pode jogar você em outro cliente.
  useEffect(() => {
    const salvo = localStorage.getItem(PREF_VISAO);
    if (salvo === 'kanban' || salvo === 'lista') setVisao(salvo);

    const projeto = localStorage.getItem(PREF_PROJETO);
    if (projeto && projects.some((p) => p.id === projeto)) setAbertoId(projeto);

    if (localStorage.getItem(PREF_LISTA_PROJETOS) === 'fechada') setListaProjetos(false);
    // Só na montagem: depois disso quem manda é o clique.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirProjeto = (id: string) => {
    setAbertoId(id);
    localStorage.setItem(PREF_PROJETO, id);
  };
  const alternarLista = () => {
    setListaProjetos((v) => {
      localStorage.setItem(PREF_LISTA_PROJETOS, v ? 'fechada' : 'aberta');
      return !v;
    });
  };
  // Clique no nome da empresa dentro da lista/quadro: sai de "Todos" e mergulha
  // naquele projeto, que é o que se quer quando um nome chama a atenção.
  const abrirSoDoProjeto = (id: string) => {
    abrirProjeto(id);
    setEscopo('projeto');
  };
  const trocarVisao = (v: 'kanban' | 'lista') => {
    setVisao(v);
    localStorage.setItem(PREF_VISAO, v);
  };

  // Escopo "todos" ignora arquivados: arquivar existe justamente para tirar da frente.
  const doEscopo = useMemo<TaskComProjeto[]>(() => {
    const comProjeto = (p: ProjectView): TaskComProjeto[] =>
      p.tasks.map((t) => ({
        ...t, projetoNome: p.orgName ?? p.title ?? 'Sem nome', projetoId: p.id, projetoKind: p.kind,
      }));
    return escopo === 'todos' ? ativos.flatMap(comProjeto) : aberto ? comProjeto(aberto) : [];
  }, [escopo, ativos, aberto]);

  const filtradas = useMemo(() => recortar(doEscopo, periodo), [doEscopo, periodo]);

  const fasesPorProjeto = useMemo(() => new Map(projects.map((p) => [p.id, p.phases])), [projects]);
  const phasesDe = (id: string) => fasesPorProjeto.get(id) ?? [];

  // Cliente de um lado, casa do outro: são dois modos de trabalho diferentes.
  // Fechamento vem antes dos dois: é venda ganha esperando virar projeto, e o
  // que está lá dentro (contrato, briefing, primeira parcela) não pode esperar.
  const grupos = useMemo(
    () => [
      { titulo: 'Fechamentos', itens: ativos.filter((p) => p.kind === 'negocio') },
      { titulo: 'Clientes', itens: ativos.filter((p) => p.kind === 'contrato' && !p.isInternal) },
      { titulo: 'Casa', itens: ativos.filter((p) => p.kind === 'contrato' && p.isInternal) },
    ].filter((g) => g.itens.length > 0),
    [ativos],
  );

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="mt-6 rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
          Nenhum contrato ainda. Assim que um negócio for ganho, o projeto aparece aqui para você montar o cronograma.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1"><span className="status-dot" />Projetos e cronograma</p>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        </div>
      </header>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Lista de projetos em vez de dropdown: com vinte contratos, um campo
            fechado esconde justamente o que precisa estar à vista. Recolhida,
            devolve a largura inteira para a tabela de tarefas. */}
        {!listaProjetos ? (
          <button
            onClick={alternarLista}
            title="Mostrar a lista de projetos"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-black/[0.08] bg-white px-2 py-1.5 text-[12px] font-medium text-text-muted shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-colors hover:border-primary/40 hover:text-primary"
          >
            <PanelLeftOpen className="h-4 w-4" />
            <span className="lg:sr-only">Projetos</span>
          </button>
        ) : (
          <aside className="lg:w-60 lg:shrink-0">
            <div className="mb-2 flex items-center justify-between gap-2 px-2">
              <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">Projetos</p>
              <button
                onClick={alternarLista}
                title="Recolher a lista de projetos"
                aria-label="Recolher a lista de projetos"
                className="rounded p-1 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {grupos.map((g) => (
                <div key={g.titulo}>
                  <p className="mb-1.5 px-2 font-label text-[10px] uppercase tracking-wider text-text-muted">
                    {g.titulo}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {g.itens.map((p) => (
                      <li key={p.id}>
                        <ItemProjeto projeto={p} ativo={p.id === aberto?.id} onClick={() => abrirProjeto(p.id)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {arquivados.length > 0 && (
                <div>
                  <button
                    onClick={() => setVerArquivados((v) => !v)}
                    className="flex w-full items-center gap-1.5 px-2 py-1 font-label text-[10px] uppercase tracking-wider text-text-muted transition-colors hover:text-text-secondary"
                  >
                    <Archive className="h-3 w-3" />
                    Arquivados ({arquivados.length})
                    {verArquivados ? <ChevronUp className="ml-auto h-3 w-3" /> : <ChevronDown className="ml-auto h-3 w-3" />}
                  </button>
                  {verArquivados && (
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {arquivados.map((p) => (
                        <li key={p.id}>
                          <ItemProjeto projeto={p} ativo={p.id === aberto?.id} onClick={() => abrirProjeto(p.id)} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </nav>
          </aside>
        )}

        <div className="min-w-0 flex-1">
          {aberto && (
            <ProjectPanel
              key={aberto.id}
              project={aberto}
              comentarios={comentarios}
              notas={notas}
              tarefas={filtradas}
              tarefasDoEscopo={doEscopo}
              phasesDe={phasesDe}
              aba={aba}
              setAba={setAba}
              visao={visao}
              setVisao={trocarVisao}
              escopo={escopo}
              setEscopo={setEscopo}
              onAbrirProjeto={abrirSoDoProjeto}
              periodo={periodo}
              setPeriodo={setPeriodo}
              pending={pending}
              send={send}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Recorte de tempo da lista, pelo prazo da tarefa. */
function recortar(tarefas: TaskComProjeto[], periodo: Periodo): TaskComProjeto[] {
  const hj = hoje();
  const amanha = somaDias(hj, 1);
  const fimSemana = somaDias(hj, 7);
  const mes = hj.slice(0, 7);

  const passa = (t: TaskComProjeto) => {
    switch (periodo) {
      case 'tudo':      return true;
      case 'atrasadas': return !!t.dueDate && t.dueDate < hj && t.status !== 'feito';
      case 'hoje':      return t.dueDate === hj;
      case 'amanha':    return t.dueDate === amanha;
      case 'semana':    return !!t.dueDate && t.dueDate >= hj && t.dueDate <= fimSemana;
      case 'mes':       return !!t.dueDate && t.dueDate.slice(0, 7) === mes;
      case 'sem_prazo': return !t.dueDate;
    }
  };

  // A subtarefa acompanha a mãe: filtrar por prazo não pode esvaziar o contador
  // de subtarefas de uma tarefa que continua na lista.
  const raizes = new Set(tarefas.filter((t) => !t.parentId && passa(t)).map((t) => t.id));
  return tarefas.filter((t) => (t.parentId ? raizes.has(t.parentId) : raizes.has(t.id)));
}

function ItemProjeto({ projeto, ativo, onClick }: { projeto: ProjectView; ativo: boolean; onClick: () => void }) {
  const abertas = projeto.tasks.filter((t) => t.status !== 'feito').length;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
        ativo
          ? 'bg-primary/10 font-semibold text-primary'
          : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary'
      } ${projeto.archivedAt ? 'opacity-60' : ''}`}
    >
      <span className="min-w-0 flex-1 truncate">{projeto.orgName ?? projeto.title ?? 'Sem cliente'}</span>
      {abertas > 0 && (
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
            ativo ? 'bg-primary/15 text-primary' : 'bg-black/[0.06] text-text-muted'
          }`}
        >
          {abertas}
        </span>
      )}
    </button>
  );
}

/**
 * Os números do escopo inteiro, sem o recorte de tempo: o filtro logo abaixo diz
 * o que fazer agora, os cards dizem em que pé está o trabalho. A média conta só
 * as tarefas concluídas que passaram pelo cronômetro.
 */
function Numeros({ tarefas }: { tarefas: TaskComProjeto[] }) {
  const raizes = tarefas.filter((t) => !t.parentId);
  const hj = hoje();
  const conta = (s: string) => raizes.filter((t) => t.status === s).length;
  const atrasadas = raizes.filter((t) => !!t.dueDate && t.dueDate < hj && t.status !== 'feito').length;

  const cronometradas = raizes.filter((t) => t.status === 'feito' && t.tempoSegundos > 0);
  const media = cronometradas.length
    ? Math.round(cronometradas.reduce((s, t) => s + t.tempoSegundos, 0) / cronometradas.length)
    : 0;

  const cards: { label: string; valor: string; tom?: string; nota?: string }[] = [
    { label: 'Atrasadas', valor: String(atrasadas), tom: atrasadas > 0 ? 'text-danger' : undefined },
    { label: 'A fazer', valor: String(conta('a_fazer')) },
    { label: 'Fazendo', valor: String(conta('fazendo')), tom: 'text-primary' },
    { label: 'Revisão', valor: String(conta('revisao')) },
    { label: 'Concluídas', valor: String(conta('feito')), tom: 'text-[#15803D]' },
    {
      label: 'Tempo médio',
      valor: media ? fmtDuracao(media) : '—',
      nota: cronometradas.length
        ? `${cronometradas.length} cronometrada${cronometradas.length === 1 ? '' : 's'}`
        : 'sem cronômetro ainda',
    },
  ];

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div key={c.label} className="rounded-md border border-black/[0.07] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">{c.label}</p>
          <p className={`mt-0.5 text-xl font-semibold tabular-nums ${c.tom ?? 'text-text-primary'}`}>{c.valor}</p>
          {c.nota && <p className="text-[10px] text-text-muted">{c.nota}</p>}
        </div>
      ))}
    </div>
  );
}

function ProjectPanel({
  project, comentarios, notas, tarefas, tarefasDoEscopo, phasesDe, aba, setAba, visao, setVisao,
  escopo, setEscopo, onAbrirProjeto, periodo, setPeriodo, pending, send,
}: {
  project: ProjectView;
  comentarios: ComentarioView[];
  notas: NotaView[];
  tarefas: TaskComProjeto[];
  tarefasDoEscopo: TaskComProjeto[];
  phasesDe: (id: string) => PhaseView[];
  aba: Aba;
  setAba: (v: Aba) => void;
  visao: 'kanban' | 'lista';
  setVisao: (v: 'kanban' | 'lista') => void;
  escopo: 'projeto' | 'todos';
  setEscopo: (v: 'projeto' | 'todos') => void;
  onAbrirProjeto: (id: string) => void;
  periodo: Periodo;
  setPeriodo: (v: Periodo) => void;
  pending: boolean;
  send: Send;
}) {
  const [novaEtapa, setNovaEtapa] = useState(false);
  const nome = project.orgName ?? project.title ?? 'Sem cliente';
  const notasDoProjeto = notas.filter((n) => n.projetoId === project.id).length;
  // Negócio ganho ainda sem contrato: só o checklist do fechamento existe.
  // Cronograma, notas, link do cliente e arquivamento são coisas do contrato,
  // que nasce no "Gerar contrato" e leva essas tarefas junto.
  const soChecklist = project.kind === 'negocio';
  // Trocar de um contrato (numa aba de cronograma) para um negócio não pode
  // deixar a tela numa aba que aquele projeto não tem.
  const abaAtual: Aba = soChecklist ? 'tasks' : aba;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
          <button onClick={() => setAba('tasks')} className={tabCls(aba === 'tasks')}>Tasks</button>
          {!soChecklist && (
            <>
              <button onClick={() => setAba('cronograma')} className={tabCls(aba === 'cronograma')}>Cronograma</button>
              <button onClick={() => setAba('notas')} className={tabCls(aba === 'notas')}>
                Notas
                {notasDoProjeto > 0 && (
                  <span className="rounded-full bg-black/[0.06] px-1.5 text-[10px] tabular-nums text-text-muted">
                    {notasDoProjeto}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {abaAtual === 'tasks' && (
            <>
              {/* Um projeto por vez, ou o dia inteiro de uma vez. */}
              <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
                <button onClick={() => setEscopo('projeto')} className={tabCls(escopo === 'projeto')} title={nome}>{nome}</button>
                <button onClick={() => setEscopo('todos')} className={tabCls(escopo === 'todos')}>Todos</button>
              </div>

              <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
                <button onClick={() => setVisao('kanban')} className={tabCls(visao === 'kanban')}>
                  <LayoutGrid className="h-3.5 w-3.5" />Kanban
                </button>
                <button onClick={() => setVisao('lista')} className={tabCls(visao === 'lista')}>
                  <List className="h-3.5 w-3.5" />Lista
                </button>
              </div>
            </>
          )}

          {!soChecklist && <ArquivarProjeto project={project} pending={pending} send={send} />}
        </div>
      </div>

      {soChecklist && (
        <p className="mb-3 rounded-md border border-success/25 bg-success/[0.05] px-3 py-2 text-[12px] text-text-secondary">
          Negócio ganho, contrato ainda não gerado. Este é o checklist do fechamento: ao gerar o
          contrato no card do negócio, ele passa inteiro para o projeto do cliente.
        </p>
      )}

      {project.archivedAt && (
        <p className="mb-3 rounded-md border border-black/[0.07] bg-neutral-50 px-3 py-2 text-[12px] text-text-muted">
          Projeto arquivado: fora da lista de ativos e da visão “Todos”, mas inteiro aqui.
        </p>
      )}

      {abaAtual === 'notas' ? (
        <NotasView notas={notas} projectId={project.id} projetoNome={nome} send={send} />
      ) : abaAtual === 'tasks' ? (
        <>
          <Numeros tarefas={tarefasDoEscopo} />

          <div className="mb-3 flex flex-wrap items-center gap-1 rounded-md border border-black/[0.07] bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
            {PERIODOS.map((p) => {
              const n = recortar(tarefasDoEscopo, p.id).filter((t) => !t.parentId).length;
              const ativo = periodo === p.id;
              const alerta = p.id === 'atrasadas' && n > 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    ativo ? 'bg-black/[0.06] text-text-primary' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {p.label}
                  <span
                    className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                      alerta ? 'bg-danger/12 font-semibold text-danger' : 'bg-black/[0.06] text-text-muted'
                    }`}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>

          {visao === 'kanban' ? (
            <KanbanView
              comentarios={comentarios}
              tasks={tarefas}
              phasesDe={phasesDe}
              projectId={project.id}
              projectKind={project.kind}
              mostrarProjeto={escopo === 'todos'}
              onAbrirProjeto={onAbrirProjeto}
              pending={pending}
              send={send}
            />
          ) : (
            <ListView
              comentarios={comentarios}
              tasks={tarefas}
              phasesDe={phasesDe}
              projectId={project.id}
              projectKind={project.kind}
              mostrarProjeto={escopo === 'todos'}
              onAbrirProjeto={onAbrirProjeto}
              send={send}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-5">
          {/* O cronograma é sempre de um cliente só, mesmo com a lista em "Todos":
              é ele que vira o link de acompanhamento. */}
          <Gantt phases={project.phases} tasks={project.tasks} titulo={`Cronograma · ${nome}`} />

          <ClientLink project={project} pending={pending} send={send} />

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-text-primary">Etapas do cronograma</h2>
              <button
                onClick={() => setNovaEtapa((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-black/[0.1] bg-white px-2.5 py-1 text-xs font-medium text-text-secondary shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition hover:border-primary/40 hover:text-primary"
              >
                {novaEtapa ? 'Cancelar' : <><Plus className="h-3.5 w-3.5" />Etapa</>}
              </button>
            </div>

            {novaEtapa && (
              <form
                action={(fd) => {
                  send(createPhase, {
                    engagement_id: project.id,
                    name: String(fd.get('name') ?? ''),
                    start_date: String(fd.get('start_date') ?? ''),
                    end_date: String(fd.get('end_date') ?? ''),
                  });
                  setNovaEtapa(false);
                }}
                className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-primary/20 bg-primary/[0.03] p-3 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <input name="name" required placeholder="Nome da etapa (ex: Descoberta)" className={inputCls} />
                <input name="start_date" type="date" className={inputCls} title="Início" />
                <input name="end_date" type="date" className={inputCls} title="Fim" />
                <button type="submit" disabled={pending} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60">
                  Adicionar
                </button>
              </form>
            )}

            {project.phases.length === 0 && !novaEtapa ? (
              <p className="rounded-md border border-black/[0.06] bg-white px-4 py-6 text-center text-sm text-text-muted">
                Sem etapas ainda. As etapas agrupam as tarefas no cronograma que o cliente vê.
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {project.phases.map((phase, i) => (
                  <PhaseRow
                    key={phase.id}
                    phase={phase}
                    tarefas={project.tasks.filter((t) => t.phaseId === phase.id).length}
                    primeira={i === 0}
                    ultima={i === project.phases.length - 1}
                    pending={pending}
                    send={send}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/** Arquivar tira o projeto da frente aqui e no SimbOS, sem apagar nada. */
function ArquivarProjeto({ project, pending, send }: { project: ProjectView; pending: boolean; send: Send }) {
  const arquivado = !!project.archivedAt;
  const nome = project.orgName ?? project.title ?? 'este projeto';

  return (
    <button
      onClick={() => {
        if (arquivado) { send(setProjectArchived, { engagement_id: project.id, arquivar: 'off' }); return; }
        if (confirm(`Arquivar "${nome}"? Ele sai da lista de projetos aqui e no SimbOS. Nada é apagado, e dá para desarquivar depois.`)) {
          send(setProjectArchived, { engagement_id: project.id, arquivar: 'on' });
        }
      }}
      disabled={pending}
      title={arquivado ? 'Desarquivar projeto' : 'Arquivar projeto (aqui e no SimbOS)'}
      className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.1] bg-white px-2.5 py-1.5 text-xs font-medium text-text-secondary shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition hover:border-primary/40 hover:text-primary disabled:opacity-60"
    >
      {arquivado ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
      {arquivado ? 'Desarquivar' : 'Arquivar'}
    </button>
  );
}

function ClientLink({ project, pending, send }: { project: ProjectView; pending: boolean; send: Send }) {
  return (
    <section className="rounded-md border border-black/[0.07] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
        <Link2 className="h-3.5 w-3.5 text-text-muted" />
        Acompanhamento do cliente
      </p>
      {project.clientUrl ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-black/[0.04] px-2 py-1 text-xs text-text-secondary">
            {project.clientUrl}
          </code>
          <button
            onClick={() => navigator.clipboard?.writeText(project.clientUrl!)}
            className="rounded-md border border-black/[0.1] px-2.5 py-1 text-xs font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
          >
            Copiar
          </button>
          <button
            onClick={() => send(revokeClientToken, { engagement_id: project.id })}
            disabled={pending}
            className="text-[11px] text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50"
          >
            revogar
          </button>
        </div>
      ) : (
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <p className="text-xs text-text-muted">
            Gere um link para o cliente acompanhar o cronograma. Ele vê só a linha do tempo do que estiver marcado como
            visível, sem login e sem status interno.
          </p>
          <button
            onClick={() => send(generateClientToken, { engagement_id: project.id })}
            disabled={pending}
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            Gerar link
          </button>
        </div>
      )}
    </section>
  );
}

function PhaseRow({ phase, tarefas, primeira, ultima, pending, send }: {
  phase: PhaseView;
  tarefas: number;
  primeira: boolean;
  ultima: boolean;
  pending: boolean;
  send: Send;
}) {
  const atrasada = !!phase.endDate && phase.endDate < hoje() && phase.status !== 'concluida';

  return (
    <li className="group flex flex-wrap items-center gap-2 rounded-md border border-black/[0.07] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <span className={`h-2 w-2 shrink-0 rounded-full ${PHASE_STATUS_DOT[phase.status]}`} />

      <InlineText
        value={phase.name}
        onSave={(v) => send(updatePhase, { id: phase.id, name: v })}
        className="min-w-0 flex-1 text-[13px] font-semibold text-text-primary"
      />

      {tarefas > 0 && (
        <span className="rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-text-muted">
          {tarefas} tarefa{tarefas === 1 ? '' : 's'}
        </span>
      )}

      <DateChip value={phase.startDate} onSave={(v) => send(updatePhase, { id: phase.id, start_date: v })} placeholder="início" />
      <span className="text-[11px] text-text-muted">→</span>
      <DateChip value={phase.endDate} onSave={(v) => send(updatePhase, { id: phase.id, end_date: v })} atrasada={atrasada} placeholder="fim" />

      <ChipSelect
        value={phase.status}
        onChange={(v) => send(updatePhase, { id: phase.id, status: v })}
        tone={PHASE_STATUS_TOM[phase.status]}
        titulo="Situação da etapa"
        options={PHASE_STATUSES.map((s) => ({ value: s, label: PHASE_LABELS[s], dot: PHASE_STATUS_DOT[s] }))}
      />

      {/* Visível para o cliente: a etapa aparece (ou não) no link de acompanhamento. */}
      <button
        onClick={() => send(updatePhase, { id: phase.id, client_visible: phase.clientVisible ? 'off' : 'on' })}
        disabled={pending}
        title={phase.clientVisible ? 'O cliente vê esta etapa' : 'Etapa interna: o cliente não vê'}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
          phase.clientVisible ? 'bg-primary/10 text-primary' : 'bg-black/[0.04] text-text-muted'
        }`}
      >
        {phase.clientVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {phase.clientVisible ? 'cliente vê' : 'interna'}
      </button>

      {/* Mesma regra das tarefas: ação visível, não escondida atrás do mouse. */}
      <span className="flex items-center gap-0.5">
        <button onClick={() => send(movePhase, { id: phase.id, dir: 'up' })} disabled={pending || primeira} className="rounded p-1 text-text-muted transition hover:bg-black/[0.04] hover:text-text-primary disabled:opacity-25" aria-label="Subir">
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => send(movePhase, { id: phase.id, dir: 'down' })} disabled={pending || ultima} className="rounded p-1 text-text-muted transition hover:bg-black/[0.04] hover:text-text-primary disabled:opacity-25" aria-label="Descer">
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => { if (confirm(`Apagar a etapa "${phase.name}"? As tarefas dela viram tarefas sem etapa.`)) send(deletePhase, { id: phase.id }); }}
          disabled={pending}
          className="rounded p-1 text-text-muted/60 transition hover:bg-danger/10 hover:text-danger disabled:opacity-30"
          aria-label="Apagar etapa"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </span>
    </li>
  );
}
