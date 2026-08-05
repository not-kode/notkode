import Link from 'next/link';
import { prettyService } from '../_shared/site-metrics';

/**
 * Quem mexeu no formulário e não enviou, com o que já tinha preenchido quando
 * parou. Antes esta lista dizia só "parou em: Contato" e ficava a dúvida do que
 * a pessoa tinha respondido até ali — o rascunho guarda tudo, só não aparecia.
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

const fmtQuando = (iso: string): string =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    .format(new Date(iso));

const waLink = (whatsapp: string) => `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;

/** O que a pessoa já tinha respondido, em uma linha por resposta. */
function Respostas({ p }: { p: Parou }) {
  const linhas: [string, string][] = [];
  if (p.company) linhas.push(['Empresa', p.company]);
  if (p.needs?.length) linhas.push(['Precisa de', p.needs.join(', ')]);
  if (p.timing) linhas.push(['Prazo', p.timing]);
  if (p.description) linhas.push(['Contou que', p.description]);

  if (linhas.length === 0) {
    return <span className="text-xs text-text-muted">parou antes de responder qualquer coisa</span>;
  }
  return (
    <dl className="flex flex-col gap-0.5">
      {linhas.map(([k, v]) => (
        <div key={k} className="flex gap-1.5 text-xs">
          <dt className="shrink-0 text-text-muted">{k}:</dt>
          <dd className="text-text-secondary">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PararamView({ pessoas }: { pessoas: Parou[] }) {
  if (pessoas.length === 0) {
    return (
      <p className="rounded-md border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-text-muted">
        Ninguém começou e largou o formulário no meio.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-warning/25 bg-warning/[0.03]">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-black/[0.06] text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
            <th className="px-4 py-3 font-medium">Quando</th>
            <th className="px-4 py-3 font-medium">Formulário</th>
            <th className="px-4 py-3 font-medium">Parou em</th>
            <th className="px-4 py-3 font-medium">Quem</th>
            <th className="px-4 py-3 font-medium">O que já tinha preenchido</th>
            <th className="px-4 py-3 font-medium">Ação</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map((p) => (
            <tr key={p.session_id} className="border-b border-border-subtle/10 align-top last:border-0">
              <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtQuando(p.updated_at)}</td>
              <td className="px-4 py-3 text-text-secondary">
                {p.service_tag ? prettyService(p.service_tag) : '—'}
                {p.kind && <span className="block font-label text-[10px] text-text-muted">{p.kind}</span>}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className="rounded-full bg-warning/15 px-2 py-0.5 font-label text-[10px] uppercase tracking-wider text-[#B45309]">
                  {p.last_step ?? 'começou'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-text-primary">{p.name ?? '—'}</div>
                {p.email && <div className="text-xs text-text-muted">{p.email}</div>}
                {p.whatsapp && <div className="text-xs text-text-muted">{p.whatsapp}</div>}
              </td>
              <td className="max-w-[22rem] px-4 py-3"><Respostas p={p} /></td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex flex-col items-start gap-1.5">
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
                  {p.temGravacao && (
                    <Link
                      href={`/admin/sessoes/${p.session_id}`}
                      className="inline-flex items-center gap-1 font-label text-[10px] text-primary transition-colors hover:underline"
                    >
                      ▶ ver gravação
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
