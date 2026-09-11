'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { prettyService } from '../_shared/site-metrics';

/**
 * Quem mexeu no formulário e não enviou. A linha responde "quem, de onde e em
 * que etapa parou"; o que a pessoa respondeu abre numa gaveta ao clicar.
 *
 * As respostas já vêm em pares ("Qual o cenário?: E-commerce"), e enfiadas numa
 * coluna da tabela viravam um parágrafo ilegível — era preciso ler letra por
 * letra para achar o que a pessoa escolheu.
 */

export type Parou = {
  session_id: string;
  service_tag: string | null;
  kind: string | null;
  name: string | null;
  company: string | null;
  email: string | null;
  whatsapp: string | null;
  needs: string[] | null;
  timing: string | null;
  description: string | null;
  last_step: string | null;
  updated_at: string;
  temGravacao: boolean;
};

/** kind do rascunho → o nome que a gente usa falando. */
const TIPO_DE_FORM: Record<string, string> = {
  pricing: 'Orçamento',
  qualification: 'Diagnóstico',
};

const fmtQuando = (iso: string): string =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    .format(new Date(iso));

const waLink = (whatsapp: string) => `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;

/** Respostas em pares pergunta → escolha, do jeito que o formulário guardou. */
function respostasDe(p: Parou): { pergunta: string; resposta: string }[] {
  const out: { pergunta: string; resposta: string }[] = [];
  if (p.company) out.push({ pergunta: 'Empresa', resposta: p.company });
  for (const item of p.needs ?? []) {
    const corte = item.indexOf(':');
    if (corte > 0) out.push({ pergunta: item.slice(0, corte).trim(), resposta: item.slice(corte + 1).trim() });
    else out.push({ pergunta: 'Precisa de', resposta: item });
  }
  if (p.timing) out.push({ pergunta: 'Prazo', resposta: p.timing });
  if (p.description) out.push({ pergunta: 'Contou que', resposta: p.description });
  return out;
}

export function PararamView({ pessoas }: { pessoas: Parou[] }) {
  const [abertaId, setAberta] = useState<string | null>(null);
  const aberta = pessoas.find((p) => p.session_id === abertaId) ?? null;

  if (pessoas.length === 0) {
    return (
      <p className="rounded-md border border-black/[0.06] bg-white px-4 py-10 text-center text-sm text-text-muted">
        Ninguém começou e largou o formulário no meio.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-black/[0.06] bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
              <th className="px-4 py-3 font-medium">Quando</th>
              <th className="px-4 py-3 font-medium">Formulário</th>
              <th className="px-4 py-3 font-medium">Parou em</th>
              <th className="px-4 py-3 font-medium">Quem</th>
              <th className="px-4 py-3 font-medium">Respostas</th>
              <th className="px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map((p) => {
              const respostas = respostasDe(p);
              return (
                <tr
                  key={p.session_id}
                  onClick={() => setAberta(p.session_id)}
                  className="cursor-pointer border-b border-border-subtle/10 transition-colors last:border-0 hover:bg-black/[0.02]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtQuando(p.updated_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {p.service_tag ? prettyService(p.service_tag) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 font-label text-[10px] uppercase tracking-wider text-[#B45309]">
                      {p.last_step ?? 'começou'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{p.name ?? '—'}</div>
                    {(p.email || p.whatsapp) && (
                      <div className="text-xs text-text-muted">{p.whatsapp ?? p.email}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {respostas.length > 0 ? (
                      <span className="text-xs text-primary">
                        {respostas.length} resposta{respostas.length === 1 ? '' : 's'} →
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">nenhuma</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {p.whatsapp ? (
                      <a
                        href={waLink(p.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-95"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-text-muted">sem whats</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {aberta && <Gaveta p={aberta} onFechar={() => setAberta(null)} />}
    </>
  );
}

function Gaveta({ p, onFechar }: { p: Parou; onFechar: () => void }) {
  const respostas = respostasDe(p);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      <aside className="relative flex h-full w-full max-w-[30rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-white px-5 py-4">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">
              {p.service_tag ? prettyService(p.service_tag) : 'Formulário'}
              {p.kind && ` · ${TIPO_DE_FORM[p.kind] ?? p.kind}`}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold leading-tight text-text-primary">{p.name ?? 'Sem nome'}</h2>
            <p className="mt-1 text-xs text-text-muted">
              parou em <span className="font-medium text-[#B45309]">{p.last_step ?? 'começou'}</span>
              {' · '}{fmtQuando(p.updated_at)}
            </p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {p.whatsapp && (
              <a
                href={waLink(p.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-95"
              >
                Chamar no WhatsApp
              </a>
            )}
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                className="inline-flex items-center gap-1 rounded-md border border-black/[0.1] px-3 py-1.5 text-xs text-text-secondary transition hover:border-primary/40 hover:text-primary"
              >
                {p.email}
              </a>
            )}
            {p.temGravacao && (
              <Link
                href={`/admin/sessoes/${p.session_id}`}
                className="inline-flex items-center gap-1 rounded-md border border-black/[0.1] px-3 py-1.5 text-xs text-text-secondary transition hover:border-primary/40 hover:text-primary"
              >
                ▶ ver gravação
              </Link>
            )}
          </div>

          <div>
            <p className="mb-2 font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">
              O que respondeu até parar
            </p>
            {respostas.length === 0 ? (
              <p className="rounded-md border border-black/[0.06] bg-neutral-50 px-3 py-4 text-center text-xs text-text-muted">
                Parou antes de responder qualquer coisa.
              </p>
            ) : (
              <dl className="flex flex-col divide-y divide-black/[0.05] rounded-md border border-black/[0.06]">
                {respostas.map((r, i) => (
                  <div key={`${r.pergunta}-${i}`} className="px-3 py-2.5">
                    <dt className="text-[11px] text-text-muted">{r.pergunta}</dt>
                    <dd className="mt-0.5 text-sm text-text-primary">{r.resposta}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
