'use client';

import { useState, useTransition } from 'react';
import { criarModelo, definirPadrao, duplicarModelo, excluirModelo, salvarModelo } from './modelos-actions';
import {
  EXPLICACAO_DO_BLOCO, ROTULO_DO_BLOCO, TIPOS_DE_BLOCO,
  type Bloco, type TipoDeBloco,
} from '@/app/admin/contrato/modelo';

export type ModeloRow = {
  id: string;
  nome: string;
  descricao: string | null;
  escopo_padrao: string | null;
  padrao: boolean;
  clausulas: Bloco[];
  emUso: number;
};

const input = 'w-full rounded-md border border-black/[0.1] bg-white px-2.5 py-1.5 text-xs outline-none transition focus:border-primary';
const rotulo = 'font-label text-[10px] uppercase tracking-wider text-text-muted';

const MARCADORES = [
  'cliente', 'cliente_cnpj', 'cliente_endereco', 'cliente_representante',
  'contratada', 'contratada_cnpj', 'contrato', 'escopo',
  'valor_mensal', 'valor_avulso', 'valor_total', 'vigencia_meses', 'inicio', 'fim',
];

/**
 * Modelos de contrato: o texto padrão de cada tipo de serviço. O contrato do
 * cliente só carrega o que muda (CNPJ, valor, datas, escopo).
 */
