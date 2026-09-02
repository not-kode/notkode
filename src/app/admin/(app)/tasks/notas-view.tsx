'use client';

// Base de notas: diagnósticos, estratégias, decisões, fichas de pessoas. Veio do
// SimbOS junto com as tarefas e ficou aqui como aba do projeto, porque quase
// toda nota é sobre um cliente. As que não são de ninguém ficam em "Gerais".
//
// O conteúdo é markdown escrito por gente e por IA, e a nota abre numa janela
// no meio da tela, já formatada. Antes ela abria dentro da própria lista, o que
// empurrava todas as outras para baixo, e o texto aparecia cru, com asterisco e
// sustenido no meio. Editar é um clique a mais: quase toda visita é para ler.

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Lightbulb, Link2, Pencil, Plus, Search, Trash2, User, X } from 'lucide-react';
import { Markdown } from '@/components/markdown';
import { apagarNota, atualizarNota, criarNota } from './actions';
import type { NotaView, Send } from './types';

const TIPO_ICONE: Record<string, typeof FileText> = {
  nota: FileText,
  aprendizado: Lightbulb,
  pessoa: User,
  recurso: Link2,
};

const TIPO_TOM: Record<string, string> = {
  nota: 'bg-black/[0.04] text-text-secondary',
  aprendizado: 'bg-warning/15 text-[#B45309]',
  pessoa: 'bg-primary/10 text-primary',
  recurso: 'bg-success/12 text-[#15803D]',
};

const quando = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
};

export function NotasView({ notas, projectId, projetoNome, send }: {
  notas: NotaView[];
  projectId: string;
  projetoNome: string;
  send: Send;
}) {
  const [busca, setBusca] = useState('');
  const [abertaId, setAberta] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  const doProjeto = useMemo(() => notas.filter((n) => n.projetoId === projectId), [notas, projectId]);
  const gerais = useMemo(() => notas.filter((n) => !n.projetoId), [notas]);

  const filtra = (lista: NotaView[]) => {
    const alvo = busca.trim().toLowerCase();
    if (!alvo) return lista;
    return lista.filter(
      (n) =>
        n.titulo.toLowerCase().includes(alvo) ||
        (n.conteudo ?? '').toLowerCase().includes(alvo) ||
        n.tags.some((t) => t.toLowerCase().includes(alvo)),
    );
  };

  const aberta = notas.find((n) => n.id === abertaId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no título, no texto ou nas tags"
            className="w-full rounded-md border border-black/[0.08] bg-white py-1.5 pl-8 pr-3 text-[13px] text-text-primary outline-none transition-colors focus:border-primary/40"
          />
        </div>
        <button
          onClick={() => { setCriando(true); setAberta(null); }}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova nota
        </button>
      </div>

      {(criando || aberta) && (
        <Janela
          key={aberta?.id ?? 'nova'}
          nota={criando ? null : aberta}
          projectId={projectId}
          send={send}
          onFechar={() => { setCriando(false); setAberta(null); }}
        />
      )}

      <Secao titulo={projetoNome} notas={filtra(doProjeto)} aberta={abertaId} onAbrir={(id) => { setCriando(false); setAberta(id); }} />
      <Secao titulo="Gerais" notas={filtra(gerais)} aberta={abertaId} onAbrir={(id) => { setCriando(false); setAberta(id); }} />
    </div>
  );
}

