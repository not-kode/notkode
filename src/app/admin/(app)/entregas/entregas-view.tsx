'use client';

// Entregas: as tarefas de cada contrato em Kanban ou Lista, e o cronograma em
// Gantt. Duas faces na mesma tela — aqui você vê tudo; o cliente, pelo link, vê
// só o cronograma com o que estiver marcado como visível.
//
// O topo não tem mais uma segunda lista de tarefas: o recorte de tempo (hoje,
// amanhã, semana, mês) virou filtro da própria lista de baixo, e o que ficou em
// cima são os números do trabalho e o tempo médio por tarefa.

import { useEffect, useMemo, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  createPhase, createProject, renameProject, salvarColunas, setProjectArchived, setProjectRepo,
  generateClientToken, revokeClientToken,
} from './actions';
import {
  Archive, CheckSquare, ChevronDown, ChevronUp, Columns3, Eye, EyeOff, Layers,
  LayoutGrid, Link2, List, PanelLeftClose, PanelLeftOpen, Plus, Rows3, X,
} from 'lucide-react';
import { COLUNAS, COLUNAS_DO_CLIENTE, COLUNA_LABELS } from './types';
import type {
  Agrupamento, Coluna, ComentarioView, NotaView, Pessoa, PhaseView, ProjectView, Send,
  TagView, TaskComProjeto, TaskView,
} from './types';
import { KanbanView } from './kanban-view';
import { ListView } from './list-view';
import { Gantt } from './gantt';
import { NotasView } from './notas-view';
import { ChipSelect, DateChip, InlineText, MenuContexto, fmtDuracao, hoje, inputCls, somaDias } from './ui';

export type { PhaseView, ProjectView, TaskView } from './types';

const PREF_VISAO = 'notkode.entregas.visao';
const PREF_PROJETO = 'notkode.entregas.projeto';
const PREF_LISTA_PROJETOS = 'notkode.entregas.lista-projetos';
const PREF_ABA = 'notkode.entregas.aba';
const PREF_ESCOPO = 'notkode.entregas.escopo';
const PREF_PERIODO = 'notkode.entregas.periodo';

/** Os campos de uma ação de servidor, no formato que ela espera. */
const formDataDe = (campos: Record<string, string>): FormData => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.set(k, v);
  return fd;
};

/** Botão só de ícone, para o que se reconhece pela forma (quadro, lista). */
const iconeCls = (ativo: boolean) =>
  `rounded-sm p-1.5 transition-colors ${
    ativo
      ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]'
      : 'text-text-muted hover:text-text-primary'
  }`;

const tabCls = (ativo: boolean) =>
  `inline-flex max-w-[12rem] items-center gap-1.5 truncate rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
    ativo ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]' : 'text-text-muted hover:text-text-primary'
  }`;

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

