'use client';

import { useState, useTransition } from 'react';
import { cancelarAssinatura, enviarParaAssinatura, reenviarConvite } from './assinatura-actions';

export type AssinaturaResumo = {
  id: string;
  codigo: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  signatarios: { id: string; nome: string; email: string; papel: string; status: string; assinado_em: string | null }[];
};

const rotulo = 'font-label text-[10px] uppercase tracking-wider text-text-muted';
const campo = 'w-full rounded-md border border-black/[0.1] bg-white px-2.5 py-1.5 text-xs outline-none transition focus:border-primary';

const dataCurta = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }) : '—';

/**
 * Assinatura eletrônica dentro do card do contrato: dispara o envio, mostra em
 * que pé está cada signatário e leva para a verificação quando termina.
 */
export function AssinaturaBloco({
  engagementId,
  assinatura,
  sugestao,
  faltamDados,
}: {
  engagementId: string;
  assinatura: AssinaturaResumo | null;
  /** Cadastro do cliente, para não digitar de novo o que o sistema já sabe. */
  sugestao: { nome: string | null; email: string | null; documento: string | null };
  /** Campos do cadastro que ainda faltam para o contrato sair completo. */
  faltamDados: string[];
}) {
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar(fd: FormData) {
    setErro(null); setAviso(null);
    iniciar(async () => {
      const r = await enviarParaAssinatura(fd);
      if (!r.ok) return setErro(r.erro ?? 'Não deu para enviar.');
      setAbrindo(false);
      setAviso(r.aviso ?? 'Enviado. O cliente recebeu o link por e-mail.');
    });
  }

  function cancelar(requestId: string) {
    setErro(null); setAviso(null);
    iniciar(async () => {
      const fd = new FormData();
      fd.set('request_id', requestId);
      const r = await cancelarAssinatura(fd);
      if (!r.ok) setErro(r.erro ?? 'Não deu para cancelar.');
    });
  }

  function reenviar(signerId: string) {
    setErro(null); setAviso(null);
    iniciar(async () => {
      const fd = new FormData();
      fd.set('signer_id', signerId);
      const r = await reenviarConvite(fd);
      if (!r.ok) return setErro(r.erro ?? 'Não deu para reenviar.');
      setAviso('Convite reenviado.');
    });
  }

  const assinado = assinatura?.status === 'assinado';

  return (
    <div className="mt-3 border-t border-black/[0.06] pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={rotulo}>Assinatura</p>

        {!assinatura && (
          <button
            type="button"
            onClick={() => { setAbrindo((v) => !v); setErro(null); setAviso(null); }}
            className="font-label text-[10px] font-medium text-primary hover:underline"
          >
            {abrindo ? 'cancelar' : '+ enviar para assinatura'}
          </button>
        )}

        {assinatura && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 font-label text-[10px] uppercase tracking-wider ${assinado ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
              {assinado ? 'assinado' : 'aguardando'}
            </span>
            <a
              href={`/verificar/${assinatura.codigo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-[10px] uppercase tracking-wider text-text-secondary underline decoration-dotted transition hover:text-primary"
            >
              {assinado ? 'ver documento assinado' : 'acompanhar'}
            </a>
            {!assinado && (
              <button
                type="button"
                onClick={() => cancelar(assinatura.id)}
                disabled={pendente}
                className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50"
              >
                cancelar
              </button>
            )}
          </div>
        )}
      </div>

      {assinatura && (
        <ul className="mt-2 space-y-1">
          {assinatura.signatarios.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-text-secondary">
                {s.nome} <span className="text-text-muted">· {s.papel}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {s.status === 'assinado' ? (
                  <span className="font-label text-[10px] text-success">✓ {dataCurta(s.assinado_em)}</span>
                ) : s.status === 'recusado' ? (
                  <span className="font-label text-[10px] text-danger">recusou</span>
                ) : (
                  <>
                    <span className="font-label text-[10px] text-text-muted">pendente</span>
                    <button
                      type="button"
                      onClick={() => reenviar(s.id)}
                      disabled={pendente}
                      className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-primary disabled:opacity-50"
                    >
                      reenviar
                    </button>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {abrindo && !assinatura && (
        <form action={enviar} className="mt-2 flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-2.5">
          <input type="hidden" name="id" value={engagementId} />
          {faltamDados.length > 0 && (
            <p className="text-[11px] text-danger">
              Antes de enviar, complete no cadastro do cliente: {faltamDados.join(', ')}.
            </p>
          )}
          <p className="text-[11px] text-text-muted">
            Quem assina pelo cliente. A Notkode entra automaticamente como CONTRATADA.
          </p>
          <div>
            <label className={rotulo}>Nome de quem assina</label>
            <input name="nome" required defaultValue={sugestao.nome ?? ''} className={campo} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={rotulo}>E-mail</label>
              <input name="email" type="email" required defaultValue={sugestao.email ?? ''} className={campo} placeholder="email@empresa.com.br" />
            </div>
            <div>
              <label className={rotulo}>CPF</label>
              <input name="documento" defaultValue={sugestao.documento ?? ''} className={campo} placeholder="000.000.000-00" />
            </div>
          </div>
          <button
            type="submit"
            disabled={pendente}
            className="self-start rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
          >
            {pendente ? 'Enviando…' : 'Congelar documento e enviar'}
          </button>
          <p className="text-[10px] text-text-muted">
            O documento é congelado neste momento: mudanças posteriores no contrato não afetam o que foi assinado.
          </p>
        </form>
      )}

      {erro && <p className="mt-2 text-[11px] text-danger">{erro}</p>}
      {aviso && <p className="mt-2 text-[11px] text-text-secondary">{aviso}</p>}
    </div>
  );
}