export function ModelosView({ modelos }: { modelos: ModeloRow[] }) {
  const [abertoId, setAbertoId] = useState<string | null>(modelos[0]?.id ?? null);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function novo(fd: FormData) {
    setErro(null);
    iniciar(async () => {
      const r = await criarModelo(fd);
      if (!r.ok) return setErro(r.erro ?? 'Não deu para criar.');
      setCriando(false);
      if (r.id) setAbertoId(r.id);
    });
  }

  function acao(fn: (fd: FormData) => Promise<{ ok: boolean; erro?: string; id?: string }>, id: string) {
    setErro(null);
    iniciar(async () => {
      const fd = new FormData();
      fd.set('id', id);
      const r = await fn(fd);
      if (!r.ok) return setErro(r.erro ?? 'Não deu para concluir.');
      if (r.id) setAbertoId(r.id);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Modelos de contrato</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            O texto padrão de cada tipo de serviço. No contrato do cliente muda só o que é dele: CNPJ, valor, datas e escopo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setCriando((v) => !v); setErro(null); }}
          className="font-label text-[10px] font-medium text-primary hover:underline"
        >
          {criando ? 'cancelar' : '+ novo modelo'}
        </button>
      </div>

      {criando && (
        <form action={novo} className="flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-3">
          <p className="text-[11px] text-text-muted">
            O modelo nasce com as cláusulas do contrato padrão da Notkode. Daí você ajusta o que muda neste serviço.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className={rotulo}>Nome</label>
              <input name="nome" required className={input} placeholder="Ex: Social Media" />
            </div>
            <div>
              <label className={rotulo}>Descrição (interna)</label>
              <input name="descricao" className={input} placeholder="Quando usar este modelo" />
            </div>
          </div>
          <button
            type="submit"
            disabled={pendente}
            className="self-start rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
          >
            Criar modelo
          </button>
        </form>
      )}

      {erro && <p className="text-xs text-danger">{erro}</p>}

      {modelos.length === 0 ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-3 py-8 text-center text-xs text-text-muted">
          Nenhum modelo ainda. Enquanto isso, todo contrato usa o padrão da Notkode embutido no sistema.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {modelos.map((m) => (
            <div key={m.id} className="rounded-lg border border-black/[0.07] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setAbertoId(abertoId === m.id ? null : m.id)}
                  className="flex items-center gap-2 text-left"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`text-text-muted transition-transform ${abertoId === m.id ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6" /></svg>
                  <span className="text-sm font-semibold text-text-primary">{m.nome}</span>
                  {m.padrao && <span className="rounded bg-primary/10 px-1.5 py-0.5 font-label text-[10px] uppercase tracking-wider text-primary">padrão</span>}
                  <span className="font-label text-[10px] text-text-muted">
                    {m.clausulas.length} cláusulas{m.emUso > 0 ? ` · ${m.emUso} contrato${m.emUso > 1 ? 's' : ''}` : ''}
                  </span>
                </button>
                <span className="flex items-center gap-2">
                  {!m.padrao && (
                    <button type="button" onClick={() => acao(definirPadrao, m.id)} disabled={pendente} className="font-label text-[10px] text-text-muted underline decoration-dotted hover:text-primary disabled:opacity-50">
                      tornar padrão
                    </button>
                  )}
                  <button type="button" onClick={() => acao(duplicarModelo, m.id)} disabled={pendente} className="font-label text-[10px] text-text-muted underline decoration-dotted hover:text-primary disabled:opacity-50">
                    duplicar
                  </button>
                  {!m.padrao && (
                    <button type="button" onClick={() => acao(excluirModelo, m.id)} disabled={pendente} className="font-label text-[10px] text-text-muted underline decoration-dotted hover:text-danger disabled:opacity-50">
                      excluir
                    </button>
                  )}
                </span>
              </div>

              {abertoId === m.id && <EditorDeModelo modelo={m} />}
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted">
        Marcadores disponíveis no texto livre: {MARCADORES.map((m) => `{{${m}}}`).join(', ')}.
      </p>
    </div>
  );
}

/** Edição de um modelo: dados e a lista de cláusulas, na ordem em que saem. */
function EditorDeModelo({ modelo }: { modelo: ModeloRow }) {
  const [nome, setNome] = useState(modelo.nome);
  const [descricao, setDescricao] = useState(modelo.descricao ?? '');
  const [escopo, setEscopo] = useState(modelo.escopo_padrao ?? '');
  const [blocos, setBlocos] = useState<Bloco[]>(modelo.clausulas);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function mexer(i: number, patch: Partial<Bloco>) {
    setBlocos((antes) => antes.map((b, j) => (j === i ? { ...b, ...patch } : b)));
    setSalvo(false);
  }
  function mover(i: number, passo: number) {
    setBlocos((antes) => {
      const destino = i + passo;
      if (destino < 0 || destino >= antes.length) return antes;
      const copia = [...antes];
      [copia[i], copia[destino]] = [copia[destino], copia[i]];
      return copia;
    });
    setSalvo(false);
  }
  function remover(i: number) {
    setBlocos((antes) => antes.filter((_, j) => j !== i));
    setSalvo(false);
  }
  function adicionar(tipo: TipoDeBloco) {
    setBlocos((antes) => [...antes, { tipo, titulo: ROTULO_DO_BLOCO[tipo], texto: tipo === 'texto' ? '' : undefined }]);
    setSalvo(false);
  }

  function salvar() {
    setErro(null);
    iniciar(async () => {
      const r = await salvarModelo({
        id: modelo.id, nome, descricao: descricao || null, escopo_padrao: escopo || null, clausulas: blocos,
      });
      if (!r.ok) return setErro(r.erro ?? 'Não deu para salvar.');
      setSalvo(true);
    });
  }

  return (
    <div className="border-t border-black/[0.06] p-3">
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <label className={rotulo}>Nome</label>
          <input value={nome} onChange={(e) => { setNome(e.target.value); setSalvo(false); }} className={input} />
        </div>
        <div>
          <label className={rotulo}>Descrição (interna)</label>
          <input value={descricao} onChange={(e) => { setDescricao(e.target.value); setSalvo(false); }} className={input} />
        </div>
      </div>

      <div className="mt-2">
        <label className={rotulo}>Escopo sugerido</label>
        <textarea
          value={escopo}
          onChange={(e) => { setEscopo(e.target.value); setSalvo(false); }}
          rows={3}
          className={`${input} resize-y`}
          placeholder="Texto do objeto que aparece quando o contrato não tem escopo próprio…"
        />
      </div>

      <p className={`${rotulo} mt-4`}>Cláusulas, na ordem em que saem</p>
      <div className="mt-1.5 flex flex-col gap-2">
        {blocos.map((b, i) => (
          <div key={i} className="rounded-md border border-black/[0.06] bg-[#F4F5F7] p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-label text-[10px] uppercase tracking-wider text-text-muted">
                Cláusula {i + 1} · {ROTULO_DO_BLOCO[b.tipo]}
              </span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="font-label text-[10px] text-text-muted hover:text-primary disabled:opacity-30">↑</button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === blocos.length - 1} className="font-label text-[10px] text-text-muted hover:text-primary disabled:opacity-30">↓</button>
                <button type="button" onClick={() => remover(i)} className="font-label text-[10px] text-text-muted underline decoration-dotted hover:text-danger">remover</button>
              </span>
            </div>

            <input
              value={b.titulo}
              onChange={(e) => mexer(i, { titulo: e.target.value })}
              className={`${input} mt-1.5`}
              placeholder="Título da cláusula"
            />

            {b.tipo === 'texto' ? (
              <textarea
                value={b.texto ?? ''}
                onChange={(e) => mexer(i, { texto: e.target.value })}
                rows={4}
                className={`${input} mt-1.5 resize-y`}
                placeholder="Uma linha por item. Cada linha vira 1.1, 1.2, 1.3…"
              />
            ) : (
              <p className="mt-1.5 text-[11px] text-text-muted">{EXPLICACAO_DO_BLOCO[b.tipo]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={rotulo}>Adicionar:</span>
        {TIPOS_DE_BLOCO.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => adicionar(t)}
            className="rounded border border-black/[0.1] px-2 py-0.5 font-label text-[10px] text-text-secondary transition hover:border-primary/40 hover:text-primary"
          >
            {ROTULO_DO_BLOCO[t]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={pendente}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
        >
          {pendente ? 'Salvando…' : 'Salvar modelo'}
        </button>
        {salvo && <span className="font-label text-[10px] text-success">salvo</span>}
        {erro && <span className="text-[11px] text-danger">{erro}</span>}
      </div>
    </div>
  );
}
