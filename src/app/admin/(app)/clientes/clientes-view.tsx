'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { createEngagement, createReceivable, concludeEngagement, markReceivablePaid, unmarkReceivable } from '../financeiro/actions';
import { updateOrganization, updateEngagementContract, uploadProposal, removeProposal } from './actions';
import { DEFAULT_CLIENT_OBLIGATIONS, DEFAULT_PROVIDER_OBLIGATIONS } from '../../contrato/defaults';

export type ClientContact = { id: string; name: string | null; role: string | null; email: string | null; whatsapp: string | null };
export type Parcela = { id: string; description: string | null; amount: number; due_date: string; status: string; paid_amount: number | null; paid_at: string | null };
export type Contrato = {
  id: string; title: string | null; type: string; status: string;
  valor: number | null; mrr: number | null; start_date: string | null; end_date: string | null; notes: string | null;
  scope: string | null; renewal_note: string | null; client_obligations: string | null; provider_obligations: string | null;
  proposal_path: string | null; proposal_name: string | null;
  parcelas: Parcela[];
};
export type ClientView = {
  id: string; name: string | null; market: string | null;
  legal_name: string | null; tax_id: string | null; state_registration: string | null;
  address_street: string | null; address_number: string | null; address_district: string | null;
  address_city: string | null; address_state: string | null; address_zip: string | null;
  legal_rep: string | null; legal_rep_cpf: string | null;
  contacts: ClientContact[]; contratos: Contrato[];
};

const ENG_STATUS: Record<string, string> = {
  aguardando: 'Aguardando', onboarding: 'Onboarding', em_desenvolvimento: 'Em desenvolvimento',
  revisao: 'Revisão', entregue: 'Entregue', encerrado: 'Encerrado',
  ativo: 'Ativo', pausado: 'Pausado', churn: 'Churn',
};
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
const fmtDate = (d: string | null) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

