'use client';

// A tarefa por inteiro, num modal no meio da tela: o que a lista e o cartão não
// têm espaço para mostrar (descrição longa, subtarefas, arquivos, conversa).
//
// Era uma gaveta encostada na direita, com tudo empilhado numa coluna estreita:
// a conversa ficava no fim de uma rolagem comprida, e a descrição não tinha
// largura para ser lida. Aqui o trabalho fica à esquerda e a conversa mora numa
// coluna própria à direita, com o campo de escrever preso no rodapé — quem abre
// uma tarefa quer ler o que foi combinado e responder, sem procurar.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlignLeft, Calendar, Check, Flag, Layers, ListChecks, Paperclip, Plus, Tag as TagIcon,
  Timer, Trash2, User, X,
} from 'lucide-react';
import {
  apagarAnexo, apagarComentario, apagarTag, atualizarTag, createTask, criarComentario, criarTagNaTarefa,
  pedirUploadDeAnexo, registrarAnexo,
  deleteTask, toggleTimer, updateTask,
} from './actions';
import { TASK_DOT, TASK_LABELS, TASK_STATUSES, TASK_TOM } from './status';
import { donoDaTarefa } from './types';
import type { AnexoView, ComentarioView, Pessoa, PhaseView, ProjectKind, Send, TagView, TaskView } from './types';
import { ChipSelect, PeriodoChip, PessoaSelect, PriorityChip, TagsSelect, TimerChip, hoje } from './ui';

