'use client';

// Cronograma em linha do tempo. É a visão que o cliente enxerga pelo link de
// acompanhamento, então ela é puro dado de prazo: nada de status interno,
// responsável ou prioridade.

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
  sub?: string;
};

/** Janela do gráfico: do primeiro começo ao último prazo, com uma folga nas pontas. */
function janela(barras: Barra[]): { de: string; ate: string; dias: number } {
  const hj = hoje();
  const inicios = barras.map((b) => b.inicio).concat(hj);
  const fins = barras.map((b) => b.fim).concat(hj);
  const de = somaDias(inicios.reduce((a, b) => (a < b ? a : b)), -2);
  const ate = somaDias(fins.reduce((a, b) => (a > b ? a : b)), 2);
  return { de, ate, dias: Math.max(1, diffDias(de, ate)) };
}

/** Marcas do cabeçalho: uma por semana quando cabe, senão uma por mês. */
function marcas(de: string, dias: number): { pos: number; label: string }[] {
  const passo = dias <= 60 ? 7 : 30;
  const out: { pos: number; label: string }[] = [];
  for (let d = 0; d <= dias; d += passo) {
    const data = somaDias(de, d);
    const [, m, dia] = data.split('-');
    out.push({ pos: (d / dias) * 100, label: passo === 7 ? `${dia}/${m}` : `${m}` });
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

  for (const p of phases) {
    const tarefas = tasks.filter((t) => t.phaseId === p.id);
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
      });
    }
  }

  for (const t of tasks.filter((x) => !x.phaseId)) {
    const inicio = t.startDate ?? t.dueDate;
    const fim = t.dueDate ?? t.startDate;
    if (!inicio || !fim) { semData.push({ id: t.id, titulo: t.title, etapa: null }); continue; }
    barras.push({
      id: t.id,
      titulo: t.title,
      inicio,
      fim: fim < inicio ? inicio : fim,
      tipo: 'tarefa',
      concluida: t.status === 'feito',
      atrasada: fim < hj && t.status !== 'feito',
    });
  }

  if (barras.length === 0) {
    return (
      <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
        Nenhuma tarefa com data ainda. Coloque começo e prazo nas tarefas e o cronograma se desenha sozinho.
      </p>
    );
  }

  const { de, dias } = janela(barras);
  const pos = (d: string) => (diffDias(de, d) / dias) * 100;
  const hojePos = pos(hj);

  return (
    <div className="rounded-md border border-black/[0.06] bg-white">
      {titulo && (
        <div className="border-b border-black/[0.05] px-4 py-2.5">
          <p className="font-label text-[11px] uppercase tracking-wider text-text-secondary">{titulo}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[42rem] px-4 py-3">
          {/* Régua */}
          <div className="flex items-end gap-3 pb-1">
            <div className="w-48 shrink-0" />
            <div className="relative h-4 flex-1">
              {marcas(de, dias).map((m) => (
                <span
                  key={m.pos}
                  className="absolute -translate-x-1/2 font-label text-[10px] tabular-nums text-text-muted"
                  style={{ left: `${m.pos}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Três colunas paralelas (nome, faixa, datas) para a linha do "hoje"
              atravessar só a área das barras, sem depender de cálculo de offset. */}
          <div className="flex gap-3">
            <div className="flex w-48 shrink-0 flex-col gap-1.5">
              {barras.map((b) => (
                <div
                  key={b.id}
                  className={`flex h-6 items-center truncate ${b.tipo === 'etapa' ? 'text-sm font-medium text-text-primary' : 'pl-3 text-[13px] text-text-secondary'}`}
                  title={b.titulo}
                >
                  {b.titulo}
                </div>
              ))}
            </div>

            <div className="relative flex flex-1 flex-col gap-1.5">
              {hojePos >= 0 && hojePos <= 100 && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 border-l border-dashed border-primary/60"
                  style={{ left: `${hojePos}%` }}
                  aria-hidden
                />
              )}
              {barras.map((b) => {
                const esquerda = Math.max(0, pos(b.inicio));
                const largura = Math.max(1.2, Math.min(100, pos(b.fim)) - esquerda);
                const tom = b.concluida
                  ? 'bg-success/70'
                  : b.atrasada && !modoCliente
                    ? 'bg-danger/75'
                    : b.tipo === 'etapa'
                      ? 'bg-navy/80'
                      : 'bg-primary/70';
                return (
                  <div key={b.id} className="relative h-6 rounded-sm bg-black/[0.035]">
                    <div
                      className={`absolute top-1 h-4 rounded-sm ${tom}`}
                      style={{ left: `${esquerda}%`, width: `${largura}%` }}
                      title={`${fmtDate(b.inicio)} a ${fmtDate(b.fim)}${b.sub ? ` · ${b.sub}` : ''}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex w-28 shrink-0 flex-col gap-1.5">
              {barras.map((b) => (
                <div key={b.id} className="flex h-6 items-center justify-end font-label text-[11px] tabular-nums text-text-muted">
                  {fmtDate(b.inicio)} a {fmtDate(b.fim)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {semData.length > 0 && (
        <div className="border-t border-black/[0.05] px-4 py-2.5">
          <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">
            Sem data ({semData.length})
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {semData.map((t) => (
              <li key={t.id} className="text-[13px] text-text-secondary">
                {t.titulo}
                {t.etapa && <span className="font-label text-[11px] text-text-muted"> · {t.etapa}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
