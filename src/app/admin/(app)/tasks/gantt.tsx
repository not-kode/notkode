'use client';

// Cronograma em linha do tempo, sempre de um projeto só. É a mesma visão que o
// cliente enxerga pelo link de acompanhamento: o que está combinado, quando, e
// o que já ficou pronto. Nada de status interno nem prioridade.
//
// As barras saem das TAREFAS (etapas, quando existem, viram cabeçalho de grupo).
// Cor diz estado — pronto, em andamento, a fazer, atrasado —, e não índice da
// linha: o arco-íris anterior enfeitava sem informar nada.
//
// Tarefa com prazo e sem começo é um marco, não uma faixa de duração: ela vira
// um losango no dia do prazo, em vez de uma bolinha que parecia barra encolhida.

import { useState } from 'react';
import { updatePhase, updateTask } from './actions';
import type { PhaseView, Send, TaskView } from './types';
import { DateChip, InlineText, diffDias, fmtDate, hoje, somaDias } from './ui';

type Barra = {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  /** Sem data de início: o desenho é um marco no dia do prazo. */
  marco: boolean;
  tipo: 'etapa' | 'tarefa';
  estado: 'pronto' | 'fazendo' | 'atrasado' | 'aberto';
  quem?: string | null;
  grupo?: string | null;
};

const TOM: Record<Barra['estado'], { barra: string; ponto: string; texto: string }> = {
  pronto: { barra: 'bg-success/70', ponto: 'bg-success', texto: 'text-success' },
  fazendo: { barra: 'bg-primary', ponto: 'bg-primary', texto: 'text-primary' },
  atrasado: { barra: 'bg-danger/80', ponto: 'bg-danger', texto: 'text-danger' },
  aberto: { barra: 'bg-neutral-400/70', ponto: 'bg-neutral-400', texto: 'text-text-secondary' },
};

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

/** Quantas linhas cabem antes de a lista virar rolagem sem fim. */
const LIMITE = 14;

/**
 * modoCliente: o cliente vê prazo e o que já ficou pronto, mas não a barra
 * vermelha de atraso — cobrança de prazo é conversa nossa, não sinalização
 * automática numa tela que ele abre sozinho.
 */
