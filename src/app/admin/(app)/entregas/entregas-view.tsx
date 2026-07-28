'use client';

// Entregas: as tarefas de cada contrato em Kanban ou Lista, e o cronograma em
// Gantt. Duas faces na mesma tela — aqui você vê tudo; o cliente, pelo link, vê
// só o cronograma com o que estiver marcado como visível.

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  createPhase, updatePhase, deletePhase, movePhase,
  generateClientToken, revokeClientToken,
} from './actions';
import { PHASE_LABELS, type PhaseStatus } from './status';
import type { PhaseView, ProjectView, Send, TaskView } from './types';
import { KanbanView } from './kanban-view';
import { ListView } from './list-view';
import { Gantt } from './gantt';
import { DateCell, InlineText, fmtDate, hoje, inputCls } from './ui';

export type { PhaseView, ProjectView, TaskView } from './types';

const PREF_VISAO = 'notkode.entregas.visao';

const PHASE_DOT: Record<PhaseStatus, string> = {
  pendente: 'bg-black/15',
  em_andamento: 'bg-primary',
  concluida: 'bg-success',
  pausada: 'bg-warning',
};

const tabCls = (ativo: boolean) =>
  `rounded-md px-3 py-1.5 font-label text-[11px] uppercase tracking-wider transition-colors ${
    ativo ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-primary'
  }`;

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

  // Tudo que vence nos próximos dias, de todos os projetos: a pergunta "o que
  // eu tenho que entregar essa semana" não pode exigir abrir projeto por projeto.
  const daSemana = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() + 7);
    const limiteStr = limite.toISOString().slice(0, 10);
    return projects
      .flatMap((p) => p.tasks.map((t) => ({ ...t, projeto: p.orgName ?? p.title ?? 'Sem nome' })))
      .filter((t) => t.status !== 'feito' && t.dueDate && t.dueDate <= limiteStr)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  }, [projects]);

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
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1"><span className="status-dot" />Tarefas e cronograma</p>
          <h1 className="text-2xl font-semibold tracking-tight">Entregas</h1>
        </div>

        <select
          value={abertoId ?? ''}
          onChange={(e) => setAbertoId(e.target.value)}
          className={`${inputCls} w-auto min-w-[14rem]`}
          aria-label="Projeto"
        >
          {projects.map((p) => {
            const feitas = p.tasks.filter((t) => t.status === 'feito').length;
            return (
              <option key={p.id} value={p.id}>
                {p.orgName ?? p.title ?? 'Sem cliente'}
                {p.tasks.length > 0 ? ` · ${feitas}/${p.tasks.length}` : ''}
              </option>
            );
          })}
        </select>
      </header>

      {daSemana.length > 0 && (
        <section className="mb-5 rounded-md border border-warning/30 bg-warning/[0.05] px-4 py-3">
          <p className="mb-2 font-label text-[11px] uppercase tracking-wider text-text-secondary">
            Vence nos próximos 7 dias ({daSemana.length})
          </p>
          <ul className="flex flex-col gap-1">
            {daSemana.map((t) => {
              const atrasada = !!t.dueDate && t.dueDate < hoje();
              return (
                <li key={t.id} className="flex items-baseline gap-2 text-sm">
                  <span className={`font-label text-[11px] tabular-nums ${atrasada ? 'font-semibold text-danger' : 'text-text-muted'}`}>
                    {fmtDate(t.dueDate)}
                  </span>
                  <span className="text-text-primary">{t.title}</span>
                  <span className="font-label text-[11px] text-text-muted">· {t.projeto}</span>
                  {atrasada && <span className="font-label text-[10px] uppercase tracking-wider text-danger">atrasada</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
        <div className="flex items-center gap-1 rounded-md border border-black/[0.06] bg-white p-1">
          <button onClick={() => setAba('tasks')} className={tabCls(aba === 'tasks')}>Tasks</button>
          <button onClick={() => setAba('cronograma')} className={tabCls(aba === 'cronograma')}>Cronograma</button>
        </div>

        {aba === 'tasks' && (
          <div className="flex items-center gap-1 rounded-md border border-black/[0.06] bg-white p-1">
            <button onClick={() => setVisao('kanban')} className={tabCls(visao === 'kanban')}>Kanban</button>
            <button onClick={() => setVisao('lista')} className={tabCls(visao === 'lista')}>Lista</button>
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
              <h2 className="font-label text-[11px] uppercase tracking-[0.14em] text-text-secondary">
                Etapas do cronograma
              </h2>
              <button
                onClick={() => setNovaEtapa((v) => !v)}
                className="rounded-md border border-black/[0.1] px-2.5 py-1 text-xs font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
              >
                {novaEtapa ? 'Cancelar' : '+ Etapa'}
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
    <section className="rounded-md border border-black/[0.06] bg-white px-4 py-3">
      <p className="font-label text-[11px] uppercase tracking-wider text-text-muted">Acompanhamento do cliente</p>
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
            className="font-label text-[10px] uppercase tracking-wider text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50"
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
    <li className="flex flex-wrap items-center gap-2 rounded-md border border-black/[0.06] bg-white px-3 py-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${PHASE_DOT[phase.status]}`} />

      <InlineText
        value={phase.name}
        onSave={(v) => send(updatePhase, { id: phase.id, name: v })}
        className="min-w-0 flex-1 text-sm font-medium text-text-primary"
      />

      <DateCell value={phase.startDate} onSave={(v) => send(updatePhase, { id: phase.id, start_date: v })} placeholder="início" />
      <span className="font-label text-[11px] text-text-muted">a</span>
      <DateCell value={phase.endDate} onSave={(v) => send(updatePhase, { id: phase.id, end_date: v })} atrasada={atrasada} placeholder="fim" />

      {tarefas > 0 && <span className="font-label text-[11px] text-text-muted">· {tarefas} tarefa{tarefas === 1 ? '' : 's'}</span>}

      <select
        value={phase.status}
        onChange={(e) => send(updatePhase, { id: phase.id, status: e.target.value })}
        disabled={pending}
        className="rounded border border-black/[0.08] bg-white px-1.5 py-1 font-label text-[11px] text-text-secondary"
      >
        {(Object.keys(PHASE_LABELS) as PhaseStatus[]).map((s) => (
          <option key={s} value={s}>{PHASE_LABELS[s]}</option>
        ))}
      </select>

      {/* Visível para o cliente: a etapa aparece (ou não) no link de acompanhamento. */}
      <button
        onClick={() => send(updatePhase, { id: phase.id, client_visible: phase.clientVisible ? 'off' : 'on' })}
        disabled={pending}
        title={phase.clientVisible ? 'O cliente vê esta etapa' : 'Etapa interna: o cliente não vê'}
        className={`rounded px-1.5 py-1 font-label text-[10px] uppercase tracking-wider transition-colors ${
          phase.clientVisible ? 'bg-primary/10 text-primary' : 'bg-black/[0.05] text-text-muted'
        }`}
      >
        {phase.clientVisible ? 'cliente vê' : 'interna'}
      </button>

      <span className="flex items-center gap-0.5">
        <button onClick={() => send(movePhase, { id: phase.id, dir: 'up' })} disabled={pending || primeira} className="rounded px-1 text-text-muted transition hover:bg-black/[0.04] hover:text-text-primary disabled:opacity-25" aria-label="Subir">↑</button>
        <button onClick={() => send(movePhase, { id: phase.id, dir: 'down' })} disabled={pending || ultima} className="rounded px-1 text-text-muted transition hover:bg-black/[0.04] hover:text-text-primary disabled:opacity-25" aria-label="Descer">↓</button>
      </span>

      <button
        onClick={() => { if (confirm(`Apagar a etapa "${phase.name}"? As tarefas dela viram tarefas sem etapa.`)) send(deletePhase, { id: phase.id }); }}
        disabled={pending}
        className="font-label text-[14px] leading-none text-text-muted/40 transition hover:text-danger disabled:opacity-30"
        aria-label="Apagar etapa"
      >
        ×
      </button>
    </li>
  );
}
