'use client';

// Entregas: as tarefas de cada contrato em Kanban ou Lista, e o cronograma em
// Gantt. Duas faces na mesma tela — aqui você vê tudo; o cliente, pelo link, vê
// só o cronograma com o que estiver marcado como visível.

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  createPhase, updatePhase, deletePhase, movePhase,
  updateTask, deleteTask, sincronizarSimbos,
  generateClientToken, revokeClientToken,
} from './actions';
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, LayoutGrid, Link2, List, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { PHASE_LABELS, PHASE_STATUSES, PRIORITY_TONE, type PhaseStatus } from './status';
import type { PhaseView, ProjectView, Send, TaskView } from './types';
import { KanbanView } from './kanban-view';
import { ListView } from './list-view';
import { Gantt } from './gantt';
import { ChipSelect, DateChip, InlineText, fmtDate, hoje, inputCls } from './ui';

export type { PhaseView, ProjectView, TaskView } from './types';

const PREF_VISAO = 'notkode.entregas.visao';

const tabCls = (ativo: boolean) =>
  `inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
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

export function EntregasView({ projects }: { projects: ProjectView[] }) {
  const [abertoId, setAbertoId] = useState<string | null>(projects[0]?.id ?? null);
  // A fila do topo edita tarefa de qualquer projeto, então tem transição própria.
  const [filaPending, startFila] = useTransition();
  const filaSend: Send = (action, campos) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(campos)) fd.set(k, v);
    startFila(() => action(fd));
  };
  const [aba, setAba] = useState<'tasks' | 'cronograma'>('tasks');
  const [visao, setVisao] = useState<'kanban' | 'lista'>('kanban');
  const aberto = projects.find((p) => p.id === abertoId) ?? null;

  // A escolha entre quadro e tabela é preferência de trabalho, não do dado:
  // fica no navegador e vale para todos os projetos.
  useEffect(() => {
    const salvo = localStorage.getItem(PREF_VISAO);
    if (salvo === 'kanban' || salvo === 'lista') setVisao(salvo);
  }, []);
  const trocarVisao = (v: 'kanban' | 'lista') => {
    setVisao(v);
    localStorage.setItem(PREF_VISAO, v);
  };

  // Tudo que está aberto, de todos os projetos: a pergunta "o que eu tenho que
  // fazer" não pode exigir abrir projeto por projeto.
  const abertas = useMemo(
    () =>
      projects.flatMap((p) =>
        p.tasks
          .filter((t) => t.status !== 'feito')
          .map((t) => ({
            ...t,
            projeto: p.orgName ?? p.title ?? 'Sem nome',
            projetoId: p.id,
            interno: p.isInternal,
          })),
      ),
    [projects],
  );

  // Cliente de um lado, casa do outro: são dois modos de trabalho diferentes.
  const grupos = useMemo(
    () => [
      { titulo: 'Clientes', itens: projects.filter((p) => !p.isInternal) },
      { titulo: 'Casa', itens: projects.filter((p) => p.isInternal) },
    ].filter((g) => g.itens.length > 0),
    [projects],
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
        <SyncSimbos />
      </header>

      <Fila tarefas={abertas} irPara={setAbertoId} pending={filaPending} send={filaSend} />

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Lista de projetos em vez de dropdown: com vinte contratos, um campo
            fechado esconde justamente o que precisa estar à vista. */}
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="flex flex-col gap-4">
            {grupos.map((g) => (
              <div key={g.titulo}>
                <p className="mb-1.5 px-2 font-label text-[10px] uppercase tracking-wider text-text-muted">
                  {g.titulo}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {g.itens.map((p) => {
                    const abertas = p.tasks.filter((t) => t.status !== 'feito').length;
                    const ativo = p.id === abertoId;
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => setAbertoId(p.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                            ativo
                              ? 'bg-primary/10 font-semibold text-primary'
                              : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary'
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">{p.orgName ?? p.title ?? 'Sem cliente'}</span>
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
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {aberto && (
            <ProjectPanel
              key={aberto.id}
              project={aberto}
              aba={aba}
              setAba={setAba}
              visao={visao}
              setVisao={trocarVisao}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * O SimbOS e o sistema andam juntos: o que muda aqui vai para lá na hora, e o
 * que muda lá chega aqui de dez em dez minutos pelo cron. Este botão é para não
 * ter que esperar o ciclo.
 */
function SyncSimbos() {
  const [rodando, setRodando] = useState(false);
  const [resumo, setResumo] = useState<string | null>(null);

  const rodar = async () => {
    setRodando(true);
    setResumo(null);
    try {
      const r = await sincronizarSimbos();
      if (!r.ok) setResumo(r.motivo ?? 'não deu');
      else if ((r.criadas ?? 0) + (r.atualizadas ?? 0) + (r.apagadas ?? 0) === 0) setResumo('já estava em dia');
      else setResumo(`${r.criadas} nova(s), ${r.atualizadas} atualizada(s), ${r.apagadas} removida(s)`);
    } finally {
      setRodando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {resumo && <span className="text-[11px] text-text-muted">{resumo}</span>}
      <button
        onClick={rodar}
        disabled={rodando}
        title="Puxar agora o que mudou no SimbOS"
        className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.1] bg-white px-2.5 py-1.5 text-xs font-medium text-text-secondary shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition hover:border-primary/40 hover:text-primary disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${rodando ? 'animate-spin' : ''}`} />
        {rodando ? 'Sincronizando' : 'Sincronizar SimbOS'}
      </button>
    </div>
  );
}