export function Gantt({ phases, tasks, titulo, modoCliente, resumo, send }: {
  phases: PhaseView[];
  tasks: TaskView[];
  titulo?: string;
  modoCliente?: boolean;
  /**
   * Só as sprints na linha do tempo, sem as tarefas de dentro. É como o
   * cronograma se lê de longe: dá para ver o projeto inteiro no tempo, em vez
   * de vinte linhas onde cada faixa é uma tarefa de dois dias. As tarefas que
   * não estão em sprint nenhuma continuam aparecendo, senão sumiriam da tela.
   */
  resumo?: boolean;
  /** Com `send`, nome e prazo viram editáveis na própria linha (só no admin). */
  send?: Send;
}) {
  const hj = hoje();
  const [tudo, setTudo] = useState(false);

  const estadoDe = (concluida: boolean, fazendo: boolean, fim: string): Barra['estado'] => {
    if (concluida) return 'pronto';
    if (fim < hj && !modoCliente) return 'atrasado';
    return fazendo ? 'fazendo' : 'aberto';
  };

  const barras: Barra[] = [];
  const semData: { id: string; titulo: string }[] = [];

  const macros = tasks.filter((t) => !t.parentId);
  const daEtapa = (id: string | null) => phases.find((p) => p.id === id)?.name ?? null;

  // Em resumo, a linha da tarefa só aparece quando ela não tem sprint para
  // resumi-la.
  const soltas = resumo && phases.length > 0
    ? macros.filter((t) => !t.phaseId || !phases.some((p) => p.id === t.phaseId))
    : macros;

  for (const t of soltas) {
    const inicio = t.startDate ?? t.dueDate;
    const fim = t.dueDate ?? t.startDate;
    if (!inicio || !fim) { semData.push({ id: t.id, titulo: t.title }); continue; }
    barras.push({
      id: t.id,
      titulo: t.title,
      inicio,
      fim: fim < inicio ? inicio : fim,
      marco: !t.startDate || t.startDate === t.dueDate,
      tipo: 'tarefa',
      estado: estadoDe(t.status === 'feito', t.status === 'fazendo', fim),
      quem: t.assignee,
      grupo: daEtapa(t.phaseId),
    });
  }

  // Etapas entram como faixa própria só quando existem de verdade; elas resumem
  // o bloco e ficam com a barra cheia.
  for (const p of phases) {
    const suas = macros.filter((t) => t.phaseId === p.id);
    const inicioDelas = suas.map((t) => t.startDate ?? t.dueDate).filter(Boolean) as string[];
    const fimDelas = suas.map((t) => t.dueDate ?? t.startDate).filter(Boolean) as string[];
    // Quem manda na faixa são as tarefas: é o trabalho que está lá dentro. As
    // datas da própria sprint entram quando ela ainda não tem tarefa com prazo,
    // e no admin somam-se às delas, que é onde a data da sprint se edita.
    const usarSoAsTarefas = resumo && inicioDelas.length > 0 && fimDelas.length > 0;
    const inicios = (usarSoAsTarefas ? inicioDelas : [p.startDate, ...inicioDelas]).filter(Boolean) as string[];
    const fins = (usarSoAsTarefas ? fimDelas : [p.endDate, ...fimDelas]).filter(Boolean) as string[];
    if (!inicios.length || !fins.length) continue;
    const inicio = inicios.reduce((a, b) => (a < b ? a : b));
    const fim = fins.reduce((a, b) => (a > b ? a : b));
    barras.push({
      id: p.id,
      titulo: p.name,
      inicio,
      fim: fim < inicio ? inicio : fim,
      marco: false,
      tipo: 'etapa',
      estado: estadoDe(p.status === 'concluida', p.status === 'em_andamento', fim),
    });
  }

  // Ordem do tempo: cronograma se lê da esquerda para a direita, de cima para baixo.
  barras.sort((a, b) => a.inicio.localeCompare(b.inicio) || a.fim.localeCompare(b.fim));

  if (barras.length === 0) {
    return (
      <div className="rounded-md border border-black/[0.07] bg-white px-4 py-12 text-center shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <p className="text-sm text-text-secondary">Nenhuma tarefa com data ainda.</p>
        <p className="mt-1 text-[13px] text-text-muted">
          Basta uma tarefa com prazo para o cronograma se desenhar sozinho.
        </p>
      </div>
    );
  }

  // O que já ficou pronto há tempo não ajuda a planejar: fica guardado atrás do
  // "ver tudo", e a tela abre no que ainda está em jogo.
  const antigas = barras.filter((b) => b.estado === 'pronto' && b.fim < somaDias(hj, -14));
  const visiveis = tudo ? barras : barras.filter((b) => !antigas.includes(b)).slice(0, LIMITE);
  const escondidas = barras.length - visiveis.length;

  const { de, dias } = janela(visiveis);
  const pos = (d: string) => (diffDias(de, d) / dias) * 100;
  const hojePos = pos(hj);

  const salvarNome = (b: Barra, valor: string) => {
    if (!send) return;
    if (b.tipo === 'etapa') send(updatePhase, { id: b.id, name: valor });
    else send(updateTask, { id: b.id, title: valor });
  };
  const salvarPrazo = (b: Barra, valor: string) => {
    if (!send) return;
    if (b.tipo === 'etapa') send(updatePhase, { id: b.id, end_date: valor });
    else send(updateTask, { id: b.id, due_date: valor });
  };

  return (
    <div className="overflow-hidden rounded-md border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      {titulo && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] bg-neutral-50 px-4 py-2.5">
          <h3 className="text-[13px] font-semibold text-text-primary">{titulo}</h3>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-success/70" />pronto</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-primary" />em andamento</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-neutral-400/70" />a fazer</span>
            {!modoCliente && (
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-danger/80" />atrasado</span>
            )}
          </div>
        </header>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[40rem] px-4 py-3">
          {/* Régua: é ela que diz o mês. A data exata de cada linha aparece no
              hover, em vez de uma coluna de datas repetindo tudo do lado. */}
          <div className="flex gap-3 pb-2">
            <div className="w-64 shrink-0" />
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
          </div>

          <div className="flex gap-3">
            <div className="flex w-64 shrink-0 flex-col gap-1">
              {visiveis.map((b) => (
                <div
                  key={b.id}
                  className={`flex h-8 items-center gap-1.5 truncate ${
                    b.tipo === 'etapa' ? 'text-[13px] font-semibold text-text-primary' : 'text-[12px] text-text-secondary'
                  }`}
                  title={b.grupo ? `${b.grupo} · ${b.titulo}` : b.titulo}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TOM[b.estado].ponto}`} />
                  {send ? (
                    <InlineText
                      value={b.titulo}
                      onSave={(v) => salvarNome(b, v)}
                      className="min-w-0 flex-1 truncate"
                      title="Clique para renomear"
                    />
                  ) : (
                    <span className={`truncate ${b.estado === 'pronto' ? 'text-text-muted' : ''}`}>{b.titulo}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="relative flex flex-1 flex-col gap-1">
              {hojePos >= 0 && hojePos <= 100 && (
                <>
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-danger/40"
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

              {visiveis.map((b) => {
                const esquerda = Math.max(0, pos(b.inicio));
                const largura = Math.max(0.8, Math.min(100, pos(b.fim)) - esquerda);
                const tom = TOM[b.estado];
                const quando = b.marco ? fmtDate(b.fim) : `${fmtDate(b.inicio)} a ${fmtDate(b.fim)}`;
                const titulo = [quando, b.quem].filter(Boolean).join(' · ');
                // Perto da borda direita o rótulo vira para dentro, senão fica cortado.
                const rotuloDireita = esquerda + largura > 82;

                return (
                  <div key={b.id} className="group relative h-8 rounded-sm bg-neutral-50/80">
                    {b.marco ? (
                      <span
                        className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] ${tom.ponto}`}
                        style={{ left: `${Math.min(99, esquerda)}%` }}
                        title={titulo}
                      />
                    ) : (
                      <div
                        className={`absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full ${tom.barra} ${b.tipo === 'etapa' ? 'h-3.5' : ''}`}
                        style={{ left: `${esquerda}%`, width: `${largura}%` }}
                        title={titulo}
                      />
                    )}

                    {/* A data fica SEMPRE colada na marca: é assim que se lê qual
                        tarefa cai em qual dia sem caçar com o mouse nem olhar
                        para uma coluna do outro lado da tela. No admin ela é o
                        próprio campo de prazo, então dá para remarcar daqui. */}
                    <span
                      className="absolute top-1/2 z-20 flex -translate-y-1/2 items-center whitespace-nowrap"
                      style={
                        rotuloDireita
                          ? { right: `${Math.max(0, 100 - Math.max(0, esquerda))}%`, paddingRight: '0.4rem' }
                          : { left: `${Math.min(99, esquerda + largura)}%`, paddingLeft: '0.4rem' }
                      }
                    >
                      {send ? (
                        <DateChip value={b.fim} onSave={(v) => salvarPrazo(b, v)} atrasada={b.estado === 'atrasado'} />
                      ) : (
                        <span className={`text-[10px] tabular-nums ${tom.texto}`}>{quando}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {escondidas > 0 && (
            <button
              onClick={() => setTudo(true)}
              className="mt-2 text-[11px] text-primary transition-colors hover:underline"
            >
              ver mais {escondidas} {escondidas === 1 ? 'linha' : 'linhas'} (concluídas e o resto do projeto)
            </button>
          )}
          {tudo && barras.length > LIMITE && (
            <button
              onClick={() => setTudo(false)}
              className="mt-2 text-[11px] text-text-muted transition-colors hover:text-text-primary"
            >
              mostrar só o que está em jogo
            </button>
          )}
        </div>
      </div>

      {semData.length > 0 && !modoCliente && (
        <SemData itens={semData} />
      )}
    </div>
  );
}

/**
 * O que ainda não entrou no cronograma. Eram títulos em linha corrida, um do
 * lado do outro: com quarenta tarefas virava um parágrafo de nomes onde não se
 * achava nada. Agora é uma tarefa por linha, em colunas, e a lista começa curta
 * porque essa fila é longa por natureza.
 */
function SemData({ itens }: { itens: { id: string; titulo: string }[] }) {
  const [tudo, setTudo] = useState(false);
  const LIMITE_SEM_DATA = 9;
  const visiveis = tudo ? itens : itens.slice(0, LIMITE_SEM_DATA);
  const restam = itens.length - visiveis.length;

  return (
    <div className="border-t border-black/[0.06] bg-neutral-50 px-4 py-3">
      <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">
        Sem data ({itens.length}) — fora do cronograma
      </p>
      <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
        {visiveis.map((t) => (
          <li key={t.id} className="flex min-w-0 items-baseline gap-1.5 text-[12px] text-text-secondary">
            <span className="shrink-0 text-text-muted/60">·</span>
            <span className="truncate" title={t.titulo}>{t.titulo}</span>
          </li>
        ))}
      </ul>
      {(restam > 0 || tudo) && (
        <button
          onClick={() => setTudo((v) => !v)}
          className="mt-2 text-[11px] text-primary transition-colors hover:underline"
        >
          {restam > 0 ? `ver as outras ${restam}` : 'mostrar menos'}
        </button>
      )}
    </div>
  );
}
