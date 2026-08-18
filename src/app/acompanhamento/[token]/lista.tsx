'use client';

// A lista de tarefas como o cliente lê: mesma leitura da lista do /admin (grupos,
// tags, datas, status), sem nada de dentro de casa. Aqui não se edita nada, então
// cada linha é texto e chip, não campo.
//
// O que aparece é escolha do projeto (colunas e agrupamento vêm do /admin), e o
// desenho do cronograma, quando ligado, fica numa aba ao lado: a pergunta do
// cliente quase sempre é "o que falta", e isso é lista, não gráfico.

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { PRIORITY_LABELS, TAG_TOM, corDaTag, type Priority, type TaskStatus } from '@/app/admin/(app)/entregas/status';
import type { ColunaCliente, PhaseView, TaskView } from '@/app/admin/(app)/entregas/types';
import { Gantt } from '@/app/admin/(app)/entregas/gantt';

/** Status em português de cliente: ninguém de fora fala "backlog" nem "review". */
const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Na fila',
  a_fazer: 'A fazer',
  fazendo: 'Em andamento',
  revisao: 'Em revisão',
  feito: 'Entregue',
};

const STATUS_TOM: Record<TaskStatus, string> = {
  backlog: 'bg-black/[0.04] text-text-muted',
  a_fazer: 'bg-black/[0.05] text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  feito: 'bg-success/12 text-[#15803D]',
};

const STATUS_DOT: Record<TaskStatus, string> = {
  backlog: 'bg-neutral-300',
  a_fazer: 'bg-neutral-400',
  fazendo: 'bg-primary',
  revisao: 'bg-warning',
  feito: 'bg-success',
};

const URGENCIA_TOM: Record<Priority, string> = {
  baixa: 'bg-black/[0.04] text-text-muted',
  media: 'bg-black/[0.05] text-text-secondary',
  alta: 'bg-warning/15 text-[#B45309]',
  urgente: 'bg-danger/10 text-danger',
};

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fmtData = (d: string | null): string => {
  if (!d) return '—';
  const [, m, dia] = d.split('-');
  return `${Number(dia)} ${MESES[Number(m) - 1]}`;
};

export type TagCliente = { id: string; nome: string; cor: string };

type Filtro = 'aberto' | 'entregue' | 'tudo';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'aberto', label: 'Em aberto' },
  { id: 'entregue', label: 'Entregue' },
  { id: 'tudo', label: 'Tudo' },
];

