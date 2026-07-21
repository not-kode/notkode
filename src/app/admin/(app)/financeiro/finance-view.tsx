'use client';

import { useMemo, useState, useTransition } from 'react';
import { createReceivable, markReceivablePaid, unmarkReceivable } from './actions';

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

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border border-black/[0.06] bg-white p-4">
      <p className="font-label text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone ?? 'text-text-primary'}`}>{value}</p>
    </div>
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
  const [pending, start] = useTransition();

  const isLate = (r: RecView) => r.status === 'pendente' && r.due_date < todayStr;
  const monthShort = MONTHS[Number(month.slice(5)) - 1].slice(0, 3);

  const kpis = useMemo(() => {
    const mrr = engagements
      .filter((e) => e.lifecycle === 'ativo' && (e.mrr ?? 0) > 0)
      .reduce((s, e) => s + (e.mrr ?? 0), 0);
    // Mesma régua da Visão geral: "a receber" = pendente AINDA NO PRAZO; o que
    // venceu conta só no cartão Atrasado (antes a mesma parcela dobrava nos dois).
    const aReceber = receivables.filter((r) => r.status === 'pendente' && ym(r.due_date) === month && !isLate(r)).reduce((s, r) => s + r.amount, 0);
    const atrasado = receivables.filter(isLate).reduce((s, r) => s + r.amount, 0);
    const recebido = receivables.filter((r) => r.status === 'recebido' && ym(r.paid_at ?? r.due_date) === month).reduce((s, r) => s + (r.paid_amount ?? r.amount), 0);
    return { mrr, aReceber, atrasado, recebido };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagements, receivables, month, todayStr]);

  const parcelasMes = useMemo(() => receivables.filter((r) => ym(r.due_date) === month), [receivables, month]);

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
          <p className="mt-1 text-sm text-text-muted">Fluxo de caixa por mês — parcelas e recebimentos.</p>
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

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="MRR ativo" value={brl(kpis.mrr)} tone="text-primary" />
        <Kpi label={`A receber · ${monthShort}`} value={brl(kpis.aReceber)} />
        <Kpi label="Atrasado" value={brl(kpis.atrasado)} tone={kpis.atrasado > 0 ? 'text-danger' : undefined} />
        <Kpi label={`Recebido · ${monthShort}`} value={brl(kpis.recebido)} tone="text-success" />
      </div>

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
                    <tr key={r.id} className="border-b border-black/[0.04] last:border-0">
                      <td className={`whitespace-nowrap px-4 py-3 font-label text-xs ${late ? 'text-danger' : 'text-text-muted'}`}>{fmtDate(r.due_date)}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{r.org_name ?? '—'}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.description ?? r.engagement_title ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-text-primary">{brl(r.amount)}</td>
                      <td className="px-4 py-3"><StatusPill status={r.status} late={late} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {r.status === 'recebido' ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="font-label text-[10px] text-success">✓ {fmtDate(r.paid_at)}</span>
                            <button onClick={() => unmark(r.id)} disabled={pending} className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50">desfazer</button>
                          </span>
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
        <p className="mt-2 font-label text-[10px] text-text-muted/70">Só entra em “Recebido” o que você marcar aqui — nada é presumido. Os contratos ficam dentro de cada cliente.</p>
      </section>

      {newParcela && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Fechar" onClick={() => setNewParcela(false)} className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <aside className="relative flex h-full w-full max-w-[26rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <h2 className="text-lg font-semibold text-text-primary">Nova parcela</h2>
              <button onClick={() => setNewParcela(false)} className="rounded-md p-1 text-text-muted hover:bg-black/[0.04] hover:text-text-primary" aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form action={(fd) => start(async () => { await createReceivable(fd); setNewParcela(false); })} className="flex flex-col gap-3 px-5 py-4">
              <div><label className={labelCls}>Descrição</label><input name="description" className={inputCls} placeholder="Ex: Parcela 1 de 3" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Valor (R$)</label><input name="amount" inputMode="decimal" required className={inputCls} placeholder="5000" /></div>
                <div><label className={labelCls}>Vencimento</label><input name="due_date" type="date" required className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Contrato</label>
                <select name="engagement_id" className={inputCls} defaultValue="">
                  <option value="">—</option>
                  {engagements.map((e) => <option key={e.id} value={e.id}>{e.org_name ? `${e.org_name} · ` : ''}{e.title}</option>)}
                </select>
              </div>
              <button type="submit" disabled={pending} className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">{pending ? 'Adicionando…' : 'Adicionar parcela'}</button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