type TarefaComProjeto = TaskView & { projeto: string; projetoId: string; interno: boolean };

const FILTROS = [
  { id: 'atrasadas', label: 'Atrasadas' },
  { id: 'hoje',      label: 'Hoje' },
  { id: 'semana',    label: 'Esta semana' },
  { id: 'sem_prazo', label: 'Sem prazo' },
  { id: 'todas',     label: 'Todas abertas' },
] as const;
type Filtro = (typeof FILTROS)[number]['id'];

/**
 * Fila de trabalho de todos os projetos junto. Um filtro por vez, lista inteira
 * à vista (nada de recorte de seis dias: atrasado precisa ser visto por completo)
 * e as duas ações que resolvem a linha ali mesmo, concluir e apagar.
 */
function Fila({ tarefas, irPara, pending, send }: {
  tarefas: TarefaComProjeto[];
  irPara: (id: string) => void;
  pending: boolean;
  send: Send;
}) {
  const [filtro, setFiltro] = useState<Filtro>('atrasadas');
  const [soCasa, setSoCasa] = useState<'tudo' | 'clientes' | 'casa'>('tudo');
  const hj = hoje();

  const fimDaSemana = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const porFiltro = (f: Filtro) =>
    tarefas.filter((t) => {
      if (soCasa === 'clientes' && t.interno) return false;
      if (soCasa === 'casa' && !t.interno) return false;
      switch (f) {
        case 'atrasadas': return !!t.dueDate && t.dueDate < hj;
        case 'hoje':      return t.dueDate === hj;
        case 'semana':    return !!t.dueDate && t.dueDate > hj && t.dueDate <= fimDaSemana;
        case 'sem_prazo': return !t.dueDate;
        case 'todas':     return true;
      }
    });

  const lista = porFiltro(filtro).sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));

  return (
    <section className="mb-5 overflow-hidden rounded-md border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <header className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] bg-neutral-50 px-3 py-2">
        {FILTROS.map((f) => {
          const n = porFiltro(f.id).length;
          const ativo = filtro === f.id;
          const alerta = f.id === 'atrasadas' && n > 0;
          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                ativo
                  ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {f.label}
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

        {/* Cliente ou casa: as duas listas competem pelo mesmo dia de trabalho. */}
        <div className="ml-auto flex items-center gap-1 rounded-md bg-black/[0.05] p-0.5">
          {([['tudo', 'Tudo'], ['clientes', 'Clientes'], ['casa', 'Casa']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSoCasa(id)}
              className={`rounded-sm px-2 py-0.5 text-[11px] font-medium transition-colors ${
                soCasa === id ? 'bg-white text-text-primary shadow-[0_1px_1px_rgba(16,24,40,0.08)]' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {lista.length === 0 ? (
        <p className="px-4 py-6 text-center text-[13px] text-text-muted">
          {filtro === 'atrasadas' ? 'Nada atrasado. ' : ''}Nenhuma tarefa neste filtro.
        </p>
      ) : (
        <ul className="divide-y divide-black/[0.05]">
          {lista.map((t) => {
            const atrasada = !!t.dueDate && t.dueDate < hj;
            const ehHoje = t.dueDate === hj;
            return (
              <li key={t.id} className="group flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-black/[0.02]">
                {/* Concluir na própria linha: é a ação mais frequente. */}
                <button
                  onClick={() => send(updateTask, { id: t.id, status: 'feito' })}
                  disabled={pending}
                  title="Marcar como concluída"
                  aria-label="Marcar como concluída"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-black/20 bg-white text-transparent transition-colors hover:border-success hover:text-success disabled:opacity-50"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </button>

                <span className={`h-3.5 w-1 shrink-0 rounded-full ${PRIORITY_TONE[t.priority]}`} title={`Prioridade ${t.priority}`} />

                <button
                  onClick={() => irPara(t.projetoId)}
                  className="min-w-0 flex-1 truncate text-left text-[13px] text-text-primary"
                  title={t.title}
                >
                  {t.title}
                </button>

                <button
                  onClick={() => irPara(t.projetoId)}
                  className="hidden shrink-0 max-w-[12rem] truncate text-[11px] text-text-muted transition-colors hover:text-primary sm:block"
                >
                  {t.projeto}
                </button>

                <span
                  className={`w-16 shrink-0 text-right text-[11px] tabular-nums ${
                    atrasada ? 'font-semibold text-danger' : ehHoje ? 'font-semibold text-primary' : 'text-text-muted'
                  }`}
                >
                  {t.dueDate ? (ehHoje ? 'hoje' : fmtDate(t.dueDate)) : '—'}
                </span>

                <button
                  onClick={() => { if (confirm(`Apagar a tarefa "${t.title}"?`)) send(deleteTask, { id: t.id }); }}
                  disabled={pending}
                  title="Apagar tarefa"
                  aria-label="Apagar tarefa"
                  className="shrink-0 rounded p-1 text-text-muted/50 opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ProjectPanel({ project, aba, setAba, visao, setVisao }: {
  project: ProjectView;
  aba: 'tasks' | 'cronograma';
  setAba: (v: 'tasks' | 'cronograma') => void;
  visao: 'kanban' | 'lista';
  setVisao: (v: 'kanban' | 'lista') => void;
}) {
  const [pending, start] = useTransition();
  const [novaEtapa, setNovaEtapa] = useState(false);

  const send: Send = (action, campos) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(campos)) fd.set(k, v);
    start(() => action(fd));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
          <button onClick={() => setAba('tasks')} className={tabCls(aba === 'tasks')}>Tasks</button>
          <button onClick={() => setAba('cronograma')} className={tabCls(aba === 'cronograma')}>Cronograma</button>
        </div>

        {aba === 'tasks' && (
          <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
            <button onClick={() => setVisao('kanban')} className={tabCls(visao === 'kanban')}>
              <LayoutGrid className="h-3.5 w-3.5" />Kanban
            </button>
            <button onClick={() => setVisao('lista')} className={tabCls(visao === 'lista')}>
              <List className="h-3.5 w-3.5" />Lista
            </button>
          </div>
        )}
      </div>

      {aba === 'tasks' ? (
        visao === 'kanban' ? (
          <KanbanView tasks={project.tasks} phases={project.phases} projectId={project.id} pending={pending} send={send} />
        ) : (
          <ListView tasks={project.tasks} phases={project.phases} projectId={project.id} pending={pending} send={send} />
        )
      ) : (
        <div className="flex flex-col gap-5">
          <Gantt phases={project.phases} tasks={project.tasks} titulo="Linha do tempo" />

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
                action={(fd) => { start(async () => { await createPhase(fd); setNovaEtapa(false); }); }}
                className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-primary/20 bg-primary/[0.03] p-3 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <input type="hidden" name="engagement_id" value={project.id} />
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

      <span className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
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
