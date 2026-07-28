'use client';

// Entregas: o cronograma e as tarefas de cada contrato. Duas faces na mesma tela —
// aqui você vê tudo; o cliente vê, pelo link, só o que estiver marcado como visível.

import { useMemo, useRef, useState, useTransition } from 'react';
import {
  createPhase, updatePhase, deletePhase, movePhase,
  createTask, updateTask, deleteTask,
  generateClientToken, revokeClientToken,
} from './actions';
import {
  PHASE_LABELS, TASK_LABELS, TASK_ORDER, TASK_STATUSES,
  type PhaseStatus, type TaskStatus,
} from './status';

export type PhaseView = {
  id: string; name: string; description: string | null; status: PhaseStatus;
  startDate: string | null; endDate: string | null; clientVisible: boolean;
};
export type TaskView = {
  id: string; phaseId: string | null; title: string; notes: string | null;
  status: TaskStatus; dueDate: string | null; assignee: string | null; clientVisible: boolean;
};
export type ProjectView = {
  id: string; title: string | null; orgName: string | null; lifecycle: string;
  startDate: string | null; endDate: string | null; clientUrl: string | null;
  phases: PhaseView[]; tasks: TaskView[];
};

const fmtDate = (d: string | null) => {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y.slice(2)}`;
};
const hoje = () => new Date().toISOString().slice(0, 10);

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

const PHASE_DOT: Record<PhaseStatus, string> = {
  pendente: 'bg-black/15',
  em_andamento: 'bg-primary',
  concluida: 'bg-success',
  pausada: 'bg-warning',
};

export function EntregasView({ projects }: { projects: ProjectView[] }) {
  const [abertoId, setAbertoId] = useState<string | null>(projects[0]?.id ?? null);
  const aberto = projects.find((p) => p.id === abertoId) ?? null;

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
      <header className="mb-5">
        <p className="eyebrow mb-1"><span className="status-dot" />Cronograma e tarefas</p>
        <h1 className="text-2xl font-semibold tracking-tight">Entregas</h1>
      </header>

      {daSemana.length > 0 && (
        <section className="mb-6 rounded-md border border-warning/30 bg-warning/[0.05] px-4 py-3">
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

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Projetos */}
        <nav className="flex shrink-0 flex-col gap-1 lg:w-64">
          {projects.map((p) => {
            const feitas = p.tasks.filter((t) => t.status === 'feito').length;
            const ativo = p.id === abertoId;
            return (
              <button
                key={p.id}
                onClick={() => setAbertoId(p.id)}
                className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                  ativo ? 'border-primary/40 bg-primary/[0.06]' : 'border-black/[0.06] bg-white hover:border-black/15'
                }`}
              >
                <p className="text-sm font-medium text-text-primary">{p.orgName ?? 'Sem cliente'}</p>
                <p className="font-label text-[11px] text-text-muted">{p.title ?? '—'}</p>
                <p className="mt-1 font-label text-[10px] text-text-muted/80">
                  {p.phases.length} etapa{p.phases.length === 1 ? '' : 's'}
                  {p.tasks.length > 0 && ` · ${feitas}/${p.tasks.length} tarefas`}
                </p>
              </button>
            );
          })}
        </nav>

        {aberto && <ProjectPanel key={aberto.id} project={aberto} />}
      </div>
    </div>
  );
}

function ProjectPanel({ project }: { project: ProjectView }) {
  const [pending, start] = useTransition();
  const [novaEtapa, setNovaEtapa] = useState(false);

  const soltas = project.tasks.filter((t) => !t.phaseId);
  const send = (action: (fd: FormData) => Promise<void>, campos: Record<string, string>) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(campos)) fd.set(k, v);
    start(() => action(fd));
  };

  return (
    <div className="min-w-0 flex-1">
      {/* Link do cliente */}
      <section className="mb-5 rounded-md border border-black/[0.06] bg-white px-4 py-3">
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
              Gere um link para o cliente acompanhar o cronograma. Ele vê só o que estiver marcado como visível, sem login.
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

      {/* Etapas */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-label text-[11px] uppercase tracking-[0.14em] text-text-secondary">Cronograma</h2>
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

      {project.phases.length === 0 && !novaEtapa && (
        <p className="mb-4 rounded-md border border-black/[0.06] bg-white px-4 py-6 text-center text-sm text-text-muted">
          Sem etapas ainda. Monte o cronograma e o cliente passa a ter o que acompanhar.
        </p>
      )}

      <ol className="mb-6 flex flex-col gap-2">
        {project.phases.map((phase, i) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            projectId={project.id}
            tasks={project.tasks.filter((t) => t.phaseId === phase.id)}
            primeira={i === 0}
            ultima={i === project.phases.length - 1}
            pending={pending}
            send={send}
          />
        ))}
      </ol>

      {/* Tarefas sem etapa */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-label text-[11px] uppercase tracking-[0.14em] text-text-secondary">
          Tarefas sem etapa {soltas.length > 0 && `(${soltas.length})`}
        </h2>
      </div>
      <TaskList tasks={soltas} projectId={project.id} phaseId={null} pending={pending} send={send} />
    </div>
  );
}