function Secao({ titulo, notas, aberta, onAbrir }: {
  titulo: string;
  notas: NotaView[];
  aberta: string | null;
  onAbrir: (id: string) => void;
}) {
  if (notas.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-md border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <header className="flex items-center gap-2 border-b border-black/[0.06] bg-neutral-50 px-3 py-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{titulo}</h3>
        <span className="text-[11px] tabular-nums text-text-muted">{notas.length}</span>
      </header>

      <ul className="divide-y divide-black/[0.05]">
        {notas.map((n) => {
          const Icone = TIPO_ICONE[n.tipo] ?? FileText;
          return (
            <li key={n.id}>
              <button
                onClick={() => onAbrir(n.id)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-neutral-50 ${
                  aberta === n.id ? 'bg-primary/[0.04]' : ''
                }`}
              >
                <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${TIPO_TOM[n.tipo] ?? TIPO_TOM.nota}`}>
                  <Icone className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-text-primary">{n.titulo}</span>
                  {n.tags.length > 0 && (
                    <span className="block truncate text-[11px] text-text-muted">{n.tags.slice(0, 6).join(' · ')}</span>
                  )}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-text-muted">{quando(n.atualizadaEm)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * A nota numa janela no meio da tela: aberta para ler, formatada, e editável no
 * clique do lápis. Nota nova já abre escrevendo, porque não há o que ler.
 */
function Janela({ nota, projectId, send, onFechar }: {
  nota: NotaView | null;
  projectId: string;
  send: Send;
  onFechar: () => void;
}) {
  const [editando, setEditando] = useState(!nota);
  const [titulo, setTitulo] = useState(nota?.titulo ?? '');
  const [conteudo, setConteudo] = useState(nota?.conteudo ?? '');

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  const salvar = () => {
    const limpo = titulo.trim();
    if (!limpo) return;
    if (nota) send(atualizarNota, { id: nota.id, title: limpo, content: conteudo });
    else send(criarNota, { engagement_id: projectId, title: limpo, content: conteudo });
  };

  const Icone = TIPO_ICONE[nota?.tipo ?? 'nota'] ?? FileText;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10">
      <button aria-label="Fechar" onClick={onFechar} className="fixed inset-0 bg-black/25" />

      <section className="relative flex w-full max-w-3xl flex-col rounded-lg border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]">
        <header className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
          <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${TIPO_TOM[nota?.tipo ?? 'nota'] ?? TIPO_TOM.nota}`}>
            <Icone className="h-3.5 w-3.5" />
          </span>

          {editando ? (
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onBlur={salvar}
              placeholder="Título da nota"
              className="min-w-0 flex-1 rounded-sm border border-transparent px-1.5 py-1 text-[15px] font-semibold text-text-primary outline-none transition-colors hover:border-black/[0.08] focus:border-primary/40"
            />
          ) : (
            <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-text-primary">{titulo}</h2>
          )}

          {nota && (
            <>
              <button
                onClick={() => { if (editando) salvar(); setEditando((v) => !v); }}
                title={editando ? 'Salvar e voltar a ler' : 'Editar a nota'}
                className={`rounded-md px-2 py-1 text-[11px] transition ${
                  editando
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'text-text-muted hover:bg-black/[0.05] hover:text-text-primary'
                }`}
              >
                {editando ? 'salvar' : <Pencil className="h-4 w-4" />}
              </button>

              {nota.projetoId !== projectId ? (
                <button
                  onClick={() => send(atualizarNota, { id: nota.id, engagement_id: projectId })}
                  title="Prender esta nota ao projeto aberto"
                  className="hidden rounded-md border border-black/[0.1] px-2 py-1 text-[11px] text-text-secondary transition hover:border-primary/40 hover:text-primary sm:block"
                >
                  trazer para este projeto
                </button>
              ) : (
                <button
                  onClick={() => send(atualizarNota, { id: nota.id, engagement_id: '' })}
                  title="Soltar do projeto e deixar em Gerais"
                  className="hidden rounded-md border border-black/[0.1] px-2 py-1 text-[11px] text-text-secondary transition hover:border-primary/40 hover:text-primary sm:block"
                >
                  soltar do projeto
                </button>
              )}

              <button
                onClick={() => { if (confirm(`Apagar a nota "${nota.titulo}"?`)) { send(apagarNota, { id: nota.id }); onFechar(); } }}
                className="rounded p-1 text-text-muted/60 transition hover:bg-danger/10 hover:text-danger"
                aria-label="Apagar nota"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => { if (editando) salvar(); onFechar(); }}
            title="Fechar"
            className="rounded p-1 text-text-muted transition hover:bg-black/[0.05] hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-5 py-4">
          {editando ? (
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              onBlur={salvar}
              rows={Math.min(28, Math.max(12, conteudo.split('\n').length + 2))}
              placeholder="O conteúdo da nota. Markdown é bem-vindo."
              className="w-full resize-y rounded-sm border border-black/[0.08] px-3 py-2 font-mono text-[12.5px] leading-relaxed text-text-primary outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          ) : conteudo.trim() ? (
            <Markdown texto={conteudo} />
          ) : (
            <p className="text-[13px] text-text-muted">Nota sem conteúdo. Clique no lápis para escrever.</p>
          )}

          {nota && nota.tags.length > 0 && !editando && (
            <p className="mt-4 border-t border-black/[0.06] pt-3 text-[11px] text-text-muted">
              {nota.tags.join(' · ')}
            </p>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
