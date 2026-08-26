'use client';

// A mesma lista que a casa usa no /admin, do lado do cliente e só de ler: os
// mesmos números em cima, o mesmo filtro de prazo, os mesmos grupos e as mesmas
// colunas, com os mesmos chips. Foi o pedido, e faz sentido: quem explica o
// projeto no WhatsApp e quem acompanha estão olhando a mesma coisa.
//
// O que muda deste lado: nada se edita, o cronômetro não existe, os rótulos
// falam português de cliente ("Em andamento", não "In progress") e o desenho do
// cronograma fecha a página, embaixo da lista.

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { TASK_DOT, type TaskStatus } from '@/app/admin/(app)/entregas/status';
import { COLUNA_LABELS_CLIENTE } from '@/app/admin/(app)/entregas/types';
import type { Coluna, PhaseView, TaskView } from '@/app/admin/(app)/entregas/types';
import { DateTag, PriorityTag, Sigla, TagChip, hoje, somaDias } from '@/app/admin/(app)/entregas/ui';
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
  backlog: 'bg-black/[0.03] text-text-muted',
  a_fazer: 'bg-neutral-100 text-text-secondary',
  fazendo: 'bg-primary/10 text-primary',
  revisao: 'bg-warning/15 text-[#B45309]',
  feito: 'bg-success/12 text-[#15803D]',
};

/** A ordem dos blocos, igual à da casa: o que está em jogo primeiro. */
const BLOCOS: TaskStatus[] = ['a_fazer', 'fazendo', 'revisao', 'backlog', 'feito'];

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fmtCurto = (d: string | null): string | null => {
  if (!d) return null;
  const [, m, dia] = d.split('-');
  return `${Number(dia)} ${MESES[Number(m) - 1]}`;
};

export type TagCliente = { id: string; nome: string; cor: string };

const PERIODOS = [
  { id: 'tudo', label: 'Tudo' },
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
  { id: 'sem_prazo', label: 'Sem prazo' },
] as const;
type Periodo = (typeof PERIODOS)[number]['id'];

/** Recorte por prazo, igual ao da casa (sem "atrasadas", que é cobrança interna). */
function recortar(tarefas: TaskView[], periodo: Periodo): TaskView[] {
  const hj = hoje();
  const fimSemana = somaDias(hj, 7);
  const mes = hj.slice(0, 7);

  return tarefas.filter((t) => {
    switch (periodo) {
      case 'tudo': return true;
      case 'hoje': return t.dueDate === hj;
      case 'semana': return !!t.dueDate && t.dueDate >= hj && t.dueDate <= fimSemana;
      case 'mes': return !!t.dueDate && t.dueDate.slice(0, 7) === mes;
      case 'sem_prazo': return !t.dueDate;
      default: return true;
    }
  });
}

