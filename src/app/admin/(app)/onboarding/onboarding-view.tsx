'use client';

import { useMemo, useState } from 'react';
import { ONBOARDING_SECTIONS } from '@/lib/onboarding-schema';
import { CopyLink } from './copy-link';
import { buildRequirements, buildClientMessage, deadlineLabel, REQUEST_DEADLINE_DAYS } from './onboarding-requirements';

// ─────────────────────────────────────────────────────────────────────────
// Visão admin do onboarding: tabela de briefings (escala com vários clientes)
// + drawer lateral com o briefing completo, seções separadas por filete e
// botão "copiar tudo" (bloco de texto pronto pra colar).
// ─────────────────────────────────────────────────────────────────────────

export type BriefingRow = {
  id: string;
  token: string;
  orgName: string;
  product_name: string | null;
  status: string;
  submitted_at: string | null;
  created_at: string;
  respostas: Record<string, string | string[]>;
  files: { name: string; url: string | null }[];
};

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function fmtDateShort(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  }).format(new Date(iso));
}

function answerText(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.join(', ');
  return (v ?? '').trim();
}

/** Seções com pelo menos uma resposta preenchida, já formatadas. */
function answeredSections(respostas: Record<string, string | string[]>) {
  return ONBOARDING_SECTIONS.map((section) => ({
    section,
    answered: section.questions
      .map((q) => ({ q, val: answerText(respostas[q.id]) }))
      .filter((x) => x.val !== ''),
  })).filter((s) => s.answered.length > 0);
}

function countAnswers(respostas: Record<string, string | string[]>): number {
  return Object.values(respostas).filter((v) => answerText(v) !== '').length;
}

/** Monta o bloco de texto do briefing inteiro para copiar. */
function buildCopyBlock(r: BriefingRow): string {
  const lines: string[] = [];
  lines.push(`# ${r.orgName}${r.product_name ? ` — ${r.product_name}` : ''}`);
  lines.push(`Status: ${r.status === 'enviado' ? 'respondido' : 'aguardando'}`);
  lines.push(`Criado em: ${fmtDate(r.created_at)}`);
  if (r.submitted_at) lines.push(`Enviado em: ${fmtDate(r.submitted_at)}`);
  lines.push('');

  for (const { section, answered } of answeredSections(r.respostas)) {
    lines.push(`## ${section.title}`);
    for (const { q, val } of answered) {
      lines.push(`${q.label}`);
      lines.push(`${val}`);
      lines.push('');
    }
  }

  if (r.files.length > 0) {
    lines.push('## Anexos');
    for (const f of r.files) lines.push(`- ${f.name.replace(/^\d+-/, '')}`);
  }

  return lines.join('\n').trim();
}

function StatusBadge({ enviado }: { enviado: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        enviado ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
      ].join(' ')}
    >
      {enviado ? 'respondido' : 'aguardando'}
    </span>
  );
}

function CopyButton({
  text,
  label,
  className = 'border-border-subtle text-text-secondary hover:border-primary hover:text-primary',
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors',
        className,
      ].join(' ')}
    >
      {copied ? '✓ copiado' : `⧉ ${label}`}
    </button>
  );
}

export function OnboardingView({
  rows,
  siteUrl,
}: {
  rows: BriefingRow[];
  siteUrl: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(() => rows.find((r) => r.id === openId) ?? null, [rows, openId]);

  if (rows.length === 0) {
    return <p className="text-sm text-text-muted">Nenhum briefing ainda.</p>;
  }

  return (
    <>
      {/* Tabela de briefings */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-elevated/40 text-left">
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Cliente</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Projeto</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Status</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Respostas</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Criado</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Enviado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const enviado = r.status === 'enviado';
              return (
                <tr
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  className="cursor-pointer border-b border-border-subtle/60 transition-colors last:border-0 hover:bg-surface-elevated/40"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{r.orgName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{r.product_name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge enviado={enviado} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{countAnswers(r.respostas)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{fmtDateShort(r.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{fmtDateShort(r.submitted_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-xs text-primary">abrir →</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer com o briefing completo */}
      {open && (
        <BriefingDrawer
          row={open}
          link={`${siteUrl}/onboarding/${open.token}`}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}

function BriefingDrawer({
  row,
  link,
  onClose,
}: {
  row: BriefingRow;
  link: string;
  onClose: () => void;
}) {
  const enviado = row.status === 'enviado';
  const sections = answeredSections(row.respostas);
  const copyText = useMemo(() => buildCopyBlock(row), [row]);
  const reqGroups = useMemo(() => buildRequirements(row), [row]);
  const clientMessage = useMemo(() => buildClientMessage(row, reqGroups), [row, reqGroups]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
      />

      {/* Painel */}
      <aside className="relative flex h-full w-full max-w-[34rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border-subtle bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold leading-tight text-text-primary">{row.orgName}</h2>
                <StatusBadge enviado={enviado} />
              </div>
              {row.product_name && (
                <p className="mt-0.5 font-mono text-xs text-text-muted">{row.product_name}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-md px-2 py-1 text-lg leading-none text-text-muted transition-colors hover:text-text-primary"
            >
              ×
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={copyText} label="copiar tudo" />
            <CopyLink url={link} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-text-muted">
            <span>Criado: {fmtDate(row.created_at)}</span>
            <span>Enviado: {fmtDate(row.submitted_at)}</span>
          </div>
        </div>

        {/* Corpo */}
        <div className="px-6 py-5">
          {/* Retorno pro cliente — o que ainda falta ele providenciar */}
          <div className="mb-6 rounded-lg border border-primary/25 bg-primary/[0.04] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-label text-[11px] uppercase tracking-[0.18em] text-primary">
                  📤 Retorno pro cliente
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-text-muted">
                  prazo {REQUEST_DEADLINE_DAYS} dias · até {deadlineLabel()}
                </p>
              </div>
              <CopyButton
                text={clientMessage}
                label="copiar mensagem"
                className="border-primary/40 bg-primary text-white hover:bg-primary/90"
              />
            </div>
            <div className="flex flex-col gap-3">
              {reqGroups.map((g) => (
                <div key={g.title}>
                  <p className="text-xs font-semibold text-text-primary">{g.title}</p>
                  {g.intro && <p className="mt-0.5 text-[11px] text-text-muted">{g.intro}</p>}
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {g.items.map((it, i) => (
                      <li key={i} className="text-xs text-text-secondary">
                        • {it.label}
                        {it.note && <span className="text-text-muted"> — {it.note}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Anexos */}
          {row.files.length > 0 && (
            <div className="mb-6 border-b border-border-subtle pb-6">
              <p className="mb-2 font-label text-[11px] uppercase tracking-[0.18em] text-text-muted">Anexos</p>
              <div className="flex flex-wrap gap-2">
                {row.files.map((f) => (
                  <a
                    key={f.name}
                    href={f.url ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    📎 {f.name.replace(/^\d+-/, '')}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Respostas por seção, separadas por filete */}
          {sections.length === 0 ? (
            <p className="text-sm text-text-muted">Ainda sem respostas.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle">
              {sections.map(({ section, answered }) => (
                <section key={section.id} className="py-5 first:pt-0 last:pb-0">
                  <p className="mb-3 font-label text-[11px] uppercase tracking-[0.18em] text-primary">
                    {section.title}
                  </p>
                  <dl className="flex flex-col gap-3.5">
                    {answered.map(({ q, val }) => (
                      <div key={q.id} className="grid grid-cols-1 gap-0.5">
                        <dt className="text-xs text-text-muted">{q.label}</dt>
                        <dd className="whitespace-pre-wrap text-sm text-text-primary">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
