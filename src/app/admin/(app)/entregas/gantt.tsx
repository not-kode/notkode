'use client';

// Cronograma em linha do tempo, sempre de um projeto só. É a visão que o cliente
// enxerga pelo link de acompanhamento: etapas, as tarefas de cada etapa, quem
// responde por elas e as datas. Nada de status interno nem prioridade.
//
// Tarefa sem etapa não vira barra: cronograma é a sequência de etapas combinada
// com o cliente, e tarefa solta ali dentro aparece como item aleatório. Ela é
// listada à parte, e só do lado de dentro, para ganhar uma etapa.

import type { PhaseView, TaskView } from './types';
import { PHASE_LABELS } from './status';
import { diffDias, fmtDate, hoje, somaDias } from './ui';

type Barra = {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  tipo: 'etapa' | 'tarefa';
  concluida: boolean;
  atrasada: boolean;
  cor: number;
  sub?: string;
  quem?: string | null;
};

/** Uma cor por etapa, para a barra da tarefa herdar a cor da etapa dela. */
const CORES = [
  { barra: 'bg-cyan-500', clara: 'bg-cyan-200', texto: 'text-cyan-700' },
  { barra: 'bg-violet-500', clara: 'bg-violet-200', texto: 'text-violet-700' },
  { barra: 'bg-emerald-500', clara: 'bg-emerald-200', texto: 'text-emerald-700' },
  { barra: 'bg-amber-500', clara: 'bg-amber-200', texto: 'text-amber-700' },
  { barra: 'bg-rose-500', clara: 'bg-rose-200', texto: 'text-rose-700' },
  { barra: 'bg-teal-500', clara: 'bg-teal-200', texto: 'text-teal-700' },
];

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Janela do gráfico: do primeiro começo ao último prazo, com uma folga nas pontas. */
function janela(barras: Barra[]): { de: string; dias: number } {
  const hj = hoje();
  const inicios = barras.map((b) => b.inicio).concat(hj);
  const fins = barras.map((b) => b.fim).concat(hj);
  const de = somaDias(inicios.reduce((a, b) => (a < b ? a : b)), -3);
  const ate = somaDias(fins.reduce((a, b) => (a > b ? a : b)), 3);
  return { de, dias: Math.max(1, diffDias(de, ate)) };
}

/** Marcas do cabeçalho: por semana quando cabe, senão por mês. */
function marcas(de: string, dias: number): { pos: number; label: string; forte: boolean }[] {
  const passo = dias <= 70 ? 7 : 30;
  const out: { pos: number; label: string; forte: boolean }[] = [];
  for (let d = 0; d <= dias; d += passo) {
    const data = somaDias(de, d);
    const [, m, dia] = data.split('-');
    const primeiroDoMes = Number(dia) <= passo;
    out.push({
      pos: (d / dias) * 100,
      label: passo === 7 ? `${Number(dia)} ${MESES[Number(m) - 1]}` : MESES[Number(m) - 1],
      forte: passo === 30 || primeiroDoMes,
    });
  }
  return out;
}

/**
 * modoCliente: o cliente vê prazo e o que já ficou pronto, mas não a barra
 * vermelha de atraso — cobrança de prazo é conversa nossa, não sinalização
 * automática numa tela que ele abre sozinho.
 */