const porPrazo = (a: TaskView, b: TaskView) =>
  (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || a.sort - b.sort;

const ordenar = (lista: TaskView[]) => [...lista].sort(porPrazo);

export function Acompanhamento({ phases, tasks, tags, colunas, agrupar, cronograma }: {
  phases: PhaseView[];
  tasks: TaskView[];
  tags: TagCliente[];
  /** As mesmas colunas ligadas na lista da casa, menos as internas. */
  colunas: Coluna[];
  agrupar: 'sprint' | 'status';
  cronograma: boolean;
}) {
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const [dobra, setDobra] = useState<Record<string, boolean>>({});
  // As partes de uma entrega nascem escondidas aqui: quem abre o link quer
  // primeiro a lista do que foi combinado, e abre o detalhe da entrega que
  // interessa. Na tela da casa é o contrário, porque lá o detalhe é o trabalho.
  const [abertas, setAbertas] = useState<string[]>([]);

  const macros = tasks.filter((t) => !t.parentId);
  const subs = (id: string) => ordenar(tasks.filter((t) => t.parentId === id));

  // Coluna ligada mas sem nada dentro é buraco na tela.
  const usadas = colunas.filter((c) => {
    if (c === 'tags') return tags.length > 0 && tasks.some((t) => t.tagIds.length > 0);
    if (c === 'quem') return tasks.some((t) => !!t.assignee);
    if (c === 'inicio') return tasks.some((t) => !!t.startDate);
    if (c === 'prazo') return tasks.some((t) => !!t.dueDate);
    // O cronômetro é da casa: não existe deste lado.
    return c !== 'tempo';
  });

  const filtradas = recortar(macros, periodo);
  const conta = (s: TaskStatus) => macros.filter((t) => t.status === s).length;

  const grupos = agrupar === 'sprint' && phases.length > 0
    ? [
      ...phases.map((p) => ({
        chave: p.id,
        titulo: p.name,
        periodo: p.startDate || p.endDate
          ? `${fmtCurto(p.startDate) ?? '—'} a ${fmtCurto(p.endDate) ?? '—'}`
          : null,
        tom: 'bg-neutral-100 text-text-secondary',
        dot: null as string | null,
        tarefas: ordenar(filtradas.filter((t) => t.phaseId === p.id)),
      })),
      {
        chave: 'outras',
        titulo: 'Outras entregas',
        periodo: null,
        tom: 'bg-black/[0.03] text-text-muted',
        dot: null as string | null,
        tarefas: ordenar(filtradas.filter((t) => !t.phaseId || !phases.some((p) => p.id === t.phaseId))),
      },
    ]
    : BLOCOS.map((s) => ({
      chave: s,
      titulo: STATUS_LABELS[s],
      periodo: null,
      tom: STATUS_TOM[s],
      dot: TASK_DOT[s] as string | null,
      tarefas: ordenar(filtradas.filter((t) => t.status === s)),
    }));

  return (
    <>
      {/* Os mesmos cartões de cima da lista da casa, sem o cronômetro e sem
          "atrasadas": prazo estourado é conversa nossa com o cliente, não um
          carimbo vermelho que ele encontra sozinho. */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Numero titulo="A fazer" valor={conta('a_fazer') + conta('backlog')} />
        <Numero titulo="Em andamento" valor={conta('fazendo')} tom="text-primary" />
        <Numero titulo="Em revisão" valor={conta('revisao')} />
        <Numero titulo="Entregues" valor={conta('feito')} tom="text-success" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1 rounded-md border border-black/[0.07] bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        {PERIODOS.map((p) => {
          const n = recortar(macros, p.id).length;
          const ativo = periodo === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                ativo ? 'bg-black/[0.06] text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {p.label}
              <span className="rounded-full bg-black/[0.06] px-1.5 text-[10px] tabular-nums text-text-muted">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {grupos.map((g) => {
          // Grupo vazio (e o de entregues) nasce fechado: uma faixa fina em vez
          // de um "nada aqui" ocupando a tela.
          const fechado = dobra[g.chave] ?? (g.tarefas.length === 0 || g.chave === 'feito');
          const prontas = g.tarefas.filter((t) => t.status === 'feito').length;

          return (
            <section
              key={g.chave}
              className="overflow-hidden rounded-md border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
            >
              <header className="flex items-center gap-2 border-b border-black/[0.06] bg-neutral-50 px-3 py-2">
                <button
                  onClick={() => setDobra((d) => ({ ...d, [g.chave]: !fechado }))}
                  aria-label={fechado ? 'Abrir grupo' : 'Fechar grupo'}
                  aria-expanded={!fechado}
                  className="rounded p-0.5 text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary"
                >
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${fechado ? '' : 'rotate-90'}`} />
                </button>

                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${g.tom}`}>
                  {g.dot && <span className={`h-1.5 w-1.5 rounded-full ${g.dot}`} />}
                  {g.titulo}
                </span>
                {g.periodo && <span className="text-[11px] text-text-muted">{g.periodo}</span>}
                <span className="text-[11px] tabular-nums text-text-muted">
                  {agrupar === 'sprint' && g.tarefas.length > 0 ? `${prontas}/${g.tarefas.length}` : g.tarefas.length}
                </span>
              </header>

              {!fechado && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[44rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-black/[0.05]">
                        <th className="w-8" />
                        <th className="min-w-[16rem] px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                          Tarefa
                        </th>
                        {usadas.includes('tags') && <Th className="w-40">{COLUNA_LABELS_CLIENTE.tags}</Th>}
                        {usadas.includes('quem') && <Th className="w-36">{COLUNA_LABELS_CLIENTE.quem}</Th>}
                        {usadas.includes('inicio') && <Th className="w-24">{COLUNA_LABELS_CLIENTE.inicio}</Th>}
                        {usadas.includes('prazo') && <Th className="w-24">{COLUNA_LABELS_CLIENTE.prazo}</Th>}
                        {usadas.includes('prioridade') && <Th className="w-28">{COLUNA_LABELS_CLIENTE.prioridade}</Th>}
                        {/* Agrupada por sprint, o grupo não diz o estado: aí o status vira coluna. */}
                        {agrupar === 'sprint' && <Th className="w-32">Status</Th>}
                      </tr>
                    </thead>
                    <tbody>
                      {g.tarefas.flatMap((t) => {
                        const partes = subs(t.id);
                        const aberta = abertas.includes(t.id);
                        return [
                          <Linha
                            key={t.id}
                            task={t}
                            colunas={usadas}
                            tags={tags}
                            comStatus={agrupar === 'sprint'}
                            filhas={partes.length}
                            prontas={partes.filter((f) => f.status === 'feito').length}
                            aberta={aberta}
                            onAbrir={() =>
                              setAbertas((a) => (a.includes(t.id) ? a.filter((x) => x !== t.id) : [...a, t.id]))
                            }
                          />,
                          ...(aberta ? partes.map((f) => (
                            <Linha
                              key={f.id}
                              task={f}
                              colunas={usadas}
                              tags={tags}
                              comStatus={agrupar === 'sprint'}
                              filhas={0}
                              filha
                            />
                          )) : []),
                        ];
                      })}

                      {g.tarefas.length === 0 && (
                        <tr>
                          <td colSpan={usadas.length + 3} className="px-3 py-4 text-center text-[12px] text-text-muted">
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
      </div>

      {/* O cronograma fecha a página: primeiro a lista, que responde "o que
          falta"; depois o desenho, para quem quer ver o mês inteiro de uma vez. */}
      {cronograma && (
        <div className="mt-8">
          <Gantt modoCliente titulo="Cronograma" phases={phases} tasks={tasks} />
        </div>
      )}
    </>
  );
}

function Numero({ titulo, valor, tom = 'text-text-primary' }: {
  titulo: string;
  valor: number;
  tom?: string;
}) {
  return (
    <div className="rounded-md border border-black/[0.07] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">{titulo}</p>
      <p className={`mt-1 font-mono text-2xl tabular-nums ${tom}`}>{valor}</p>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`${className} px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-text-muted`}>
      {children}
    </th>
  );
}

function Linha({ task, colunas, tags, comStatus, filhas, prontas = 0, aberta = false, onAbrir, filha = false }: {
  task: TaskView;
  colunas: Coluna[];
  tags: TagCliente[];
  comStatus: boolean;
  filhas: number;
  /** Quantas partes já saíram, para o contador dizer 2/5 e não só "5 partes". */
  prontas?: number;
  aberta?: boolean;
  onAbrir?: () => void;
  filha?: boolean;
}) {
  const minhasTags = tags.filter((tg) => task.tagIds.includes(tg.id));
  const pronta = task.status === 'feito';

  return (
    <tr className={`border-b border-black/[0.04] last:border-0 ${filha ? 'bg-neutral-50/40' : ''}`}>
      {/* No lugar da caixa de concluir da casa, o mesmo sinal em leitura: o que
          está pronto vem marcado de verde. */}
      <td className="py-2 pl-3 pr-0">
        <span
          title={STATUS_LABELS[task.status]}
          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
            pronta ? 'bg-success text-white' : `${TASK_DOT[task.status]} opacity-70`
          }`}
        >
          {pronta && (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
              <path
                d="M2.5 6.2l2.4 2.4 4.6-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </td>

      <td className="px-3 py-2">
        <div className={`flex min-w-0 items-center gap-2 ${filha ? 'pl-5' : ''}`}>
          <span className={`text-[13px] ${
            pronta ? 'text-text-muted line-through' : filha ? 'text-text-secondary' : 'text-text-primary'
          }`}>
            {task.title}
          </span>
          {filhas > 0 && (
            <button
              onClick={onAbrir}
              aria-expanded={aberta}
              title={aberta ? 'Esconder as partes desta entrega' : 'Ver as partes desta entrega'}
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-black/[0.06] py-0.5 pl-0.5 pr-1.5 text-[10px] tabular-nums text-text-muted transition-colors hover:bg-black/[0.1] hover:text-text-primary"
            >
              <ChevronRight className={`h-3 w-3 transition-transform ${aberta ? 'rotate-90' : ''}`} />
              {prontas}/{filhas}
            </button>
          )}
        </div>
      </td>

      {colunas.includes('tags') && (
        <td className="px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {minhasTags.map((tg) => <TagChip key={tg.id} nome={tg.nome} cor={tg.cor} compacto={filha} />)}
          </div>
        </td>
      )}

      {colunas.includes('quem') && (
        <td className="px-3 py-2">
          {task.assignee ? (
            <div className="flex min-w-0 items-center gap-1.5">
              <Sigla nome={task.assignee} />
              <span className="min-w-0 truncate text-[12px] text-text-secondary">{task.assignee}</span>
            </div>
          ) : (
            <span className="text-[12px] text-text-muted">—</span>
          )}
        </td>
      )}

      {colunas.includes('inicio') && (
        <td className="px-3 py-2">
          <DateTag value={task.startDate} quieta={task.status === 'feito'} placeholder="—" />
        </td>
      )}
      {colunas.includes('prazo') && (
        <td className="px-3 py-2">
          <DateTag value={task.dueDate} quieta={task.status === 'feito'} placeholder="—" />
        </td>
      )}
      {colunas.includes('prioridade') && (
        <td className="px-3 py-2">
          <PriorityTag value={task.priority} />
        </td>
      )}

      {comStatus && (
        <td className="px-3 py-2">
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_TOM[task.status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${TASK_DOT[task.status]}`} />
            {STATUS_LABELS[task.status]}
          </span>
        </td>
      )}
    </tr>
  );
}