export function Acompanhamento({ phases, tasks, tags, colunas, agrupar, cronograma }: {
  phases: PhaseView[];
  tasks: TaskView[];
  tags: TagCliente[];
  colunas: ColunaCliente[];
  agrupar: 'sprint' | 'status' | 'nenhum';
  cronograma: boolean;
}) {
  const [aba, setAba] = useState<'lista' | 'cronograma'>('lista');
  const [filtro, setFiltro] = useState<Filtro>('aberto');

  const macros = tasks.filter((t) => !t.parentId);
  const subs = (id: string) => tasks.filter((t) => t.parentId === id).sort(porPrazo);

  // Coluna configurada mas sem nada dentro é buraco na tela: se ninguém tem tag
  // (ou responsável, ou data), ela não aparece.
  const usadas = colunas.filter((c) => {
    if (c === 'tags') return tasks.some((t) => t.tagIds.length > 0) && tags.length > 0;
    if (c === 'responsavel') return tasks.some((t) => !!t.assignee);
    if (c === 'inicio') return tasks.some((t) => !!t.startDate);
    if (c === 'prazo') return tasks.some((t) => !!t.dueDate);
    return true;
  });

  const passa = (t: TaskView) =>
    filtro === 'tudo' || (filtro === 'entregue' ? t.status === 'feito' : t.status !== 'feito');

  // Entrega entregue com filho em aberto continua aparecendo em "em aberto": o
  // que interessa é se ainda tem trabalho ali dentro.
  const visiveis = macros.filter((t) => passa(t) || subs(t.id).some(passa));

  const grupos = montarGrupos(visiveis, phases, agrupar);
  const abertas = macros.filter((t) => t.status !== 'feito').length;
  const entregues = macros.length - abertas;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {cronograma ? (
          <div className="flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
            <button onClick={() => setAba('lista')} className={abaCls(aba === 'lista')}>Tarefas</button>
            <button onClick={() => setAba('cronograma')} className={abaCls(aba === 'cronograma')}>Cronograma</button>
          </div>
        ) : (
          <h2 className="text-sm font-semibold text-text-primary">Tarefas</h2>
        )}

        {aba === 'lista' && (
          <div className="flex items-center gap-1 rounded-md border border-black/[0.07] bg-white p-1">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  filtro === f.id ? 'bg-black/[0.06] text-text-primary' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {f.label}
                <span className="ml-1.5 text-[10px] tabular-nums text-text-muted">
                  {f.id === 'aberto' ? abertas : f.id === 'entregue' ? entregues : macros.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {aba === 'cronograma' ? (
        <Gantt modoCliente titulo="Cronograma" phases={phases} tasks={tasks} />
      ) : grupos.length === 0 ? (
        <p className="rounded-lg border border-black/[0.07] bg-white px-4 py-10 text-center text-sm text-text-muted">
          {filtro === 'entregue' ? 'Nada entregue ainda.' : 'Nada em aberto por aqui.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {grupos.map((g, i) => (
            <Grupo
              key={g.chave}
              grupo={g}
              colunas={usadas}
              tags={tags}
              subs={subs}
              passa={passa}
              // O nome das colunas aparece uma vez, no topo: repetido em cada
              // grupo, virava ruído com dez sprints na tela.
              comCabecalho={i === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const abaCls = (ativo: boolean) =>
  `rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
    ativo ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]' : 'text-text-muted hover:text-text-primary'
  }`;

const porPrazo = (a: TaskView, b: TaskView) =>
  (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || a.sort - b.sort;

type GrupoLista = {
  chave: string;
  titulo: string;
  periodo: string | null;
  tarefas: TaskView[];
};

/** Os grupos da lista, do jeito que o projeto pediu. */
function montarGrupos(
  macros: TaskView[],
  phases: PhaseView[],
  agrupar: 'sprint' | 'status' | 'nenhum',
): GrupoLista[] {
  const ordenadas = [...macros].sort(porPrazo);

  if (agrupar === 'sprint' && phases.length > 0) {
    const grupos = phases.map((p) => ({
      chave: p.id,
      titulo: p.name,
      periodo: p.startDate || p.endDate
        ? `${fmtData(p.startDate)} a ${fmtData(p.endDate)}`
        : null,
      tarefas: ordenadas.filter((t) => t.phaseId === p.id),
    }));
    const soltas = ordenadas.filter((t) => !t.phaseId || !phases.some((p) => p.id === t.phaseId));
    if (soltas.length > 0) {
      grupos.push({ chave: 'outras', titulo: 'Outras entregas', periodo: null, tarefas: soltas });
    }
    return grupos.filter((g) => g.tarefas.length > 0);
  }

  if (agrupar === 'status') {
    const ordem: TaskStatus[] = ['fazendo', 'revisao', 'a_fazer', 'backlog', 'feito'];
    return ordem
      .map((s) => ({
        chave: s,
        titulo: STATUS_LABELS[s],
        periodo: null,
        tarefas: ordenadas.filter((t) => t.status === s),
      }))
      .filter((g) => g.tarefas.length > 0);
  }

  return ordenadas.length > 0
    ? [{ chave: 'tudo', titulo: 'Entregas', periodo: null, tarefas: ordenadas }]
    : [];
}

function Grupo({ grupo, colunas, tags, subs, passa, comCabecalho }: {
  grupo: GrupoLista;
  colunas: ColunaCliente[];
  tags: TagCliente[];
  subs: (id: string) => TaskView[];
  passa: (t: TaskView) => boolean;
  comCabecalho: boolean;
}) {
  const [fechado, setFechado] = useState(false);
  const prontas = grupo.tarefas.filter((t) => t.status === 'feito').length;
  const total = grupo.tarefas.length;

  return (
    <section className="overflow-hidden rounded-lg border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-black/[0.06] bg-neutral-50/80 px-3 py-2.5">
        <button
          onClick={() => setFechado((v) => !v)}
          aria-label={fechado ? 'Abrir grupo' : 'Fechar grupo'}
          aria-expanded={!fechado}
          className="rounded p-0.5 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
        >
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${fechado ? '' : 'rotate-90'}`} />
        </button>
        <h3 className="text-[13px] font-semibold text-text-primary">{grupo.titulo}</h3>
        {grupo.periodo && <span className="text-[11px] text-text-muted">{grupo.periodo}</span>}

        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[11px] tabular-nums text-text-muted">{prontas}/{total}</span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-black/[0.07]">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${total ? (prontas / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </header>

      {!fechado && (
        <div className="overflow-x-auto">
          {/* Largura fixa por coluna: assim um grupo não desalinha do outro,
              mesmo cada grupo sendo a sua própria tabela. */}
          <table className="w-full min-w-[44rem] table-fixed border-collapse text-sm">
            <colgroup>
              <col />
              {colunas.includes('tags') && <col className="w-40" />}
              {colunas.includes('inicio') && <col className="w-20" />}
              {colunas.includes('prazo') && <col className="w-20" />}
              {colunas.includes('urgencia') && <col className="w-24" />}
              {colunas.includes('responsavel') && <col className="w-36" />}
              {colunas.includes('status') && <col className="w-36" />}
            </colgroup>
            {comCabecalho && (
              <thead>
                <tr className="border-b border-black/[0.05]">
                  <Th>Entrega</Th>
                  {colunas.includes('tags') && <Th>Tags</Th>}
                  {colunas.includes('inicio') && <Th>Início</Th>}
                  {colunas.includes('prazo') && <Th>Prazo</Th>}
                  {colunas.includes('urgencia') && <Th>Urgência</Th>}
                  {colunas.includes('responsavel') && <Th>Responsável</Th>}
                  {colunas.includes('status') && <Th>Status</Th>}
                </tr>
              </thead>
            )}
            <tbody>
              {grupo.tarefas.flatMap((t) => {
                const filhas = subs(t.id).filter((f) => passa(f) || t.status !== 'feito');
                return [
                  <Linha key={t.id} task={t} colunas={colunas} tags={tags} filhas={filhas.length} />,
                  ...filhas.map((f) => (
                    <Linha key={f.id} task={f} colunas={colunas} tags={tags} filhas={0} filha />
                  )),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`${className} px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-text-muted`}>
      {children}
    </th>
  );
}

function Linha({ task, colunas, tags, filhas, filha = false }: {
  task: TaskView;
  colunas: ColunaCliente[];
  tags: TagCliente[];
  filhas: number;
  filha?: boolean;
}) {
  const minhasTags = tags.filter((tg) => task.tagIds.includes(tg.id));

  return (
    <tr className={`border-b border-black/[0.04] last:border-0 ${filha ? 'bg-neutral-50/40' : ''}`}>
      <td className="px-3 py-2.5">
        <div className={`flex min-w-0 items-start gap-2 ${filha ? 'pl-5' : ''}`}>
          <span
            title={STATUS_LABELS[task.status]}
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[task.status]}`}
          />
          <span
            className={`text-[13px] leading-snug ${
              task.status === 'feito'
                ? 'text-text-muted'
                : filha ? 'text-text-secondary' : 'text-text-primary'
            }`}
          >
            {task.title}
          </span>
          {filhas > 0 && (
            <span className="mt-0.5 shrink-0 rounded-full bg-black/[0.05] px-1.5 text-[10px] tabular-nums text-text-muted">
              {filhas} {filhas === 1 ? 'parte' : 'partes'}
            </span>
          )}
        </div>
      </td>

      {colunas.includes('tags') && (
        <td className="px-3 py-2.5">
          <div className="flex flex-wrap gap-1">
            {minhasTags.map((tg) => (
              <span
                key={tg.id}
                className={`inline-flex max-w-[8rem] items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TAG_TOM[corDaTag(tg.cor)]}`}
              >
                <span className="truncate">{tg.nome}</span>
              </span>
            ))}
          </div>
        </td>
      )}

      {colunas.includes('inicio') && <Td>{fmtData(task.startDate)}</Td>}
      {colunas.includes('prazo') && <Td>{fmtData(task.dueDate)}</Td>}

      {colunas.includes('urgencia') && (
        <td className="px-3 py-2.5">
          <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${URGENCIA_TOM[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        </td>
      )}

      {colunas.includes('responsavel') && (
        <td className="truncate px-3 py-2.5 text-[12px] text-text-secondary" title={task.assignee ?? undefined}>
          {task.assignee ?? '—'}
        </td>
      )}

      {colunas.includes('status') && (
        <td className="px-3 py-2.5">
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_TOM[task.status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[task.status]}`} />
            {STATUS_LABELS[task.status]}
          </span>
        </td>
      )}
    </tr>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2.5 font-mono text-[11px] tabular-nums text-text-muted">{children}</td>;
}