function PhaseCard({ phase, projectId, tasks, primeira, ultima, pending, send }: {
  phase: PhaseView;
  projectId: string;
  tasks: TaskView[];
  primeira: boolean;
  ultima: boolean;
  pending: boolean;
  send: (action: (fd: FormData) => Promise<void>, campos: Record<string, string>) => void;
}) {
  const [aberta, setAberta] = useState(true);
  const feitas = tasks.filter((t) => t.status === 'feito').length;
  const atrasada = !!phase.endDate && phase.endDate < hoje() && phase.status !== 'concluida';

  return (
    <li className="rounded-md border border-black/[0.06] bg-white">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${PHASE_DOT[phase.status]}`} />
        <button onClick={() => setAberta((v) => !v)} className="min-w-0 flex-1 text-left">
          <span className="text-sm font-medium text-text-primary">{phase.name}</span>
          {(phase.startDate || phase.endDate) && (
            <span className={`ml-2 font-label text-[11px] ${atrasada ? 'font-semibold text-danger' : 'text-text-muted'}`}>
              {fmtDate(phase.startDate) ?? '—'} a {fmtDate(phase.endDate) ?? '—'}
              {atrasada && ' · atrasada'}
            </span>
          )}
          {tasks.length > 0 && (
            <span className="ml-2 font-label text-[11px] text-text-muted">· {feitas}/{tasks.length}</span>
          )}
        </button>

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
      </div>

      {aberta && (
        <div className="border-t border-black/[0.05] px-3 py-2.5">
          <TaskList tasks={tasks} projectId={projectId} phaseId={phase.id} pending={pending} send={send} />
          <button
            onClick={() => { if (confirm(`Apagar a etapa "${phase.name}"? As tarefas dela viram tarefas sem etapa.`)) send(deletePhase, { id: phase.id }); }}
            disabled={pending}
            className="mt-2 font-label text-[10px] uppercase tracking-wider text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50"
          >
            apagar etapa
          </button>
        </div>
      )}
    </li>
  );
}

function TaskList({ tasks, projectId, phaseId, pending, send }: {
  tasks: TaskView[];
  projectId: string;
  phaseId: string | null;
  pending: boolean;
  send: (action: (fd: FormData) => Promise<void>, campos: Record<string, string>) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const ordenadas = [...tasks].sort(
    (a, b) => TASK_ORDER[a.status] - TASK_ORDER[b.status] || (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'),
  );

  return (
    <div>
      <ul className="flex flex-col">
        {ordenadas.map((t) => {
          const atrasada = !!t.dueDate && t.dueDate < hoje() && t.status !== 'feito';
          return (
            <li key={t.id} className="group flex flex-wrap items-center gap-2 border-b border-black/[0.04] py-1.5 last:border-0">
              <input
                type="checkbox"
                checked={t.status === 'feito'}
                onChange={(e) => send(updateTask, { id: t.id, status: e.target.checked ? 'feito' : 'a_fazer' })}
                disabled={pending}
                className="h-3.5 w-3.5 shrink-0 accent-success"
                aria-label="Concluir tarefa"
              />
              <span className={`min-w-0 flex-1 text-sm ${t.status === 'feito' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                {t.title}
              </span>

              {t.assignee && <span className="font-label text-[10px] text-text-muted">{t.assignee}</span>}
              {t.dueDate && (
                <span className={`font-label text-[11px] tabular-nums ${atrasada ? 'font-semibold text-danger' : 'text-text-muted'}`}>
                  {fmtDate(t.dueDate)}
                </span>
              )}

              <select
                value={t.status}
                onChange={(e) => send(updateTask, { id: t.id, status: e.target.value })}
                disabled={pending}
                className="rounded border border-black/[0.08] bg-white px-1 py-0.5 font-label text-[10px] text-text-secondary"
              >
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_LABELS[s]}</option>)}
              </select>

              <button
                onClick={() => send(deleteTask, { id: t.id })}
                disabled={pending}
                className="font-label text-[14px] leading-none text-text-muted/40 opacity-0 transition group-hover:opacity-100 hover:text-danger disabled:opacity-30"
                aria-label="Apagar tarefa"
                title="Apagar tarefa"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>

      {/* Cadastro em sequência: envia, limpa e o cursor volta pro título. */}
      <form
        ref={formRef}
        action={(fd) => {
          const title = String(fd.get('title') ?? '').trim();
          if (!title) return;
          send(createTask, {
            engagement_id: projectId,
            ...(phaseId ? { phase_id: phaseId } : {}),
            title,
            assignee: String(fd.get('assignee') ?? ''),
            due_date: String(fd.get('due_date') ?? ''),
          });
          formRef.current?.reset();
        }}
        className="mt-1.5 flex flex-wrap items-center gap-2"
      >
        <input name="title" required placeholder="+ nova tarefa" className={`${inputCls} min-w-0 flex-1`} />
        <input name="assignee" placeholder="quem" className={`${inputCls} w-24`} />
        <input name="due_date" type="date" className={`${inputCls} w-36`} title="Prazo" />
      </form>
    </div>
  );
}
