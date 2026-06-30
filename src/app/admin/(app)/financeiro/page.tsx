import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createEngagement, createReceivable, markReceivablePaid } from './actions';

export const dynamic = 'force-dynamic';

const ENG_STATUS: Record<string, string> = {
  aguardando: 'Aguardando', onboarding: 'Onboarding', em_desenvolvimento: 'Em desenvolvimento',
  revisao: 'Revisão', entregue: 'Entregue', encerrado: 'Encerrado',
  ativo: 'Ativo', pausado: 'Pausado', churn: 'Churn',
};
const REC_STATUS: Record<string, string> = {
  pendente: 'Pendente', recebido: 'Recebido', atrasado: 'Atrasado', cancelado: 'Cancelado',
};

type Eng = {
  id: string; title: string | null; type: string; status: string;
  valor: number | null; mrr: number | null; billing_cycle: string | null;
  organizations: { name: string | null } | null;
};
type Rec = {
  id: string; description: string | null; amount: number; due_date: string;
  status: string; paid_amount: number | null;
  engagements: { title: string | null } | null;
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
const fmtDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};
const today = () => new Date().toISOString().slice(0, 10);

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-border-subtle/15 bg-white p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone ?? 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

export default async function FinanceiroPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: engData }, { data: recData }, { data: orgData }] = await Promise.all([
    supabase
      .from('engagements')
      .select('id, title, type, status, valor, mrr, billing_cycle, organization_id, organizations(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('receivables')
      .select('id, description, amount, due_date, status, paid_amount, engagement_id, engagements(title)')
      .order('due_date', { ascending: true }),
    supabase.from('organizations').select('id, name').order('name'),
  ]);

  const engagements = (engData ?? []) as unknown as Eng[];
  const receivables = (recData ?? []) as unknown as Rec[];
  const orgs = (orgData ?? []) as { id: string; name: string | null }[];
  const engsForSelect = engagements.map((e) => ({ id: e.id, title: e.title }));
  const t = today();

  const isLate = (r: Rec) => r.status === 'atrasado' || (r.status === 'pendente' && r.due_date < t);

  const mrrAtivo = engagements
    .filter((e) => e.status !== 'encerrado' && e.status !== 'churn')
    .reduce((s, e) => s + (e.mrr ?? 0), 0);
  const aReceber = receivables.filter((r) => r.status === 'pendente').reduce((s, r) => s + r.amount, 0);
  const atrasado = receivables.filter(isLate).reduce((s, r) => s + r.amount, 0);
  const recebido = receivables
    .filter((r) => r.status === 'recebido')
    .reduce((s, r) => s + (r.paid_amount ?? r.amount), 0);

  const inputCls =
    'rounded-md border border-border-subtle/20 bg-surface-base px-3 py-2 text-sm outline-none focus:border-primary';
  const labelCls = 'font-mono text-[11px] uppercase tracking-wider text-text-muted';

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="mt-1 text-sm text-text-muted">Contratos, parcelas e recorrência.</p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="MRR ativo" value={brl(mrrAtivo)} tone="text-primary" />
        <Kpi label="A receber" value={brl(aReceber)} />
        <Kpi label="Atrasado" value={brl(atrasado)} tone={atrasado > 0 ? 'text-danger' : undefined} />
        <Kpi label="Recebido" value={brl(recebido)} tone="text-success" />
      </div>

      {/* ── Contratos ─────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contratos</h2>
        </div>

        <details className="mb-4 rounded-lg border border-border-subtle/15 bg-neutral-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-primary">+ Novo contrato</summary>
          <form action={createEngagement} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            <label className="col-span-2 flex flex-col gap-1 md:col-span-1">
              <span className={labelCls}>Título</span>
              <input name="title" required className={inputCls} placeholder="Ex: Sistema de gestão" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Cliente</span>
              <select name="organization_id" className={inputCls} defaultValue="">
                <option value="">—</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Tipo</span>
              <select name="type" className={inputCls} defaultValue="pontual">
                <option value="pontual">Pontual</option>
                <option value="recorrente">Recorrente</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Status</span>
              <select name="status" className={inputCls} defaultValue="ativo">
                {Object.entries(ENG_STATUS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Valor (R$)</span>
              <input name="valor" inputMode="decimal" className={inputCls} placeholder="15000" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>MRR (R$)</span>
              <input name="mrr" inputMode="decimal" className={inputCls} placeholder="990" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Início</span>
              <input name="start_date" type="date" className={inputCls} />
            </label>
            <div className="col-span-2 md:col-span-3">
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">
                Criar contrato
              </button>
            </div>
          </form>
        </details>

        {engagements.length === 0 ? (
          <p className="rounded-md border border-border-subtle/20 bg-white px-4 py-8 text-center text-sm text-text-muted">
            Nenhum contrato ainda.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-subtle/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle/15 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Contrato</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">MRR</th>
                </tr>
              </thead>
              <tbody>
                {engagements.map((e) => (
                  <tr key={e.id} className="border-b border-border-subtle/10 last:border-0">
                    <td className="px-4 py-3 font-medium text-text-primary">{e.title ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{e.organizations?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{e.type === 'recorrente' ? 'Recorrente' : 'Pontual'}</td>
                    <td className="px-4 py-3 text-text-secondary">{ENG_STATUS[e.status] ?? e.status}</td>
                    <td className="px-4 py-3 text-text-secondary">{e.valor != null ? brl(e.valor) : '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{e.mrr ? brl(e.mrr) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Parcelas ──────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Parcelas a receber</h2>
        </div>

        <details className="mb-4 rounded-lg border border-border-subtle/15 bg-neutral-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-primary">+ Nova parcela</summary>
          <form action={createReceivable} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="col-span-2 flex flex-col gap-1">
              <span className={labelCls}>Descrição</span>
              <input name="description" className={inputCls} placeholder="Ex: Entrada / Parcela 1 de 3" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Valor (R$)</span>
              <input name="amount" inputMode="decimal" required className={inputCls} placeholder="5000" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Vencimento</span>
              <input name="due_date" type="date" required className={inputCls} />
            </label>
            <label className="col-span-2 flex flex-col gap-1 md:col-span-3">
              <span className={labelCls}>Contrato (opcional)</span>
              <select name="engagement_id" className={inputCls} defaultValue="">
                <option value="">—</option>
                {engsForSelect.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </label>
            <div className="col-span-2 md:col-span-1 md:self-end">
              <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">
                Adicionar
              </button>
            </div>
          </form>
        </details>

        {receivables.length === 0 ? (
          <p className="rounded-md border border-border-subtle/20 bg-white px-4 py-8 text-center text-sm text-text-muted">
            Nenhuma parcela ainda.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-subtle/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle/15 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Contrato</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {receivables.map((r) => {
                  const late = isLate(r);
                  return (
                    <tr key={r.id} className="border-b border-border-subtle/10 last:border-0">
                      <td className={`whitespace-nowrap px-4 py-3 ${late ? 'text-danger' : 'text-text-muted'}`}>
                        {fmtDate(r.due_date)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{r.description ?? '—'}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.engagements?.title ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">{brl(r.amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            r.status === 'recebido'
                              ? 'text-success'
                              : late
                                ? 'text-danger'
                                : 'text-text-secondary'
                          }
                        >
                          {late && r.status === 'pendente' ? 'Atrasado' : REC_STATUS[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {r.status === 'recebido' ? (
                          <span className="text-xs text-text-muted">✓ baixada</span>
                        ) : (
                          <form action={markReceivablePaid}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="amount" value={r.amount} />
                            <button
                              type="submit"
                              className="rounded-md border border-success/40 px-3 py-1.5 text-xs font-medium text-success transition hover:bg-success/10"
                            >
                              Marcar recebida
                            </button>
                          </form>
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
    </div>
  );
}