function Field({ label, name, defaultValue, placeholder, className = '' }: { label: string; name: string; defaultValue?: string | null; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      <input name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

export function ClientesView({ clients }: { clients: ClientView[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = clients.find((c) => c.id === selectedId) ?? null;

  const mrrOf = (c: ClientView) => c.contratos.filter((e) => e.status !== 'encerrado' && e.status !== 'churn' && e.status !== 'entregue').reduce((s, e) => s + (e.mrr ?? 0), 0);

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-text-muted">{clients.length} cliente{clients.length === 1 ? '' : 's'} · dados cadastrais, contratos e contatos.</p>
      </header>

      {clients.length === 0 ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-text-muted">Nenhum cliente ainda. Ganhe um negócio no pipeline para criar um.</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-black/[0.06] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left font-label text-[11px] uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Contato principal</th>
                <th className="px-4 py-3 font-medium">Contratos</th>
                <th className="px-4 py-3 text-right font-medium">MRR</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const mrr = mrrOf(c);
                const ativos = c.contratos.filter((e) => e.status !== 'entregue' && e.status !== 'encerrado' && e.status !== 'churn').length;
                return (
                  <tr key={c.id} onClick={() => setSelectedId(c.id)} className="cursor-pointer border-b border-black/[0.04] transition-colors last:border-0 hover:bg-primary/[0.03]">
                    <td className="px-4 py-3 font-medium text-text-primary">{c.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.contacts[0]?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.contratos.length}{ativos > 0 ? ` · ${ativos} ativo${ativos === 1 ? '' : 's'}` : ''}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">{mrr > 0 ? <span className="font-medium text-primary">{brl(mrr)}<span className="text-text-muted">/mês</span></span> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 font-label text-[10px] text-text-muted/70">Clique num cliente para ver dados cadastrais, contratos e parcelas.</p>

      {selected && <ClientDrawer client={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function ClientDrawer({ client, onClose }: { client: ClientView; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [newContract, setNewContract] = useState(false);
  const [tab, setTab] = useState<'contratos' | 'cadastro'>(client.contratos.length > 0 ? 'contratos' : 'cadastro');

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

  const tabs: [typeof tab, string][] = [
    ['contratos', `Contratos (${client.contratos.length})`],
    ['cadastro', 'Cadastro & contatos'],
  ];

  return (
    <Drawer title={client.name ?? 'Cliente'} eyebrow="Cliente" onClose={onClose} wide>
      {/* Abas */}
      <div className="flex gap-1 border-b border-black/[0.06] pb-3">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === k ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-black/[0.03] hover:text-text-secondary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'cadastro' && (
        <>
          {/* Dados cadastrais */}
          <form action={(fd) => start(() => updateOrganization(fd))} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={client.id} />
            <Field label="Nome (como aparece no sistema)" name="name" defaultValue={client.name} placeholder="Nome do cliente" />
            <p className="mt-1 font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Dados para o contrato</p>
            <Field label="Razão social" name="legal_name" defaultValue={client.legal_name} placeholder="Empresa LTDA" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="CNPJ / CPF" name="tax_id" defaultValue={client.tax_id} placeholder="00.000.000/0001-00" />
              <Field label="Inscr. estadual" name="state_registration" defaultValue={client.state_registration} placeholder="Isento" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Representante legal" name="legal_rep" defaultValue={client.legal_rep} placeholder="Quem assina" />
              <Field label="CPF do signatário" name="legal_rep_cpf" defaultValue={client.legal_rep_cpf} placeholder="000.000.000-00" />
            </div>
            <div className="grid grid-cols-[1fr_5rem] gap-3">
              <Field label="Logradouro" name="address_street" defaultValue={client.address_street} placeholder="Rua / Av." />
              <Field label="Número" name="address_number" defaultValue={client.address_number} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bairro" name="address_district" defaultValue={client.address_district} />
              <Field label="CEP" name="address_zip" defaultValue={client.address_zip} />
            </div>
            <div className="grid grid-cols-[1fr_4rem] gap-3">
              <Field label="Cidade" name="address_city" defaultValue={client.address_city} />
              <Field label="UF" name="address_state" defaultValue={client.address_state} />
            </div>
            <button type="submit" disabled={pending} className="self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">{pending ? 'Salvando…' : 'Salvar cadastro'}</button>
          </form>

          {/* Contatos */}
          {client.contacts.length > 0 && (
            <div className="border-t border-black/[0.06] pt-4">
              <p className="mb-2 font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Contatos</p>
              <ul className="flex flex-col gap-1.5">
                {client.contacts.map((ct) => (
                  <li key={ct.id} className="rounded-md border border-black/[0.06] bg-white px-3 py-2">
                    <p className="text-sm font-medium text-text-primary">{ct.name ?? '—'} {ct.role && <span className="font-label text-[10px] font-normal text-text-muted">· {ct.role}</span>}</p>
                    {(ct.email || ct.whatsapp) && <p className="font-label text-[10px] text-text-muted">{[ct.whatsapp, ct.email].filter(Boolean).join(' · ')}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {tab === 'contratos' && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">{client.contratos.length} contrato{client.contratos.length === 1 ? '' : 's'}</p>
            <button onClick={() => setNewContract((v) => !v)} className="rounded-md border border-primary/30 px-2.5 py-1 font-label text-[11px] font-medium text-primary transition-colors hover:bg-primary/10">{newContract ? 'cancelar' : '+ novo contrato'}</button>
          </div>

          {newContract && (
            <form action={(fd) => start(async () => { await createEngagement(fd); setNewContract(false); })} className="mb-4 flex flex-col gap-3 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-4">
              <input type="hidden" name="organization_id" value={client.id} />
              <Field label="Título" name="title" placeholder="Ex: Sistema de gestão" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Tipo</label>
                  <select name="type" className={inputCls} defaultValue="recorrente"><option value="recorrente">Recorrente</option><option value="pontual">Pontual</option></select>
                </div>
                <div><label className={labelCls}>Status</label>
                  <select name="status" className={inputCls} defaultValue="ativo">{Object.entries(ENG_STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Mensal / MRR (R$)</label><input name="mrr" inputMode="decimal" className={inputCls} placeholder="2500" /></div>
                <div><label className={labelCls}>Valor avulso (R$)</label><input name="valor" inputMode="decimal" className={inputCls} placeholder="650" /></div>
              </div>
              <p className="-mt-1 font-label text-[10px] text-text-muted">MRR = mensalidade recorrente · Valor avulso = cobrança pontual única (não entra no MRR)</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Início</label><input name="start_date" type="date" className={inputCls} /></div>
                <div><label className={labelCls}>Fim</label><input name="end_date" type="date" className={inputCls} /></div>
              </div>
              <button type="submit" disabled={pending} className="self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">Criar contrato</button>
            </form>
          )}

          {client.contratos.length === 0 ? (
            <p className="rounded-md border border-black/[0.06] bg-white px-3 py-8 text-center text-xs text-text-muted">Nenhum contrato ainda. Use <strong className="font-medium text-text-secondary">+ novo contrato</strong> para criar o primeiro.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {client.contratos.map((e) => <ContractCard key={e.id} eng={e} onMarkPaid={markPaid} onUnmark={unmark} onConclude={(fd) => start(() => concludeEngagement(fd))} onSaveContract={(fd) => start(() => updateEngagementContract(fd))} onAddParcela={(fd) => start(() => createReceivable(fd))} pending={pending} />)}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

function ContractCard({ eng, onMarkPaid, onUnmark, onConclude, onSaveContract, onAddParcela, pending }: { eng: Contrato; onMarkPaid: (id: string, amount: number) => void; onUnmark: (id: string) => void; onConclude: (fd: FormData) => void; onSaveContract: (fd: FormData) => void; onAddParcela: (fd: FormData) => void; pending: boolean }) {
  const isConcluded = eng.status === 'entregue' || eng.status === 'encerrado';
  const [editing, setEditing] = useState(false);
  const [addingParcela, setAddingParcela] = useState(false);
  const total = eng.parcelas.reduce((s, r) => s + r.amount, 0);
  const recebido = eng.parcelas.filter((r) => r.status === 'recebido').reduce((s, r) => s + (r.paid_amount ?? r.amount), 0);
  return (
    <div className="rounded-md border border-black/[0.08] bg-white p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-tight text-text-primary">{eng.title ?? 'Contrato'}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wider ${isConcluded ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>{ENG_STATUS[eng.status] ?? eng.status}</span>
      </div>
      <p className="mt-1 font-label text-[11px] text-text-muted">
        {eng.type === 'recorrente' ? 'Recorrente' : 'Pontual'} · {fmtDate(eng.start_date)} <span className="text-text-muted/50">→</span> {fmtDate(eng.end_date)}
        {(eng.mrr ?? 0) > 0 && <> · <span className="text-text-secondary">{brl(eng.mrr!)}/mês</span></>}
        {(eng.valor ?? 0) > 0 && <> · <span className="text-text-secondary">{brl(eng.valor!)} avulso</span></>}
        {(eng.mrr ?? 0) === 0 && (eng.valor ?? 0) === 0 && ' · —'}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <a href={`/admin/contrato/${eng.id}`} target="_blank" rel="noopener noreferrer" className="rounded-md bg-primary/10 px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-primary transition hover:bg-primary/20">Gerar contrato ↗</a>
        <button type="button" onClick={() => setEditing((v) => !v)} className="rounded-md border border-black/[0.1] px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-text-secondary transition hover:border-primary/40 hover:text-primary">{editing ? 'fechar' : 'objeto/cláusulas'}</button>
        {!isConcluded && (
          <form action={onConclude}>
            <input type="hidden" name="id" value={eng.id} />
            <button type="submit" disabled={pending} className="rounded-md border border-black/[0.12] px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-text-secondary transition hover:border-text-primary/40 hover:text-text-primary disabled:opacity-50">Concluir</button>
          </form>
        )}
      </div>

      {editing && (
        <form action={(fd) => { onSaveContract(fd); setEditing(false); }} className="mt-3 flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-3">
          <input type="hidden" name="id" value={eng.id} />
          <div>
            <label className={labelCls}>Objeto / escopo (Cláusula 1)</label>
            <textarea name="scope" defaultValue={eng.scope ?? ''} rows={4} className={inputCls + ' resize-y'} placeholder="Descreva o que será entregue neste contrato…" />
          </div>
          <div>
            <label className={labelCls}>Renovação (Cláusula 5)</label>
            <textarea name="renewal_note" defaultValue={eng.renewal_note ?? ''} rows={2} className={inputCls + ' resize-y'} placeholder="Ex: renovação por R$ X/mês após o período…" />
          </div>
          <div>
            <label className={labelCls}>Obrigações da CONTRATANTE (Cláusula 2)</label>
            <textarea name="client_obligations" defaultValue={eng.client_obligations ?? DEFAULT_CLIENT_OBLIGATIONS} rows={5} className={inputCls + ' resize-y'} />
            <p className="mt-1 font-label text-[10px] text-text-muted">Uma obrigação por linha — o contrato numera automático (2.1, 2.2…). Texto padrão genérico; ajuste conforme o caso.</p>
          </div>
          <div>
            <label className={labelCls}>Obrigações da CONTRATADA (Cláusula 3)</label>
            <textarea name="provider_obligations" defaultValue={eng.provider_obligations ?? DEFAULT_PROVIDER_OBLIGATIONS} rows={5} className={inputCls + ' resize-y'} />
            <p className="mt-1 font-label text-[10px] text-text-muted">Uma por linha (3.1, 3.2…). O escopo detalhado vem da proposta anexa.</p>
          </div>
          <button type="submit" disabled={pending} className="self-start rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60">Salvar</button>
        </form>
      )}

      {/* Proposta anexa */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-black/[0.06] pt-2.5">
        {eng.proposal_path ? (
          <>
            <a href={`/admin/proposta/${eng.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-black/[0.04] px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-text-secondary transition hover:text-primary">📎 Ver proposta</a>
            {eng.proposal_name && <span className="max-w-[9rem] truncate font-label text-[10px] text-text-muted">{eng.proposal_name}</span>}
            <form action={removeProposal}>
              <input type="hidden" name="id" value={eng.id} />
              <button type="submit" className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger">remover</button>
            </form>
          </>
        ) : (
          <form action={uploadProposal} className="flex items-center gap-2">
            <input type="hidden" name="id" value={eng.id} />
            <input type="file" name="file" accept=".pdf,.html,.htm,application/pdf,text/html" required className="max-w-[12rem] text-[10px] file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-[10px] file:font-medium file:text-primary" />
            <button type="submit" className="rounded-md border border-black/[0.1] px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-text-secondary transition hover:border-primary/40 hover:text-primary">anexar</button>
          </form>
        )}
      </div>

      <div className="mt-3 border-t border-black/[0.06] pt-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">Parcelas ({eng.parcelas.length})</p>
          <div className="flex items-center gap-2">
            {eng.parcelas.length > 0 && <p className="font-label text-[10px] text-text-muted">{brl(recebido)} / {brl(total)}</p>}
            <button onClick={() => setAddingParcela((v) => !v)} className="font-label text-[10px] font-medium text-primary hover:underline">{addingParcela ? 'cancelar' : '+ parcela'}</button>
          </div>
        </div>

        {addingParcela && (
          <form action={(fd) => { onAddParcela(fd); setAddingParcela(false); }} className="mb-2 flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-2.5">
            <input type="hidden" name="engagement_id" value={eng.id} />
            <input name="description" className={inputCls} placeholder="Descrição — ex: Mensalidade 07/2026" />
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input name="amount" inputMode="decimal" required className={inputCls} placeholder="Valor (R$)" />
              <input name="due_date" type="date" required className={inputCls} />
              <button type="submit" disabled={pending} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60">Add</button>
            </div>
          </form>
        )}

        {eng.parcelas.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {eng.parcelas.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-text-secondary">{r.description ?? '—'} <span className="text-text-muted">· {fmtDate(r.due_date)} · {brl(r.amount)}</span></span>
                {r.status === 'recebido' ? (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="font-label text-[10px] text-success">✓ pago</span>
                    <button onClick={() => onUnmark(r.id)} disabled={pending} className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50">desfazer</button>
                  </span>
                ) : (
                  <button onClick={() => onMarkPaid(r.id, r.amount)} disabled={pending} className="shrink-0 rounded border border-success/40 px-2 py-0.5 text-[10px] font-medium text-success transition hover:bg-success/10 disabled:opacity-50">Marcar</button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          !addingParcela && <p className="text-xs text-text-muted">Sem parcelas ainda.</p>
        )}
      </div>
    </div>
  );
}

function Drawer({ title, eyebrow, onClose, children }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <aside className="relative flex h-full w-full max-w-[28rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-white px-5 py-4">
          <div>
            {eyebrow && <p className="eyebrow mb-1"><span className="status-dot" />{eyebrow}</p>}
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-text-primary">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-col gap-4 px-5 py-4">{children}</div>
      </aside>
    </div>
  );
}