/** Uma propriedade da tarefa: rótulo com ícone à esquerda, controle à direita. */
function Campo({ icone: Icone, rotulo, children, largo = false }: {
  icone: typeof User;
  rotulo: string;
  children: React.ReactNode;
  /** Ocupa a linha inteira da barra: para o campo que cresce sem limite. */
  largo?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 py-1 ${largo ? 'sm:col-span-2 xl:col-span-3' : ''}`}>
      <span className="flex w-[6.5rem] shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] text-text-muted">
        <Icone className="h-3.5 w-3.5 shrink-0 opacity-70" />
        {rotulo}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

/** Título de seção do corpo, com o contador do que tem dentro. */
function Secao({ icone: Icone, titulo, contador, children }: {
  icone: typeof User;
  titulo: string;
  contador?: string | number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-1.5 flex items-center gap-2 font-label text-[10px] uppercase tracking-wider text-text-muted">
        <Icone className="h-3.5 w-3.5 opacity-70" />
        {titulo}
        {contador !== undefined && contador !== 0 && (
          <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 tabular-nums normal-case tracking-normal">
            {contador}
          </span>
        )}
      </p>
      {children}
    </section>
  );
}

export function TaskModal({ task, comentarios, anexos, subtarefas, phases, tags, projectId, projectKind, projetoNome, pessoas, send, onFechar }: {
  task: TaskView;
  comentarios: ComentarioView[];
  /** Arquivos da tarefa. Internos: não existem no link do cliente. */
  anexos: AnexoView[];
  subtarefas: TaskView[];
  phases: PhaseView[];
  tags: TagView[];
  projectId: string;
  projectKind: ProjectKind;
  /** De quem é a tarefa, para o caminho no topo do modal. */
  projetoNome?: string;
  pessoas: Pessoa[];
  send: Send;
  onFechar: () => void;
}) {
  const [titulo, setTitulo] = useState(task.title);
  const [notas, setNotas] = useState(task.notes ?? '');
  const [novaSub, setNovaSub] = useState('');
  const [comentario, setComentario] = useState('');
  // Comentário mandado agora e ainda não confirmado pelo servidor, e o que foi
  // apagado agora. Sem isto, o Enter esvaziava o campo e a conversa só mudava
  // uns segundos depois, quando a página inteira era remontada: a leitura era
  // "o comentário não foi".
  const [pendentes, setPendentes] = useState<{ id: string; texto: string }[]>([]);
  const [removidos, setRemovidos] = useState<string[]>([]);
  const fimDaConversa = useRef<HTMLDivElement>(null);

  // Chegou conversa nova do servidor (ou uma sumiu): o que estava adiantado aqui
  // já virou verdade. Comparo pelo tamanho porque a lista é um array novo a cada
  // render, e olhar a referência limparia isto antes da resposta chegar.
  useEffect(() => { setPendentes([]); setRemovidos([]); }, [comentarios.length]);

  const conversa = comentarios.filter((c) => !removidos.includes(c.id));
  const quantasNaConversa = conversa.length + pendentes.length;

  // A conversa abre no fim, como todo chat: o que interessa é o último recado.
  useEffect(() => {
    fimDaConversa.current?.scrollIntoView({ block: 'end' });
  }, [quantasNaConversa, task.id]);

  // Trocar de tarefa sem fechar o modal tem que recarregar os campos.
  useEffect(() => {
    setTitulo(task.title);
    setNotas(task.notes ?? '');
    setPendentes([]);
    setRemovidos([]);
  }, [task.id, task.title, task.notes]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onFechar]);

  const salvarTitulo = () => {
    const limpo = titulo.trim();
    if (limpo && limpo !== task.title) send(updateTask, { id: task.id, title: limpo });
  };
  const salvarNotas = () => {
    if (notas !== (task.notes ?? '')) send(updateTask, { id: task.id, notes: notas });
  };

  const criarSub = () => {
    const limpo = novaSub.trim();
    if (!limpo) return;
    send(createTask, {
      ...donoDaTarefa(projectId, projectKind),
      parent_task_id: task.id,
      title: limpo,
      status: 'a_fazer',
      phase_id: task.phaseId ?? '',
    });
    setNovaSub('');
  };

  const mandarComentario = () => {
    const limpo = comentario.trim();
    if (!limpo) return;
    setPendentes((p) => [...p, { id: `pendente-${Date.now()}`, texto: limpo }]);
    send(criarComentario, { task_id: task.id, content: limpo });
    setComentario('');
  };

  const feitas = subtarefas.filter((s) => s.status === 'feito').length;
  const atrasada = !!task.dueDate && task.dueDate < hoje() && task.status !== 'feito';
  const sprint = phases.find((p) => p.id === task.phaseId);
  const concluida = task.status === 'feito';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-black/40" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={task.title}
        className="relative flex max-h-[92vh] w-full max-w-[80rem] flex-col overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-[0_24px_64px_rgba(16,24,40,0.24)]"
      >
        {/* De onde é a tarefa, e as ações que valem para ela inteira. */}
        <header className="flex items-center gap-2 border-b border-black/[0.07] px-4 py-2.5">
          <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[12px] text-text-muted">
            {projetoNome && <span className="truncate font-medium text-text-secondary">{projetoNome}</span>}
            {projetoNome && sprint && <span className="opacity-50">›</span>}
            {sprint && <span className="truncate">{sprint.name}</span>}
            {!projetoNome && !sprint && <span className="font-label uppercase tracking-wider">Tarefa</span>}
          </p>

          <button
            onClick={() => {
              if (confirm(`Apagar a tarefa "${task.title}"? Não tem como desfazer.`)) {
                send(deleteTask, { id: task.id });
                onFechar();
              }
            }}
            title="Apagar tarefa"
            className="rounded p-1 text-text-muted/60 transition hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onFechar}
            title="Fechar (Esc)"
            className="rounded p-1 text-text-muted transition hover:bg-black/[0.05] hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* O trabalho: título, propriedades, descrição, subtarefas, arquivos. */}
          <div className="min-w-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-3 flex items-start gap-2.5">
              <button
                onClick={() => send(updateTask, { id: task.id, status: concluida ? 'a_fazer' : 'feito' })}
                title={concluida ? 'Reabrir tarefa' : 'Marcar como concluída'}
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                  concluida
                    ? 'border-success bg-success text-white'
                    : 'border-black/25 bg-white text-transparent hover:border-success hover:text-success/40'
                }`}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </button>

              <textarea
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                onBlur={salvarTitulo}
                rows={1}
                className={`min-h-[2rem] w-full resize-none rounded-sm border border-transparent px-1.5 py-0.5 text-[19px] font-semibold leading-snug text-text-primary outline-none transition-colors hover:border-black/[0.08] focus:border-primary/40 ${
                  concluida ? 'text-text-muted line-through' : ''
                }`}
              />
            </div>

            {/* Uma barra só, do tamanho que a tela der: em duas colunas ela
                espremia cada campo em pouco mais de 10rem e o valor quebrava
                embaixo do rótulo. */}
            <div className="mb-5 grid gap-x-6 border-y border-black/[0.06] py-2 sm:grid-cols-2 xl:grid-cols-3">
              <Campo icone={Layers} rotulo="Status">
                <ChipSelect
                  value={task.status}
                  onChange={(v) => send(updateTask, { id: task.id, status: v })}
                  tone={TASK_TOM[task.status]}
                  titulo="Status"
                  options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_LABELS[s], dot: TASK_DOT[s] }))}
                />
              </Campo>

              <Campo icone={User} rotulo="Quem toca">
                <PessoaSelect
                  value={task.assignee}
                  pessoas={pessoas}
                  onChange={(v) => send(updateTask, { id: task.id, assignee: v })}
                />
              </Campo>

              {/* Começo e fim na mesma janelinha: em dois chips separados,
                  escolher o começo fechava o calendário e o fim virava outra
                  caçada. */}
              <Campo icone={Calendar} rotulo="Período">
                <PeriodoChip
                  inicio={task.startDate}
                  fim={task.dueDate}
                  onInicio={(v) => send(updateTask, { id: task.id, start_date: v })}
                  onFim={(v) => send(updateTask, { id: task.id, due_date: v })}
                  atrasada={atrasada}
                  quieta={concluida}
                />
              </Campo>

              <Campo icone={Flag} rotulo="Prioridade">
                <PriorityChip value={task.priority} onChange={(v) => send(updateTask, { id: task.id, priority: v })} />
              </Campo>

              <Campo icone={Timer} rotulo="Tempo">
                <TimerChip
                  segundos={task.tempoSegundos}
                  rodandoDesde={task.timerDesde}
                  onToggle={() => send(toggleTimer, { id: task.id })}
                  desabilitado={concluida}
                />
              </Campo>

              <Campo icone={Layers} rotulo="Sprint">
                <ChipSelect
                  value={task.phaseId ?? ''}
                  onChange={(v) => send(updateTask, { id: task.id, phase_id: v })}
                  titulo="Sprint do cronograma"
                  placeholder="sem sprint"
                  options={[{ value: '', label: 'sem sprint' }, ...phases.map((p) => ({ value: p.id, label: p.name }))]}
                />
              </Campo>

              <Campo icone={TagIcon} rotulo="Tags" largo>
                <TagsSelect
                  value={task.tagIds}
                  tags={tags}
                  onChange={(ids) => send(updateTask, { id: task.id, tag_ids: ids.join(',') })}
                  onCriar={(nome, cor) => send(criarTagNaTarefa, {
                    engagement_id: projectId, task_id: task.id, name: nome, color: cor,
                  })}
                  onCor={(id, cor) => send(atualizarTag, { id, color: cor })}
                  onApagar={(tag) => {
                    if (confirm(`Apagar a tag "${tag.nome}"? Ela sai das tarefas que a usam.`)) {
                      send(apagarTag, { id: tag.id, engagement_id: projectId });
                    }
                  }}
                />
              </Campo>
            </div>

            <div className="flex flex-col gap-5">
              <Secao icone={AlignLeft} titulo="Descrição">
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  onBlur={salvarNotas}
                  rows={5}
                  placeholder="O contexto que você vai querer na próxima vez que abrir isso."
                  className="w-full resize-y rounded-sm border border-black/[0.08] px-2.5 py-2 text-[13px] leading-relaxed text-text-primary outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </Secao>

              <Secao
                icone={ListChecks}
                titulo="Subtarefas"
                contador={subtarefas.length > 0 ? `${feitas}/${subtarefas.length}` : undefined}
              >
                {subtarefas.length > 0 && (
                  <ul className="mb-1.5 flex flex-col">
                    {subtarefas.map((s) => (
                      <li key={s.id} className="group flex items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-black/[0.02]">
                        <button
                          onClick={() => send(updateTask, { id: s.id, status: s.status === 'feito' ? 'a_fazer' : 'feito' })}
                          title={s.status === 'feito' ? 'Reabrir' : 'Concluir'}
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                            s.status === 'feito'
                              ? 'border-success bg-success text-white'
                              : 'border-black/25 bg-white text-transparent hover:border-success hover:text-success/40'
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </button>
                        <span className={`min-w-0 flex-1 truncate text-[13px] ${s.status === 'feito' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                          {s.title}
                        </span>
                        <button
                          onClick={() => send(deleteTask, { id: s.id })}
                          title="Apagar subtarefa"
                          className="shrink-0 rounded p-0.5 text-text-muted/45 opacity-0 transition hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  <input
                    value={novaSub}
                    onChange={(e) => setNovaSub(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') criarSub(); }}
                    onBlur={criarSub}
                    placeholder="Nova subtarefa"
                    className="w-full rounded-sm border border-transparent px-1 py-1 text-[13px] text-text-primary outline-none transition-colors hover:border-black/[0.08] focus:border-primary/40"
                  />
                </div>
              </Secao>

              <Anexos taskId={task.id} anexos={anexos} send={send} />

              {/* Visível para o cliente: mesma chave da etapa, no nível da tarefa. */}
              <label className="flex items-center gap-2 border-t border-black/[0.06] pt-4 text-[12px] text-text-secondary">
                <input
                  type="checkbox"
                  checked={task.clientVisible}
                  onChange={(e) => send(updateTask, { id: task.id, client_visible: e.target.checked ? 'on' : 'off' })}
                  className="h-3.5 w-3.5 accent-primary"
                />
                O cliente vê esta tarefa no link de acompanhamento
              </label>
            </div>
          </div>

          {/* A conversa em coluna própria, com o campo preso no rodapé: é onde
              fica registrado o que foi decidido no meio do caminho, e antes ela
              vivia no fim de uma rolagem comprida. */}
          <aside className="flex min-h-0 w-full flex-col border-t border-black/[0.07] bg-neutral-50/60 lg:w-[21rem] lg:border-l lg:border-t-0">
            <p className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-2.5 font-label text-[10px] uppercase tracking-wider text-text-muted">
              Conversa
              {quantasNaConversa > 0 && (
                <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 tabular-nums normal-case tracking-normal">
                  {quantasNaConversa}
                </span>
              )}
            </p>

            <div className="min-h-[8rem] flex-1 overflow-y-auto px-3 py-3">
              {quantasNaConversa === 0 ? (
                <p className="px-1 text-[12px] leading-relaxed text-text-muted">
                  Nada registrado ainda. O que for combinado por aqui fica junto da tarefa.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {conversa.map((c) => (
                    <li key={c.id} className="group rounded-md border border-black/[0.06] bg-white px-2.5 py-2">
                      <p className="mb-1 flex items-center gap-2 text-[11px] text-text-muted">
                        <span className="font-medium text-text-secondary">{c.autor ?? 'alguém'}</span>
                        {new Date(c.quando).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                        <button
                          onClick={() => {
                            if (confirm('Apagar este comentário?')) {
                              setRemovidos((r) => [...r, c.id]);
                              send(apagarComentario, { id: c.id });
                            }
                          }}
                          className="ml-auto rounded p-0.5 text-text-muted/40 opacity-0 transition hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                          aria-label="Apagar comentário"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </p>
                      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-text-primary">{c.texto}</p>
                    </li>
                  ))}

                  {/* O que acabou de ser escrito, enquanto o servidor não
                      confirma: mesmo balão, em tom mais baixo. */}
                  {pendentes.map((p) => (
                    <li key={p.id} className="rounded-md border border-dashed border-black/[0.08] bg-white/60 px-2.5 py-2">
                      <p className="mb-1 text-[11px] text-text-muted">enviando…</p>
                      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-text-secondary">{p.texto}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div ref={fimDaConversa} />
            </div>

            <div className="border-t border-black/[0.07] bg-white p-3">
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                onKeyDown={(e) => {
                  // Enter manda; Shift+Enter quebra linha, como em qualquer chat.
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    mandarComentario();
                  }
                }}
                rows={2}
                placeholder="Escrever um comentário (Enter manda)"
                className="w-full resize-y rounded-sm border border-black/[0.08] px-2.5 py-2 text-[13px] leading-relaxed text-text-primary outline-none transition-colors focus:border-primary/40"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** "2,4 MB", "812 KB". Tamanho de arquivo se lê arredondado. */
function fmtTamanho(bytes: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1).replace('.', ',')} MB`;
}

/**
 * Os arquivos da tarefa.
 *
 * O arquivo vai do navegador direto para o Storage, com uma permissão temporária
 * que o servidor assina: passar o arquivo pela server action esbarraria no teto
 * de 4,5 MB de corpo de requisição da Vercel, e aqui o limite é o do bucket, 25
 * MB. Só depois que o arquivo chega é que ele é registrado na tarefa — se a rede
 * cair no meio, sobra um arquivo solto no bucket, nunca uma linha apontando para
 * um arquivo que não existe.
 *
 * Anexo é sempre interno: não aparece no link de acompanhamento do cliente.
 */
function Anexos({ taskId, anexos, send }: {
  taskId: string;
  anexos: AnexoView[];
  send: Send;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subindo, setSubindo] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  // Some da lista no clique, sem esperar a volta do servidor.
  const [removidos, setRemovidos] = useState<string[]>([]);

  // Chegou lista nova do servidor: o que estava adiantado aqui já é verdade.
  useEffect(() => { setSubindo([]); setRemovidos([]); }, [anexos.length]);
  useEffect(() => { setRemovidos([]); setErro(null); }, [taskId]);

  const visiveis = anexos.filter((a) => !removidos.includes(a.id));

  const enviar = async (arquivos: FileList | File[]) => {
    setErro(null);
    for (const arquivo of Array.from(arquivos)) {
      setSubindo((s) => [...s, arquivo.name]);
      try {
        const permissao = await pedirUploadDeAnexo({
          taskId, nome: arquivo.name, tamanho: arquivo.size,
        });
        if (!permissao.ok) throw new Error(permissao.erro);

        const resposta = await fetch(permissao.url, { method: 'PUT', body: arquivo });
        if (!resposta.ok) throw new Error('O arquivo não chegou ao servidor.');

        const registro = await registrarAnexo({
          taskId, path: permissao.path, nome: arquivo.name,
          tipo: arquivo.type, tamanho: arquivo.size,
        });
        if (!registro.ok) throw new Error(registro.erro ?? 'Não deu para anexar.');
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Não deu para anexar o arquivo.');
      } finally {
        setSubindo((s) => { const i = s.indexOf(arquivo.name); return i < 0 ? s : [...s.slice(0, i), ...s.slice(i + 1)]; });
      }
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        if (e.dataTransfer.files?.length) enviar(e.dataTransfer.files);
      }}
      className={`rounded-md transition-colors ${arrastando ? 'bg-primary/[0.05] ring-1 ring-primary/30' : ''}`}
    >
      <p className="mb-1.5 flex items-center gap-2 font-label text-[10px] uppercase tracking-wider text-text-muted">
        Arquivos
        {visiveis.length > 0 && (
          <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 tabular-nums normal-case tracking-normal">
            {visiveis.length}
          </span>
        )}
        <button
          onClick={() => entrada.current?.click()}
          className="ml-auto inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium normal-case tracking-normal text-primary transition-colors hover:bg-primary/[0.08]"
        >
          <Paperclip className="h-3 w-3" />
          anexar
        </button>
      </p>

      <input
        ref={entrada}
        type="file"
        multiple
        onChange={(e) => { if (e.target.files?.length) enviar(e.target.files); e.target.value = ''; }}
        className="hidden"
      />

      {visiveis.length === 0 && subindo.length === 0 ? (
        <button
          onClick={() => entrada.current?.click()}
          className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-black/10 py-2 text-[12px] text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Paperclip className="h-3 w-3" />
          arraste um arquivo aqui, ou clique para escolher
        </button>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visiveis.map((a) => (
            <li
              key={a.id}
              className="group flex items-center gap-2 rounded-md border border-black/[0.06] bg-neutral-50 px-2.5 py-1.5"
            >
              <Paperclip className="h-3 w-3 shrink-0 text-text-muted" />
              {/* Abre em outra aba: o link assinado do Storage vale um minuto e
                  já vem como download, então a gaveta não se perde no caminho. */}
              <a
                href={`/admin/anexo/${a.id}`}
                target="_blank"
                rel="noreferrer"
                title={`Baixar ${a.nome}`}
                className="min-w-0 flex-1 truncate text-[12.5px] text-text-primary transition-colors hover:text-primary"
              >
                {a.nome}
              </a>
              <span className="shrink-0 text-[10px] tabular-nums text-text-muted">{fmtTamanho(a.tamanho)}</span>
              <button
                onClick={() => {
                  if (confirm(`Apagar o arquivo "${a.nome}"? Não tem como desfazer.`)) {
                    setRemovidos((r) => [...r, a.id]);
                    send(apagarAnexo, { id: a.id });
                  }
                }}
                className="shrink-0 rounded p-0.5 text-text-muted/40 opacity-0 transition hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                aria-label={`Apagar ${a.nome}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}

          {subindo.map((nome) => (
            <li
              key={`subindo-${nome}`}
              className="flex items-center gap-2 rounded-md border border-dashed border-black/[0.08] bg-neutral-50/60 px-2.5 py-1.5"
            >
              <Paperclip className="h-3 w-3 shrink-0 text-text-muted" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-text-secondary">{nome}</span>
              <span className="shrink-0 text-[10px] text-text-muted">enviando…</span>
            </li>
          ))}
        </ul>
      )}

      {erro && <p className="mt-1.5 text-[11px] text-danger">{erro}</p>}
    </div>
  );
}
