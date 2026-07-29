'use client';

// Entregas: as tarefas de cada contrato em Kanban ou Lista, e o cronograma em
// Gantt. Duas faces na mesma tela — aqui você vê tudo; o cliente, pelo link, vê
// só o cronograma com o que estiver marcado como visível.

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  createPhase, updatePhase, deletePhase, movePhase,
  generateClientToken, revokeClientToken,
} from './actions';
import { CalendarClock, ChevronDown, ChevronUp, Eye, EyeOff, LayoutGrid, Link2, List, Plus, Trash2 } from 'lucide-react';
import { PHASE_LABELS, PHASE_STATUSES, type PhaseStatus } from './status';
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

  // O que está em jogo agora, de todos os projetos: a pergunta "o que eu tenho
  // que entregar hoje" não pode exigir abrir projeto por projeto.
  const { atrasadas, deHoje, daSemana } = useMemo(() => {
    const hj = hoje();
    const limite = new Date();
    limite.setDate(limite.getDate() + 7);
    const fimDaSemana = limite.toISOString().slice(0, 10);

    const abertas = projects
      .flatMap((p) =>
        p.tasks.map((t) => ({ ...t, projeto: p.orgName ?? p.title ?? 'Sem nome', projetoId: p.id })),
      )
      .filter((t) => t.status !== 'feito' && !!t.dueDate)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));

    return {
      atrasadas: abertas.filter((t) => t.dueDate! < hj),
      deHoje: abertas.filter((t) => t.dueDate === hj),
      daSemana: abertas.filter((t) => t.dueDate! > hj && t.dueDate! <= fimDaSemana),
    };
  }, [projects]);

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
        <h1 className="text-2xl font-semibold">Entregas</h1>
        <p className="mt-6 rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
          Nenhum contrato ainda. Assim que um negócio for ganho, o projeto aparece aqui para você montar o cronograma.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-5">
        <p className="eyebrow mb-1"><span className="status-dot" />Tarefas e cronograma</p>
        <h1 className="text-2xl font-semibold tracking-tight">Entregas</h1>
      </header>

      <Hoje atrasadas={atrasadas} deHoje={deHoje} daSemana={daSemana} irPara={setAbertoId} />

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

type TarefaComProjeto = TaskView & { projeto: string; projetoId: string };

/**
 * O topo responde "o que eu faço agora": atrasado e de hoje em destaque, a
 * semana logo abaixo em letra menor. Clicar leva para o projeto da tarefa.
 */
function Hoje({ atrasadas, deHoje, daSemana, irPara }: {
  atrasadas: TarefaComProjeto[];
  deHoje: TarefaComProjeto[];
  daSemana: TarefaComProjeto[];
  irPara: (id: string) => void;
}) {
  if (atrasadas.length === 0 && deHoje.length === 0 && daSemana.length === 0) return null;

  const linha = (t: TarefaComProjeto, tom: string) => (
    <li key={t.id}>
      <button
        onClick={() => irPara(t.projetoId)}
        className="flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left transition-colors hover:bg-black/[0.03]"
      >
        <span className={`shrink-0 text-[11px] tabular-nums ${tom}`}>{fmtDate(t.dueDate)}</span>
        <span className="min-w-0 truncate text-[13px] text-text-primary">{t.title}</span>
        <span className="shrink-0 text-[11px] text-text-muted">· {t.projeto}</span>
      </button>
    </li>
  );

  return (
    <section className="mb-5 overflow-hidden rounded-md border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <header className="flex items-center gap-2 border-b border-black/[0.06] bg-neutral-50 px-4 py-2.5">
        <CalendarClock className="h-3.5 w-3.5 text-text-muted" />
        <h2 className="text-[13px] font-semibold text-text-primary">Para hoje</h2>
        {atrasadas.length > 0 && (
          <span className="rounded-full bg-danger/12 px-2 py-0.5 text-[11px] font-semibold text-danger">
            {atrasadas.length} atrasada{atrasadas.length === 1 ? '' : 's'}
          </span>
        )}
        {deHoje.length > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {deHoje.length} vence hoje
          </span>
        )}
      </header>

      <div className="px-3 py-2.5">
        {atrasadas.length > 0 && (
          <ul className="flex flex-col gap-0.5">
            {atrasadas.map((t) => linha(t, 'font-semibold text-danger'))}
          </ul>
        )}
        {deHoje.length > 0 && (
          <ul className={`flex flex-col gap-0.5 ${atrasadas.length > 0 ? 'mt-1.5' : ''}`}>
            {deHoje.map((t) => linha(t, 'font-semibold text-primary'))}
          </ul>
        )}
        {atrasadas.length === 0 && deHoje.length === 0 && (
          <p className="px-1 text-[13px] text-text-muted">Nada atrasado nem vencendo hoje.</p>
        )}

        {daSemana.length > 0 && (
          <details className="mt-2 border-t border-black/[0.06] pt-2">
            <summary className="cursor-pointer px-1 text-[11px] font-medium text-text-muted transition-colors hover:text-text-primary">
              Ainda esta semana ({daSemana.length})
            </summary>
            <ul className="mt-1 flex flex-col gap-0.5">
              {daSemana.map((t) => linha(t, 'text-text-muted'))}
            </ul>
          </details>
        )}
      </div>
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
