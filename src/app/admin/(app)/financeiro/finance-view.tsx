'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { AutoSaveForm } from '../_shared/auto-save-form';
import { createReceivable, deleteReceivable, generateMonthlyReceivables, markReceivablePaid, unmarkReceivable, updateReceivable } from './actions';
import { isRecurring, monthlyDueDate, pendingMonthly } from './recurring';

export type EngView = {
  id: string; title: string | null; type: string; status: string; lifecycle: string;
  valor: number | null; mrr: number | null; billing_cycle: string | null;
  start_date: string | null; end_date: string | null; notes: string | null;
  organization_id: string | null; org_name: string | null;
};
export type RecView = {
  id: string; description: string | null; amount: number; due_date: string;
  status: string; paid_amount: number | null; paid_at: string | null;
  engagement_id: string | null; engagement_title: string | null; org_name: string | null;
};
type Org = { id: string; name: string };
type DetailKey = 'mrr' | 'aReceber' | 'atrasado' | 'recebido';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
const fmtDate = (d: string | null) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};
const ym = (d: string) => d.slice(0, 7);
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};
const shiftMonth = (key: string, delta: number) => {
  const [y, m] = key.split('-').map(Number);
  const d = (y * 12 + (m - 1)) + delta;
  return `${Math.floor(d / 12)}-${String((d % 12) + 1).padStart(2, '0')}`;
};

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

function Kpi({ label, value, tone, count, onClick }: { label: string; value: string; tone?: string; count?: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-md border border-black/[0.06] bg-white p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
    >
      <p className="font-label text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone ?? 'text-text-primary'}`}>{value}</p>
      {count != null && <p className="mt-1 font-label text-[10px] text-text-muted/70">{count} {count === 1 ? 'item' : 'itens'}</p>}
    </button>
  );
}

function StatusPill({ status, late }: { status: string; late?: boolean }) {
  const label = late && status === 'pendente' ? 'Atrasado' : { pendente: 'Pendente', recebido: 'Recebido', atrasado: 'Atrasado', cancelado: 'Cancelado' }[status] ?? status;
  const cls = status === 'recebido' ? 'bg-success/10 text-success' : late ? 'bg-danger/10 text-danger' : 'bg-black/[0.05] text-text-secondary';
  return <span className={`rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wider ${cls}`}>{label}</span>;
}