export function EntregasView({ projects, comentarios, notas, pessoas, organizacoes }: {
  projects: ProjectView[];
  comentarios: ComentarioView[];
  notas: NotaView[];
  /** Quem pode tocar tarefa: a equipe e os contatos dos clientes. */
  pessoas: Pessoa[];
  /** Clientes cadastrados, para dizer de quem é a pasta nova. */
  organizacoes: { id: string; nome: string }[];
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
  // Botão direito num projeto da lateral: arquivar é ação de exceção e não
  // precisa de um botão fixo competindo com o resto da barra.
  const [menuProjeto, setMenuProjeto] = useState<{ projeto: ProjectView; x: number; y: number } | null>(null);
  // Renomear é edição no próprio lugar: o item da lista vira campo de texto, sem
  // abrir formulário nem tirar a pasta da vista. Guarda o id de quem está sendo
  // renomeado — o botão direito e o lápis do hover abrem o mesmo campo.
  const [renomeando, setRenomeando] = useState<string | null>(null);
  // Nova pasta: onde as tarefas vão morar. O formulário abre numa janelinha no
  // meio da tela — na lateral ele espremia a lista de projetos e o campo do
  // caminho do repositório não cabia em 15rem.
  const [novaPasta, setNovaPasta] = useState(false);
  const [pending, start] = useTransition();

  const router = useRouter();

  const send: Send = (action, campos) => {
    const fd = formDataDe(campos);
    // O refresh depois da ação é cinto de segurança: a revalidação do servidor já
    // deveria trazer o dado novo, e sem ele uma falha de cache aparece como
    // "sumiu/não apareceu" na tela.
    start(async () => { await action(fd); router.refresh(); });
  };

  // Tarefa criada em outro lugar (o MCP no terminal, o celular) tem que cair
  // aqui sozinha — mas não a cada 20 segundos, como era: aba esquecida aberta
  // fazia milhares de recarregamentos por dia e era isso que estava enchendo a
  // conta de requisições. A tela se atualiza quando você volta para ela, que é
  // o momento em que a informação velha atrapalha.
  useEffect(() => {
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    window.addEventListener('focus', aoVoltar);
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar);
      window.removeEventListener('focus', aoVoltar);
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

    // O recorte da tela também é escolha de trabalho: quem estava vendo as
    // tarefas de hoje, ou o cronograma, tem que voltar nele depois de um F5.
    const abaSalva = localStorage.getItem(PREF_ABA);
    if (abaSalva === 'tasks' || abaSalva === 'cronograma' || abaSalva === 'notas') setAba(abaSalva);

    const escopoSalvo = localStorage.getItem(PREF_ESCOPO);
    if (escopoSalvo === 'projeto' || escopoSalvo === 'todos') setEscopo(escopoSalvo);

    const periodoSalvo = localStorage.getItem(PREF_PERIODO);
    if (PERIODOS.some((p) => p.id === periodoSalvo)) setPeriodo(periodoSalvo as Periodo);
    // Só na montagem: depois disso quem manda é o clique.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirProjeto = (id: string) => {
    setAbertoId(id);
    localStorage.setItem(PREF_PROJETO, id);
    // Clicar num projeto é dizer "quero este": sai da visão geral sozinho.
    trocarEscopo('projeto');
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
    trocarEscopo('projeto');
  };
  // Nome vazio ou igual ao que já estava não vale uma ida ao banco.
  const renomear = (projeto: ProjectView, nome: string) => {
    setRenomeando(null);
    const limpo = nome.trim();
    if (limpo && limpo !== (projeto.title ?? '')) {
      send(renameProject, { engagement_id: projeto.id, title: limpo });
    }
  };
  // A pasta do computador é o que o MCP lê para saber de quem é o repositório.
  // Pergunta e resposta numa caixa só, como arquivar: é ajuste de exceção, não
  // merece um formulário fixo na lateral.
  const ligarPasta = (projeto: ProjectView) => {
    const atual = projeto.repoPath ?? '';
    const resposta = prompt(
      `Pasta do repositório no computador (caminho completo). Vazio desliga o vínculo.`,
      atual,
    );
    if (resposta === null || resposta.trim() === atual) return;
    start(async () => {
      const r = await setProjectRepo(formDataDe({ engagement_id: projeto.id, repo_path: resposta.trim() }));
      if (r) return alert(r.erro);
      router.refresh();
    });
  };
  const trocarVisao = (v: 'kanban' | 'lista') => {
    setVisao(v);
    localStorage.setItem(PREF_VISAO, v);
  };
  const trocarAba = (v: Aba) => {
    setAba(v);
    localStorage.setItem(PREF_ABA, v);
  };
  const trocarEscopo = (v: 'projeto' | 'todos') => {
    setEscopo(v);
    localStorage.setItem(PREF_ESCOPO, v);
  };
  const trocarPeriodo = (v: Periodo) => {
    setPeriodo(v);
    localStorage.setItem(PREF_PERIODO, v);
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
  const tagsPorProjeto = useMemo(() => new Map(projects.map((p) => [p.id, p.tags])), [projects]);
  const tagsDe = (id: string) => tagsPorProjeto.get(id) ?? [];

  // Cliente de um lado, trabalho interno do outro: são dois modos diferentes.
  // Fechamento vem antes dos dois: é venda ganha esperando virar projeto, e o
  // que está lá dentro (contrato, briefing, primeira parcela) não pode esperar.
  const grupos = useMemo(
    () => [
      { titulo: 'Fechamentos', itens: ativos.filter((p) => p.kind === 'negocio') },
      { titulo: 'Clientes', itens: ativos.filter((p) => p.kind === 'contrato' && !p.isInternal) },
      { titulo: 'Interno', itens: ativos.filter((p) => p.kind === 'contrato' && p.isInternal) },
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

  const nomeAberto = aberto ? aberto.orgName ?? aberto.title ?? 'Sem cliente' : 'Tasks';
  const geral = escopo === 'todos';

  return (
    <div>
      {/* O topo diz DE QUEM é a tela e guarda o que é do projeto inteiro (link do
          cliente, arquivar). Antes isso morava na mesma fileira dos controles de
          visualização, e "revogar link" acabava do lado de "Kanban". */}
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1">
            <span className="status-dot" />
            {geral ? 'Tudo em aberto' : 'Projeto'}
          </p>
          {/* O link do cliente é do projeto, então anda junto com o nome dele. */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {geral ? 'Visão geral' : nomeAberto}
            </h1>
            {!geral && aberto && aberto.kind === 'contrato' && (
              <ClientLink project={aberto} pending={pending} send={send} />
            )}
          </div>
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
              {/* A visão geral não é "um projeto a mais": é a sua fila do dia,
                  todos os clientes juntos. Por isso mora aqui em cima e não num
                  botão colado no nome de um cliente, onde parecia recorte dele. */}
              <button
                onClick={() => trocarEscopo('todos')}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors ${
                  escopo === 'todos'
                    ? 'bg-primary/[0.08] font-medium text-primary'
                    : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary'
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                Tudo em aberto
                <span className="ml-auto text-[11px] tabular-nums text-text-muted">
                  {ativos.flatMap((p) => p.tasks).filter((t) => !t.parentId && t.status !== 'feito').length}
                </span>
              </button>

              {grupos.map((g) => (
                <div key={g.titulo}>
                  <p className="mb-1.5 px-2 font-label text-[10px] uppercase tracking-wider text-text-muted">
                    {g.titulo}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {g.itens.map((p) => (
                      <li key={p.id}>
                        <ItemProjeto
                          projeto={p}
                          ativo={p.id === aberto?.id}
                          onClick={() => abrirProjeto(p.id)}
                          onMenu={(x, y) => setMenuProjeto({ projeto: p, x, y })}
                          renomeando={renomeando === p.id}
                          onRenomear={() => setRenomeando(p.id)}
                          onSalvarNome={(nome) => renomear(p, nome)}
                          onCancelar={() => setRenomeando(null)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <button
                  onClick={() => setNovaPasta(true)}
                  className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-[13px] text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  Nova pasta
                </button>
              </div>

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
                          <ItemProjeto
                            projeto={p}
                            ativo={p.id === aberto?.id}
                            onClick={() => abrirProjeto(p.id)}
                            onMenu={(x, y) => setMenuProjeto({ projeto: p, x, y })}
                            renomeando={renomeando === p.id}
                            onRenomear={() => setRenomeando(p.id)}
                            onSalvarNome={(nome) => renomear(p, nome)}
                            onCancelar={() => setRenomeando(null)}
                          />
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
              pessoas={pessoas}
              tarefas={filtradas}
              tarefasDoEscopo={doEscopo}
              phasesDe={phasesDe}
              tagsDe={tagsDe}
              aba={aba}
              setAba={trocarAba}
              visao={visao}
              setVisao={trocarVisao}
              escopo={escopo}
              setEscopo={trocarEscopo}
              onAbrirProjeto={abrirSoDoProjeto}
              periodo={periodo}
              setPeriodo={trocarPeriodo}
              pending={pending}
              send={send}
            />
          )}
        </div>
      </div>

      {novaPasta && (
        <NovaPastaDialog
          organizacoes={organizacoes}
          pending={pending}
          fechar={() => setNovaPasta(false)}
          criar={(fd, aoErrar) => {
            start(async () => {
              const r = await createProject(fd);
              if ('erro' in r) return aoErrar(r.erro);
              setNovaPasta(false);
              abrirProjeto(r.id);
              router.refresh();
            });
          }}
        />
      )}

      {menuProjeto && (
        <MenuContexto
          em={{ x: menuProjeto.x, y: menuProjeto.y }}
          fechar={() => setMenuProjeto(null)}
          itens={[
            // Fechamento não tem pasta: é negócio ganho esperando virar contrato.
            ...(menuProjeto.projeto.kind === 'contrato'
              ? [{
                  label: menuProjeto.projeto.repoPath ? 'Trocar pasta do repo' : 'Ligar pasta do repo',
                  onClick: () => ligarPasta(menuProjeto.projeto),
                }]
              : []),
            {
              label: menuProjeto.projeto.archivedAt ? 'Desarquivar projeto' : 'Arquivar projeto',
              onClick: () => {
                const p = menuProjeto.projeto;
                const nome = p.orgName ?? p.title ?? 'este projeto';
                if (p.archivedAt) {
                  send(setProjectArchived, { engagement_id: p.id, arquivar: 'off' });
                  return;
                }
                if (confirm(`Arquivar "${nome}"? Ele sai da lista de projetos, sem apagar nada.`)) {
                  send(setProjectArchived, { engagement_id: p.id, arquivar: 'on' });
                }
              },
            },
          ]}
        />
      )}
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

/**
 * A janelinha de criar pasta. São quatro perguntas curtas — nome, de quem é, o
 * cliente e a pasta no computador — e nenhuma delas cabia bem na coluna da
 * lateral, que tem 15rem e é onde a lista de projetos precisa aparecer.
 */
function NovaPastaDialog({ organizacoes, pending, criar, fechar }: {
  organizacoes: { id: string; nome: string }[];
  pending: boolean;
  criar: (fd: FormData, aoErrar: (erro: string) => void) => void;
  fechar: () => void;
}) {
  const [deCliente, setDeCliente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [fechar]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Fechar" onClick={fechar} className="absolute inset-0 bg-black/25" />

      <form
        action={(fd) => { setErro(null); criar(fd, setErro); }}
        className="relative w-full max-w-sm rounded-lg border border-black/[0.08] bg-white p-5 shadow-[0_16px_48px_rgba(16,24,40,0.18)]"
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1"><span className="status-dot" />Nova pasta</p>
            <h2 className="text-[15px] font-semibold tracking-tight">Onde as tarefas vão morar</h2>
          </div>
          <button
            type="button"
            onClick={fechar}
            title="Fechar"
            className="rounded p-1 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-label text-[10px] uppercase tracking-wider text-text-muted">Nome</span>
            <input name="title" required autoFocus placeholder="Ex.: Notkode — site" className={inputCls} />
          </label>

          <div className="flex flex-col gap-1">
            <span className="font-label text-[10px] uppercase tracking-wider text-text-muted">De quem é</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                <input type="radio" name="kind" value="interno" defaultChecked onChange={() => setDeCliente(false)} />
                Interno
              </label>
              <label className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                <input type="radio" name="kind" value="cliente" onChange={() => setDeCliente(true)} />
                De um cliente
              </label>
            </div>
          </div>

          {deCliente && (
            <label className="flex flex-col gap-1">
              <span className="font-label text-[10px] uppercase tracking-wider text-text-muted">Cliente</span>
              <select name="organization_id" required className={inputCls}>
                <option value="">Escolha o cliente…</option>
                {organizacoes.map((o) => (
                  <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
              </select>
            </label>
          )}

          {/* Opcional, mas é o que liga a pasta ao terminal: com o caminho
              preenchido, tarefa criada de dentro do repositório já sabe que é daqui. */}
          <label className="flex flex-col gap-1">
            <span className="font-label text-[10px] uppercase tracking-wider text-text-muted">
              Pasta no computador (opcional)
            </span>
            <input name="repo_path" placeholder="/Users/camila/repo/…" className={inputCls} />
          </label>

          {erro && <p className="text-[11px] text-danger">{erro}</p>}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={fechar}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Criando…' : 'Criar pasta'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

function ItemProjeto({ projeto, ativo, onClick, onMenu, renomeando, onRenomear, onSalvarNome, onCancelar }: {
  projeto: ProjectView;
  ativo: boolean;
  onClick: () => void;
  /** Botão direito: arquivar e desarquivar moram aqui. */
  onMenu: (x: number, y: number) => void;
  /** Quando ligado, o item vira campo de texto no lugar do nome. */
  renomeando: boolean;
  /** Duplo clique no nome: renomear é edição no próprio lugar. */
  onRenomear: () => void;
  onSalvarNome: (nome: string) => void;
  onCancelar: () => void;
}) {
  const abertas = projeto.tasks.filter((t) => t.status !== 'feito').length;

  // Renomear muda o título do projeto, então é ele que entra no campo: numa
  // pasta de cliente o rótulo da lista é o nome do cliente, que vem do cadastro
  // dele e não se mexe por aqui.
  if (renomeando) {
    return (
      <form action={(fd) => onSalvarNome(String(fd.get('nome') ?? ''))} className="px-1 py-0.5">
        <input
          name="nome"
          autoFocus
          defaultValue={projeto.title ?? ''}
          placeholder="Nome do projeto"
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => onSalvarNome(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onCancelar(); } }}
          className="w-full rounded-sm border border-primary/40 bg-white px-1.5 py-1 text-[13px] outline-none focus:border-primary"
        />
      </form>
    );
  }

  return (
    <button
      onClick={onClick}
      onDoubleClick={(e) => { if (projeto.kind === 'contrato') { e.preventDefault(); onRenomear(); } }}
      onContextMenu={(e) => { e.preventDefault(); onMenu(e.clientX, e.clientY); }}
      title={projeto.archivedAt ? 'Arquivado — clique com o botão direito para desarquivar' : 'Duplo clique para renomear, botão direito para arquivar'}
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
  project, comentarios, notas, pessoas, tarefas, tarefasDoEscopo, phasesDe, tagsDe, aba, setAba,
  visao, setVisao, escopo, setEscopo, onAbrirProjeto, periodo, setPeriodo, pending, send,
}: {
  project: ProjectView;
  comentarios: ComentarioView[];
  notas: NotaView[];
  pessoas: Pessoa[];
  tarefas: TaskComProjeto[];
  tarefasDoEscopo: TaskComProjeto[];
  phasesDe: (id: string) => PhaseView[];
  tagsDe: (id: string) => TagView[];
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
  const nome = project.orgName ?? project.title ?? 'Sem cliente';
  const notasDoProjeto = notas.filter((n) => n.projetoId === project.id).length;
  // Negócio ganho ainda sem contrato: só o checklist do fechamento existe.
  // Cronograma, notas, link do cliente e arquivamento são coisas do contrato,
  // que nasce no "Gerar contrato" e leva essas tarefas junto.
  const soChecklist = project.kind === 'negocio';
  // Na visão geral não existe "o projeto": cronograma e notas são de um cliente,
  // e ali a tela é só a fila de tarefas de todos.
  const geral = escopo === 'todos';
  // Trocar de um contrato (numa aba de cronograma) para um negócio não pode
  // deixar a tela numa aba que aquele projeto não tem.
  const abaAtual: Aba = soChecklist || geral ? 'tasks' : aba;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
          <button onClick={() => setAba('tasks')} className={tabCls(aba === 'tasks')}>Tasks</button>
          {!soChecklist && !geral && (
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

        {/* Só o jeito de OLHAR a lista mora aqui: quadro ou lista, por status ou
            por sprint, e quais colunas. Nada que mexa no projeto. */}
        {abaAtual === 'tasks' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-md bg-black/[0.05] p-0.5">
              <button
                onClick={() => setVisao('lista')}
                title="Ver em lista"
                aria-label="Ver em lista"
                className={iconeCls(visao === 'lista')}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setVisao('kanban')}
                title="Ver em quadro"
                aria-label="Ver em quadro"
                className={iconeCls(visao === 'kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            {/* Agrupar é só um jeito de olhar, não um tipo de tarefa: a sprint é
                um campo da tarefa, e trocar aqui não mexe em dado nenhum. */}
            {visao === 'lista' && !geral && !soChecklist && (
              <Agrupamento project={project} send={send} />
            )}

            {!soChecklist && !geral && (
              <BotaoColunas project={project} pending={pending} send={send} />
            )}
          </div>
        )}
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
              tagsDe={tagsDe}
              projectId={project.id}
              projectKind={project.kind}
              pessoas={pessoas}
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
              tagsDe={tagsDe}
              projectId={project.id}
              projectKind={project.kind}
              pessoas={pessoas}
              agrupar={project.visao.agrupar}
              colunas={project.visao.colunas}
              onReordenarColunas={(colunas) => send(salvarColunas, {
                engagement_id: project.id,
                colunas: colunas.join(','),
                agrupar: project.visao.agrupar,
                cronograma: project.visao.cronogramaNoLink ? 'on' : '',
              })}
              mostrarProjeto={escopo === 'todos'}
              onAbrirProjeto={onAbrirProjeto}
              send={send}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-5">
          {/* O cronograma é sempre de um cliente só, mesmo com a lista em "Todos":
              é ele que vira o link de acompanhamento. As barras saem das próprias
              tarefas, então não há o que cadastrar aqui: nome e prazo se editam
              na linha, e o resto se resolve no quadro. */}
          <Gantt phases={project.phases} tasks={project.tasks} titulo={`Cronograma · ${nome}`} send={send} />
        </div>
      )}
    </div>
  );
}

/**
 * Link de acompanhamento como botão, não como painel. Gerar o link é ação de um
 * clique e acontece uma vez por projeto; ocupava um bloco inteiro do cronograma
 * repetindo a explicação toda vez.
 */
function ClientLink({ project, pending, send }: { project: ProjectView; pending: boolean; send: Send }) {
  const [copiado, setCopiado] = useState(false);

  if (!project.clientUrl) {
    return (
      <button
        onClick={() => send(generateClientToken, { engagement_id: project.id })}
        disabled={pending}
        title="Gera um link sem login para o cliente acompanhar o cronograma"
        className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.1] bg-white px-2.5 py-1.5 text-[12px] font-medium text-text-secondary shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition hover:border-primary/40 hover:text-primary disabled:opacity-60"
      >
        <Link2 className="h-3.5 w-3.5" />
        Gerar link do cliente
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => {
          navigator.clipboard?.writeText(project.clientUrl!);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1800);
        }}
        title={project.clientUrl}
        className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.1] bg-white px-2.5 py-1.5 text-[12px] font-medium text-text-secondary shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition hover:border-primary/40 hover:text-primary"
      >
        <Link2 className="h-3.5 w-3.5" />
        {copiado ? 'link copiado' : 'link do cliente'}
      </button>
      <button
        onClick={() => {
          if (confirm('Revogar o link? Quem tiver o endereço para de conseguir abrir o acompanhamento.')) {
            send(revokeClientToken, { engagement_id: project.id });
          }
        }}
        disabled={pending}
        title="Revogar o link"
        className="rounded-md px-1.5 py-1.5 text-[11px] text-text-muted transition hover:text-danger disabled:opacity-50"
      >
        revogar
      </button>
    </div>
  );
}

/**
 * Painel em cima da tela, para o que não cabe num chip: cadastro de tags e o
 * recorte do que o cliente vê. Fecha no Esc, no clique fora e no X.
 */
function Painel({ titulo, descricao, fechar, children }: {
  titulo: string;
  descricao: string;
  fechar: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [fechar]);

  return createPortal(
    <div
      onClick={fechar}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 px-4 py-16 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]"
      >
        <header className="flex items-start gap-3 border-b border-black/[0.06] px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary">{titulo}</h2>
            <p className="mt-0.5 text-[12px] leading-snug text-text-muted">{descricao}</p>
          </div>
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="ml-auto shrink-0 rounded p-1 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Separar a lista por status ou por sprint, em dois ícones — é a mesma natureza
 * do par lista/quadro ao lado, e o rótulo por extenso ocupava a barra sem
 * ensinar nada que o desenho não diga.
 *
 * Escolher sprint num projeto que ainda não tem nenhuma abre a conversa em vez
 * de trocar para uma tela vazia: "quer criar a primeira?", com nome e período já
 * preenchidos. Cancelar deixa tudo como estava.
 */
function Agrupamento({ project, send }: { project: ProjectView; send: Send }) {
  const [perguntando, setPerguntando] = useState(false);
  const semSprint = project.phases.length === 0;
  const atual = project.visao.agrupar;

  const gravar = (agrupar: 'status' | 'sprint') =>
    send(salvarColunas, {
      engagement_id: project.id,
      colunas: project.visao.colunas.join(','),
      agrupar,
      cronograma: project.visao.cronogramaNoLink ? 'on' : '',
    });

  return (
    <>
      <div className="flex items-center gap-0.5 rounded-md bg-black/[0.05] p-0.5">
        <button
          onClick={() => gravar('status')}
          title="Separar por status"
          aria-label="Separar por status"
          className={iconeCls(atual === 'status')}
        >
          <Rows3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => (semSprint ? setPerguntando(true) : gravar('sprint'))}
          title="Separar por sprint"
          aria-label="Separar por sprint"
          className={iconeCls(atual === 'sprint')}
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {perguntando && (
        <NovaSprintPainel
          project={project}
          send={send}
          fechar={() => setPerguntando(false)}
          aoCriar={() => gravar('sprint')}
        />
      )}
    </>
  );
}

/** A conversa de "quer gerar a lista em sprint?": nome, período e pronto. */
function NovaSprintPainel({ project, send, fechar, aoCriar }: {
  project: ProjectView;
  send: Send;
  fechar: () => void;
  aoCriar: () => void;
}) {
  const inicioPadrao = hoje();
  const fimPadrao = somaDias(inicioPadrao, 13);
  const [nome, setNome] = useState('Sprint 1');
  const [inicio, setInicio] = useState(inicioPadrao);
  const [fim, setFim] = useState(fimPadrao);

  const criar = () => {
    const limpo = nome.trim();
    if (!limpo) return;
    send(createPhase, {
      engagement_id: project.id,
      name: limpo,
      start_date: inicio,
      end_date: fim,
    });
    aoCriar();
    fechar();
  };

  return (
    <Painel
      titulo="Separar por sprint"
      descricao="Este projeto ainda não tem sprint. Quer criar a primeira agora? Depois é só arrastar as tarefas para dentro dela; o que ficar de fora aparece em “Sem sprint”."
      fechar={fechar}
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1 font-label text-[10px] uppercase tracking-wider text-text-muted">Nome</p>
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') criar(); }}
            placeholder="Sprint 1, Agosto, Fase de dados…"
            className={inputCls}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <p className="mb-1 font-label text-[10px] uppercase tracking-wider text-text-muted">Começa</p>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <p className="mb-1 font-label text-[10px] uppercase tracking-wider text-text-muted">Termina</p>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] pt-3">
          <button
            onClick={fechar}
            className="px-2 py-1.5 text-[12px] text-text-muted transition hover:text-text-primary"
          >
            Agora não
          </button>
          <button
            onClick={criar}
            className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90"
          >
            Criar sprint
          </button>
        </div>
      </div>
    </Painel>
  );
}

/**
 * As colunas desta tela. Uma configuração só: o que você desliga sai da sua
 * lista e sai do link do cliente. O cronômetro é exceção nos dois sentidos —
 * fica na sua lista e nunca vai para o cliente.
 */
function BotaoColunas({ project, pending, send }: { project: ProjectView; pending: boolean; send: Send }) {
  const [aberto, setAberto] = useState(false);
  const visiveis = project.visao.colunas;

  const salvar = (colunas: Coluna[], cronograma: boolean) =>
    send(salvarColunas, {
      engagement_id: project.id,
      colunas: colunas.join(','),
      agrupar: project.visao.agrupar,
      cronograma: cronograma ? 'on' : '',
    });

  const alternar = (c: Coluna) =>
    salvar(
      visiveis.includes(c) ? visiveis.filter((x) => x !== c) : [...visiveis, c],
      project.visao.cronogramaNoLink,
    );

  /**
   * Sobe e desce a coluna na ordem da tabela. O arraste no cabeçalho faz o
   * mesmo, mas nem todo mundo descobre que dá para arrastar — e no trackpad
   * arrastar cabeçalho é gesto ingrato.
   */
  const mover = (c: Coluna, passo: -1 | 1) => {
    const de = visiveis.indexOf(c);
    const para = de + passo;
    if (de < 0 || para < 0 || para >= visiveis.length) return;
    const nova = [...visiveis];
    [nova[de], nova[para]] = [nova[para], nova[de]];
    salvar(nova, project.visao.cronogramaNoLink);
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        title="Colunas desta tela (e do link do cliente)"
        aria-label="Colunas desta tela e do link do cliente"
        className="rounded-md border border-black/[0.1] bg-white p-1.5 text-text-muted shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition hover:border-primary/40 hover:text-primary"
      >
        <Columns3 className="h-4 w-4" />
      </button>

      {aberto && (
        <Painel
          titulo="Colunas"
          descricao="A ordem daqui é a ordem da tabela (dá para arrastar o cabeçalho também). Coluna desligada some da sua lista e do link do cliente; tarefa marcada como interna continua fora do link de qualquer jeito."
          fechar={() => setAberto(false)}
        >
          <div className="flex flex-col gap-4">
            {/* Na ordem em que aparecem na tabela: as ligadas primeiro, que dá
                para subir e descer aqui, e as escondidas embaixo. */}
            <ul className="flex flex-col divide-y divide-black/[0.05] rounded-md border border-black/[0.07]">
              {[...visiveis, ...COLUNAS.filter((c) => !visiveis.includes(c))].map((c) => {
                const ligada = visiveis.includes(c);
                const pos = visiveis.indexOf(c);
                return (
                  <li key={c} className="flex items-center gap-1 px-3 py-2">
                    <button
                      onClick={() => alternar(c)}
                      disabled={pending}
                      className="flex flex-1 items-center gap-2 text-left disabled:opacity-60"
                    >
                      {ligada
                        ? <Eye className="h-3.5 w-3.5 text-primary" />
                        : <EyeOff className="h-3.5 w-3.5 text-text-muted/60" />}
                      <span className={`text-[13px] ${ligada ? 'text-text-primary' : 'text-text-muted'}`}>
                        {COLUNA_LABELS[c]}
                      </span>
                    </button>

                    <span className="shrink-0 text-[11px] text-text-muted">
                      {(COLUNAS_DO_CLIENTE as readonly Coluna[]).includes(c)
                        ? ligada ? 'você e o cliente' : 'escondida'
                        : 'só você'}
                    </span>

                    {ligada && (
                      <span className="ml-1 flex shrink-0 items-center">
                        <button
                          onClick={() => mover(c, -1)}
                          disabled={pending || pos === 0}
                          title="Mover para a esquerda na tabela"
                          aria-label={`Mover ${COLUNA_LABELS[c]} para a esquerda`}
                          className="rounded p-0.5 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary disabled:opacity-25"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => mover(c, 1)}
                          disabled={pending || pos === visiveis.length - 1}
                          title="Mover para a direita na tabela"
                          aria-label={`Mover ${COLUNA_LABELS[c]} para a direita`}
                          className="rounded p-0.5 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary disabled:opacity-25"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <label className="flex items-center gap-2 text-[13px] text-text-secondary">
              <input
                type="checkbox"
                checked={project.visao.cronogramaNoLink}
                onChange={(e) => salvar(visiveis, e.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
              />
              Mostrar o cronograma (Gantt) no link do cliente, numa aba ao lado da lista
            </label>

            <div className="flex items-center justify-between border-t border-black/[0.06] pt-3">
              <p className="text-[11px] text-text-muted">O status sempre aparece para o cliente.</p>
              <button
                onClick={() => setAberto(false)}
                className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90"
              >
                Pronto
              </button>
            </div>
          </div>
        </Painel>
      )}
    </>
  );
}