export function Gantt({ phases, tasks, titulo, modoCliente }: {
  phases: PhaseView[];
  tasks: TaskView[];
  titulo?: string;
  modoCliente?: boolean;
}) {
  const hj = hoje();

  const barras: Barra[] = [];
  const semData: { id: string; titulo: string; etapa: string | null }[] = [];
  // Tarefas do projeto que ainda não pertencem a nenhuma etapa.
  const semEtapa = tasks.filter((t) => !t.phaseId && !t.parentId);

  phases.forEach((p, i) => {
    // Subtarefa não vira linha própria: ela é detalhe de dentro da tarefa.
    const tarefas = tasks.filter((t) => t.phaseId === p.id && !t.parentId);
    // A etapa sem data própria assume o intervalo das tarefas dela: melhor uma
    // barra deduzida do que uma faixa vazia no cronograma do cliente.
    const inicios = [p.startDate, ...tarefas.map((t) => t.startDate ?? t.dueDate)].filter(Boolean) as string[];
    const fins = [p.endDate, ...tarefas.map((t) => t.dueDate ?? t.startDate)].filter(Boolean) as string[];
    if (inicios.length && fins.length) {
      const inicio = inicios.reduce((a, b) => (a < b ? a : b));
      const fim = fins.reduce((a, b) => (a > b ? a : b));
      barras.push({
        id: p.id,
        titulo: p.name,
        inicio,
        fim: fim < inicio ? inicio : fim,
        tipo: 'etapa',
        concluida: p.status === 'concluida',
        atrasada: fim < hj && p.status !== 'concluida',
        cor: i % CORES.length,
        sub: PHASE_LABELS[p.status],
      });
    }

    for (const t of tarefas) {
      const inicio = t.startDate ?? t.dueDate;
      const fim = t.dueDate ?? t.startDate;
      if (!inicio || !fim) { semData.push({ id: t.id, titulo: t.title, etapa: p.name }); continue; }
      barras.push({
        id: t.id,
        titulo: t.title,
        inicio,
        fim: fim < inicio ? inicio : fim,
        tipo: 'tarefa',
        concluida: t.status === 'feito',
        atrasada: fim < hj && t.status !== 'feito',
        cor: i % CORES.length,
        quem: t.assignee,
      });
    }
  });

  if (barras.length === 0) {
    return (
      <div className="rounded-md border border-black/[0.07] bg-white px-4 py-12 text-center shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <p className="text-sm text-text-secondary">Nenhuma etapa com data ainda.</p>
        <p className="mt-1 text-[13px] text-text-muted">
          Crie as etapas do projeto, coloque as tarefas dentro delas com começo e prazo, e o cronograma se desenha
          sozinho.
        </p>
      </div>
    );
  }

  const { de, dias } = janela(barras);
  const pos = (d: string) => (diffDias(de, d) / dias) * 100;
  const hojePos = pos(hj);

  return (
    <div className="overflow-hidden rounded-md border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      {titulo && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] bg-neutral-50 px-4 py-2.5">
          <h3 className="text-[13px] font-semibold text-text-primary">{titulo}</h3>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-cyan-500" />etapa</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-cyan-200" />tarefa</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-success" />concluído</span>
          </div>
        </header>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[44rem] px-4 py-3">
          {/* Régua */}
          <div className="flex gap-3 pb-2">
            <div className="w-52 shrink-0" />
            <div className="w-28 shrink-0" />
            <div className="relative h-4 flex-1">
              {marcas(de, dias).map((m) => (
                <span
                  key={m.pos}
                  className={`absolute -translate-x-1/2 text-[10px] tabular-nums ${m.forte ? 'font-medium text-text-secondary' : 'text-text-muted'}`}
                  style={{ left: `${m.pos}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
            <div className="w-24 shrink-0" />
          </div>

          {/* Três colunas paralelas (nome, faixa, prazo) para a linha do "hoje"
              atravessar só a área das barras, sem cálculo de offset. */}
          <div className="flex gap-3">
            <div className="flex w-52 shrink-0 flex-col gap-1">
              {barras.map((b) => (
                <div
                  key={b.id}
                  className={`flex h-7 items-center truncate ${
                    b.tipo === 'etapa'
                      ? 'text-[13px] font-semibold text-text-primary'
                      : 'pl-3 text-[12px] text-text-secondary'
                  }`}
                  title={b.titulo}
                >
                  {b.tipo === 'tarefa' && <span className="mr-1.5 text-text-muted">└</span>}
                  {b.titulo}
                </div>
              ))}
            </div>

            {/* Quem responde: é o que o cliente pergunta depois de "para quando". */}
            <div className="flex w-28 shrink-0 flex-col gap-1">
              {barras.map((b) => (
                <div key={b.id} className="flex h-7 items-center truncate text-[11px] text-text-muted" title={b.quem ?? ''}>
                  {b.tipo === 'tarefa' ? b.quem ?? '' : ''}
                </div>
              ))}
            </div>

            <div className="relative flex flex-1 flex-col gap-1">
              {hojePos >= 0 && hojePos <= 100 && (
                <>
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-danger/50"
                    style={{ left: `${hojePos}%` }}
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute -top-0.5 z-20 -translate-x-1/2 rounded-full bg-danger px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white"
                    style={{ left: `${hojePos}%` }}
                  >
                    hoje
                  </span>
                </>
              )}

              {barras.map((b) => {
                const esquerda = Math.max(0, pos(b.inicio));
                const largura = Math.max(1.5, Math.min(100, pos(b.fim)) - esquerda);
                const cor = CORES[b.cor];
                const tom = b.concluida
                  ? 'bg-success'
                  : b.atrasada && !modoCliente
                    ? 'bg-danger'
                    : b.tipo === 'etapa'
                      ? cor.barra
                      : cor.clara;
                return (
                  <div key={b.id} className="relative h-7 rounded-sm bg-neutral-50">
                    <div
                      className={`absolute top-1.5 h-4 rounded-full ${tom} ${b.tipo === 'etapa' ? 'shadow-[0_1px_2px_rgba(16,24,40,0.12)]' : ''}`}
                      style={{ left: `${esquerda}%`, width: `${largura}%` }}
                      title={`${fmtDate(b.inicio)} a ${fmtDate(b.fim)}${b.sub ? ` · ${b.sub}` : ''}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex w-24 shrink-0 flex-col gap-1">
              {barras.map((b) => (
                <div key={b.id} className="flex h-7 items-center justify-end text-[11px] tabular-nums text-text-muted">
                  {fmtDate(b.fim)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Só do lado de dentro: para o cliente, tarefa sem etapa simplesmente não
          existe no cronograma; para você, é uma pendência de organização. */}
      {!modoCliente && semEtapa.length > 0 && (
        <div className="border-t border-black/[0.06] bg-warning/[0.06] px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#B45309]">
            Fora do cronograma ({semEtapa.length}) — sem etapa
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {semEtapa.map((t) => (
              <li key={t.id} className="text-[12px] text-text-secondary">{t.title}</li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-text-muted">
            Coloque cada uma numa etapa para que entrem no cronograma que o cliente vê.
          </p>
        </div>
      )}

      {semData.length > 0 && (
        <div className="border-t border-black/[0.06] bg-neutral-50 px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Sem data ({semData.length})
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {semData.map((t) => (
              <li key={t.id} className="text-[12px] text-text-secondary">
                {t.titulo}
                {t.etapa && <span className="text-text-muted"> · {t.etapa}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