export function FinanceView({ engagements, receivables }: { engagements: EngView[]; receivables: RecView[]; orgs: Org[] }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [month, setMonth] = useState(todayStr.slice(0, 7));
  const [newParcela, setNewParcela] = useState(false);
  const [editing, setEditing] = useState<RecView | null>(null);
  const [detail, setDetail] = useState<DetailKey | null>(null);
  const [pending, start] = useTransition();

  const isLate = (r: RecView) => r.status === 'pendente' && r.due_date < todayStr;
  const monthShort = MONTHS[Number(month.slice(5)) - 1].slice(0, 3);

  // Listas que compõem cada KPI — o número e o "de onde vem" saem da mesma fonte.
  const listas = useMemo(() => {
    const recorrentes = engagements.filter(isRecurring);
    const aReceber = receivables.filter((r) => r.status === 'pendente' && ym(r.due_date) === month && !isLate(r));
    const atrasado = receivables.filter(isLate);
    const recebido = receivables.filter((r) => r.status === 'recebido' && ym(r.paid_at ?? r.due_date) === month);
    return { recorrentes, aReceber, atrasado, recebido };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagements, receivables, month, todayStr]);

  const kpis = useMemo(() => ({
    // Mesma régua da Visão geral: "a receber" = pendente AINDA NO PRAZO; o que
    // venceu conta só no cartão Atrasado (antes a mesma parcela dobrava nos dois).
    mrr: listas.recorrentes.reduce((s, e) => s + (e.mrr ?? 0), 0),
    aReceber: listas.aReceber.reduce((s, r) => s + r.amount, 0),
    atrasado: listas.atrasado.reduce((s, r) => s + r.amount, 0),
    recebido: listas.recebido.reduce((s, r) => s + (r.paid_amount ?? r.amount), 0),
  }), [listas]);

  const parcelasMes = useMemo(() => receivables.filter((r) => ym(r.due_date) === month), [receivables, month]);

  // Vencimentos já lançados por contrato: base para saber o dia habitual da
  // cobrança e quais mensalidades ainda faltam no mês.
  const duesByEng = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const r of receivables) {
      if (!r.engagement_id) continue;
      map.set(r.engagement_id, [...(map.get(r.engagement_id) ?? []), r.due_date]);
    }
    return map;
  }, [receivables]);

  const faltantes = useMemo(() => pendingMonthly(engagements, duesByEng, month), [engagements, duesByEng, month]);

  const gerarMensalidades = (engagementId?: string) => {
    const fd = new FormData();
    fd.set('month', month);
    if (engagementId) fd.set('engagement_id', engagementId);
    start(() => generateMonthlyReceivables(fd));
  };

  const markPaid = (id: string, amount: number) => {
    const fd = new FormData();
    fd.set('id', id);
    fd.set('amount', String(amount));
    start(() => markReceivablePaid(fd));
  };
  const unmark = (id: string) => {
    const fd = new FormData();
    fd.set('id', id);
    start(() => unmarkReceivable(fd));
  };

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro de mês global */}
          <div className="flex items-center gap-1 rounded-md border border-black/[0.08] bg-white p-1">
            <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="rounded p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary" aria-label="Mês anterior">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="min-w-[8.5rem] text-center text-sm font-medium text-text-primary">{monthLabel(month)}</span>
            <button onClick={() => setMonth((m) => shiftMonth(m, 1))} className="rounded p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary" aria-label="Próximo mês">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            {month !== todayStr.slice(0, 7) && (
              <button onClick={() => setMonth(todayStr.slice(0, 7))} className="ml-1 rounded px-2 py-1 font-label text-[10px] uppercase tracking-wider text-primary hover:bg-primary/5">Hoje</button>
            )}
          </div>
          <button onClick={() => setNewParcela(true)} className="rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-primary/40 hover:text-primary">+ Parcela</button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="MRR ativo" value={brl(kpis.mrr)} tone="text-primary" count={listas.recorrentes.length} onClick={() => setDetail('mrr')} />
        <Kpi label={`A receber · ${monthShort}`} value={brl(kpis.aReceber)} count={listas.aReceber.length} onClick={() => setDetail('aReceber')} />
        <Kpi label="Atrasado" value={brl(kpis.atrasado)} tone={kpis.atrasado > 0 ? 'text-danger' : undefined} count={listas.atrasado.length} onClick={() => setDetail('atrasado')} />
        <Kpi label={`Recebido · ${monthShort}`} value={brl(kpis.recebido)} tone="text-success" count={listas.recebido.length} onClick={() => setDetail('recebido')} />
      </div>

      {/* Mensalidade de contrato recorrente não nasce sozinha: aqui aparece o que
          falta lançar no mês aberto, com o lançamento em um clique. */}
      {faltantes.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning/30 bg-warning/[0.06] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {faltantes.length === 1 ? '1 mensalidade recorrente ainda não lançada' : `${faltantes.length} mensalidades recorrentes ainda não lançadas`} em {monthLabel(month)}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {faltantes.map(({ eng }) => `${eng.org_name ?? eng.title}`).join(', ')} · {brl(faltantes.reduce((s, f) => s + (f.eng.mrr ?? 0), 0))}
            </p>
          </div>
          <button onClick={() => gerarMensalidades()} disabled={pending} className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
            {pending ? 'Lançando…' : 'Lançar mensalidades'}
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Parcelas de {monthLabel(month)}</h2>
        {parcelasMes.length === 0 ? (
          <p className="rounded-md border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-text-muted">Nenhuma parcela em {monthLabel(month)}.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-black/[0.06] bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left font-label text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {parcelasMes.map((r) => {
                  const late = isLate(r);
                  return (
                    <tr key={r.id} onClick={() => setEditing(r)} className="cursor-pointer border-b border-black/[0.04] transition-colors last:border-0 hover:bg-black/[0.015]">
                      <td className={`whitespace-nowrap px-4 py-3 font-label text-xs ${late ? 'text-danger' : 'text-text-muted'}`}>{fmtDate(r.due_date)}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{r.org_name ?? '—'}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.description ?? r.engagement_title ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-text-primary">{brl(r.amount)}</td>
                      <td className="px-4 py-3"><StatusPill status={r.status} late={late} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {r.status === 'recebido' ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="font-label text-[10px] text-success">✓ {fmtDate(r.paid_at)}</span>
                            <button onClick={() => unmark(r.id)} disabled={pending} className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50">desfazer</button>
                          </span>
                        ) : r.status === 'cancelado' ? (
                          <span className="font-label text-[10px] text-text-muted">cancelada</span>
                        ) : (
                          <button onClick={() => markPaid(r.id, r.amount)} disabled={pending} className="rounded-md border border-success/40 px-3 py-1.5 text-xs font-medium text-success transition hover:bg-success/10 disabled:opacity-50">Marcar recebida</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {newParcela && (
        <ParcelaDrawer
          engagements={engagements}
          defaultDate={`${month}-01`}
          pending={pending}
          onClose={() => setNewParcela(false)}
          onSubmit={(fd) => start(async () => { await createReceivable(fd); setNewParcela(false); })}
        />
      )}

      {detail && (
        <DetailDrawer
          which={detail}
          month={month}
          listas={listas}
          duesByEng={duesByEng}
          isLate={isLate}
          pending={pending}
          onClose={() => setDetail(null)}
          onPickParcela={(r) => { setDetail(null); setEditing(r); }}
          onGerar={gerarMensalidades}
        />
      )}

      {editing && (
        <ParcelaDrawer
          key={editing.id}
          parcela={editing}
          engagements={engagements}
          pending={pending}
          onClose={() => setEditing(null)}
          onSubmit={(fd) => start(() => updateReceivable(fd))}
          onDelete={() => start(async () => {
            const fd = new FormData();
            fd.set('id', editing.id);
            await deleteReceivable(fd);
            setEditing(null);
          })}
        />
      )}
    </div>
  );
}

/**
 * Detalhamento de um KPI: mostra de onde vem o número. No MRR são os contratos
 * recorrentes (com o estado da mensalidade do mês); nos demais, as parcelas que
 * entram na conta — e clicar em qualquer uma leva direto para a edição.
 */
function DetailDrawer({ which, month, listas, duesByEng, isLate, pending, onClose, onPickParcela, onGerar }: {
  which: DetailKey;
  month: string;
  listas: { recorrentes: EngView[]; aReceber: RecView[]; atrasado: RecView[]; recebido: RecView[] };
  duesByEng: Map<string, string[]>;
  isLate: (r: RecView) => boolean;
  pending: boolean;
  onClose: () => void;
  onPickParcela: (r: RecView) => void;
  onGerar: (engagementId?: string) => void;
}) {
  const titles: Record<DetailKey, string> = {
    mrr: 'MRR ativo',
    aReceber: `A receber · ${monthLabel(month)}`,
    atrasado: 'Atrasado',
    recebido: `Recebido · ${monthLabel(month)}`,
  };
  const parcelas = which === 'mrr' ? [] : listas[which];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <aside className="relative flex h-full w-full max-w-[30rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{titles[which]}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-text-muted hover:bg-black/[0.04] hover:text-text-primary" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 px-5 py-4">
          {which === 'mrr' ? (
            listas.recorrentes.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum contrato recorrente ativo.</p>
            ) : (
              listas.recorrentes.map((e) => {
                const dues = duesByEng.get(e.id) ?? [];
                const lancada = dues.find((d) => d.slice(0, 7) === month) ?? null;
                const previsto = lancada ? null : monthlyDueDate(e, month, dues);
                return (
                  <div key={e.id} className="rounded-md border border-black/[0.06] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{e.org_name ?? '—'}</p>
                        <p className="text-xs text-text-muted">{e.title}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-primary">{brl(e.mrr ?? 0)}<span className="font-label text-[10px] font-normal text-text-muted">/mês</span></p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-black/[0.04] pt-2">
                      {lancada ? (
                        <span className="font-label text-[10px] uppercase tracking-wider text-success">✓ lançada · vence {fmtDate(lancada)}</span>
                      ) : previsto ? (
                        <>
                          <span className="font-label text-[10px] uppercase tracking-wider text-warning">não lançada · venceria {fmtDate(previsto)}</span>
                          <button onClick={() => onGerar(e.id)} disabled={pending} className="rounded border border-primary/40 px-2 py-0.5 text-[10px] font-medium text-primary transition hover:bg-primary/5 disabled:opacity-50">Lançar</button>
                        </>
                      ) : (
                        <span className="font-label text-[10px] uppercase tracking-wider text-text-muted">fora da vigência neste mês</span>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : parcelas.length === 0 ? (
            <p className="text-sm text-text-muted">Nada aqui neste recorte.</p>
          ) : (
            parcelas.map((r) => (
              <button
                key={r.id}
                onClick={() => onPickParcela(r)}
                className="flex items-start justify-between gap-3 rounded-md border border-black/[0.06] p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.org_name ?? '—'}</p>
                  <p className="text-xs text-text-secondary">{r.description ?? r.engagement_title ?? '—'}</p>
                  <p className="mt-1 font-label text-[10px] text-text-muted">
                    vence {fmtDate(r.due_date)}
                    {r.status === 'recebido' && r.paid_at && ` · recebida ${fmtDate(r.paid_at)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-text-primary">{brl(r.status === 'recebido' ? (r.paid_amount ?? r.amount) : r.amount)}</p>
                  <div className="mt-1"><StatusPill status={r.status} late={isLate(r)} /></div>
                </div>
              </button>
            ))
          )}
        </div>

      </aside>
    </div>
  );
}

/** Drawer de parcela: serve para criar (sem `parcela`) e para editar (com `parcela`). */
function ParcelaDrawer({ parcela, engagements, defaultDate, pending, onClose, onSubmit, onDelete }: {
  parcela?: RecView;
  engagements: EngView[];
  defaultDate?: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (fd: FormData) => void;
  onDelete?: () => void;
}) {
  const editMode = !!parcela;
  const [status, setStatus] = useState(parcela?.status ?? 'pendente');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const flushRef = useRef<(() => void) | null>(null);
  const fechar = () => { flushRef.current?.(); onClose(); };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fechar" onClick={fechar} className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <aside className="relative flex h-full w-full max-w-[26rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{editMode ? 'Editar parcela' : 'Nova parcela'}</h2>
            {parcela?.org_name && <p className="mt-0.5 text-xs text-text-muted">{parcela.org_name}</p>}
          </div>
          <button onClick={fechar} className="rounded-md p-1 text-text-muted hover:bg-black/[0.04] hover:text-text-primary" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <AutoSaveForm action={onSubmit} auto={editMode} flushRef={flushRef} className="flex flex-col gap-3 px-5 py-4">
          {editMode && <input type="hidden" name="id" value={parcela.id} />}
          <div>
            <label className={labelCls}>Descrição</label>
            <input name="description" defaultValue={parcela?.description ?? ''} className={inputCls} placeholder="Ex: Parcela 1 de 3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Valor (R$)</label>
              <input name="amount" inputMode="decimal" required defaultValue={parcela ? String(parcela.amount) : ''} className={inputCls} placeholder="5000" />
            </div>
            <div>
              <label className={labelCls}>Vencimento</label>
              <input name="due_date" type="date" required defaultValue={parcela?.due_date ?? defaultDate ?? ''} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Contrato</label>
            <select name="engagement_id" className={inputCls} defaultValue={parcela?.engagement_id ?? ''}>
              <option value="">—</option>
              {engagements.map((e) => <option key={e.id} value={e.id}>{e.org_name ? `${e.org_name} · ` : ''}{e.title}</option>)}
            </select>
          </div>

          {editMode && (
            <>
              <div>
                <label className={labelCls}>Status</label>
                <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                  <option value="pendente">Pendente</option>
                  <option value="recebido">Recebido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              {status === 'recebido' && (
                <div className="grid grid-cols-2 gap-3 rounded-md border border-success/20 bg-success/[0.04] p-3">
                  <div>
                    <label className={labelCls}>Recebido em</label>
                    <input name="paid_at" type="date" defaultValue={parcela.paid_at ?? today} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Valor recebido</label>
                    <input name="paid_amount" inputMode="decimal" defaultValue={String(parcela.paid_amount ?? parcela.amount)} className={inputCls} />
                  </div>
                </div>
              )}
            </>
          )}

          {!editMode && (
            <button type="submit" disabled={pending} className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
              {pending ? 'Salvando…' : 'Adicionar parcela'}
            </button>
          )}
        </AutoSaveForm>

        {editMode && onDelete && (
          <div className="mt-auto border-t border-black/[0.06] px-5 py-4">
            {confirmDelete ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-danger">Excluir esta parcela? Não dá pra desfazer.</p>
                <div className="flex gap-2">
                  <button onClick={onDelete} disabled={pending} className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-danger/90 disabled:opacity-60">Excluir</button>
                  <button onClick={() => setConfirmDelete(false)} className="rounded-md border border-black/[0.1] px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-black/20">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="font-label text-[10px] uppercase tracking-wider text-text-muted underline decoration-dotted transition hover:text-danger">Excluir parcela</button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
