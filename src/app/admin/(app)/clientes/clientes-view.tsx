'use client';

import Link from 'next/link';
import { useState, useTransition, type ReactNode } from 'react';
import { createEngagement, createReceivable, concludeEngagement, markReceivablePaid, unmarkReceivable, updateEngagementDetails, deleteEngagement } from '../financeiro/actions';
import { updateOrganization, updateEngagementContract, uploadProposal, removeProposal } from './actions';
import { DEFAULT_CLIENT_OBLIGATIONS, DEFAULT_PROVIDER_OBLIGATIONS } from '../../contrato/defaults';
import { OrgFiscalFields } from '../_shared/org-fiscal-fields';

export type ClientContact = { id: string; name: string | null; role: string | null; email: string | null; whatsapp: string | null };
export type Parcela = { id: string; description: string | null; amount: number; due_date: string; status: string; paid_amount: number | null; paid_at: string | null };
export type Contrato = {
  id: string; title: string | null; type: string; status: string; lifecycle: string;
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
  briefing: ClientBriefing | null;
  leadOrigin: LeadOrigin | null;
};
export type ClientBriefing = {
  status: string; product_name: string | null; submitted_at: string | null; url: string;
};
export type LeadOrigin = {
  service_tag: string | null; page_origin: string | null;
  estimated_min: number | null; estimated_max: number | null;
};

// Dois eixos do contrato, separados:
//   • STAGE  = etapa de entrega (a jornada do projeto)
//   • LIFE   = ciclo de vida comercial (situação do contrato)
const STAGE_STATUS = ['aguardando', 'onboarding', 'em_desenvolvimento', 'revisao', 'entregue'] as const;
const STAGE_LABELS: Record<string, string> = {
  aguardando: 'Aguardando', onboarding: 'Onboarding', em_desenvolvimento: 'Em desenvolvimento',
  revisao: 'Revisão', entregue: 'Entregue',
};
const LIFECYCLE_STATUS = ['ativo', 'pausado', 'churn', 'encerrado'] as const;
const LIFECYCLE_LABELS: Record<string, string> = {
  ativo: 'Ativo', pausado: 'Pausado', churn: 'Churn', encerrado: 'Encerrado',
};
// Cor da pílula de ciclo de vida.
const LIFE_TONE: Record<string, string> = {
  ativo: 'bg-primary/10 text-primary', pausado: 'bg-warning/10 text-warning',
  churn: 'bg-danger/10 text-danger', encerrado: 'bg-black/[0.06] text-text-secondary',
};
// Cor de fundo/borda do card por ciclo de vida.
const CARD_TONE: Record<string, string> = {
  ativo: 'border-primary/25 bg-primary/[0.04]', pausado: 'border-warning/25 bg-warning/[0.04]',
  churn: 'border-danger/20 bg-danger/[0.03]', encerrado: 'border-black/[0.07] bg-black/[0.02]',
};

// service_tag do lead → rótulo legível (mesma taxonomia do pipeline).
const SERVICE_LABELS: Record<string, string> = {
  'sistemas-ia': 'Sistema com IA', 'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação', 'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook', 'manutencao': 'Plano de Manutenção',
};

// Contrato "vivo" = ainda em jogo (ativo ou pausado). Churn/encerrado saem do grupo de ativos.
const isLive = (e: Contrato) => e.lifecycle === 'ativo' || e.lifecycle === 'pausado';

// Saúde financeira do cliente a partir das parcelas de todos os contratos.
function financeHealth(contratos: Contrato[], todayStr: string) {
  const parcelas = contratos.flatMap((c) => c.parcelas);
  const atrasadas = parcelas.filter((r) => r.status === 'pendente' && r.due_date < todayStr);
  const atrasadoTotal = atrasadas.reduce((s, r) => s + r.amount, 0);
  const proxima = parcelas
    .filter((r) => r.status === 'pendente' && r.due_date >= todayStr)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ?? null;
  return { count: atrasadas.length, atrasadoTotal, proxima };
}

// Resume a etapa do cliente na jornada, pra bater o olho na lista.
function clientStage(c: ClientView): { label: string; cls: string } {
  const live = c.contratos.find(isLive);
  if (live) {
    const cls = live.lifecycle === 'ativo' ? 'bg-primary/12 text-primary' : 'bg-warning/12 text-warning';
    return { label: STAGE_LABELS[live.status] ?? live.status, cls };
  }
  if (c.contratos.length > 0) return { label: 'Encerrado', cls: 'bg-black/[0.05] text-text-muted' };
  return { label: 'Novo', cls: 'bg-black/[0.05] text-text-muted' };
}

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

  // MRR conta só contratos ativos (pausado não fatura; churn/encerrado saíram).
  const mrrOf = (c: ClientView) => c.contratos.filter((e) => e.lifecycle === 'ativo').reduce((s, e) => s + (e.mrr ?? 0), 0);

  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-text-muted">{clients.length} cliente{clients.length === 1 ? '' : 's'} · dados cadastrais, contratos e contatos.</p>
      </header>

      {clients.length === 0 ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-text-muted">Nenhum cliente ainda. Ganhe um negócio no pipeline para criar um.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-black/[0.06] bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left font-label text-[11px] uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Contato principal</th>
                <th className="px-4 py-3 font-medium">Contratos</th>
                <th className="px-4 py-3 text-right font-medium">MRR</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const mrr = mrrOf(c);
                const ativos = c.contratos.filter(isLive).length;
                const stage = clientStage(c);
                const briefPending = c.briefing != null && c.briefing.status !== 'enviado';
                return (
                  <tr key={c.id} onClick={() => setSelectedId(c.id)} className="cursor-pointer border-b border-black/[0.04] transition-colors last:border-0 hover:bg-primary/[0.03]">
                    <td className="px-4 py-3 font-medium text-text-primary">{c.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wider ${stage.cls}`}>{stage.label}</span>
                      {briefPending && <span className="ml-1.5 font-label text-[10px] text-warning">· briefing pendente</span>}
                    </td>
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
  const changeStatus = (id: string, status: string) => {
    const fd = new FormData();
    fd.set('id', id);
    fd.set('status', status);
    start(() => updateEngagementDetails(fd));
  };
  const changeLifecycle = (id: string, lifecycle: string) => {
    const fd = new FormData();
    fd.set('id', id);
    fd.set('lifecycle', lifecycle);
    start(() => updateEngagementDetails(fd));
  };
  const remove = (id: string) => {
    const fd = new FormData();
    fd.set('id', id);
    start(() => deleteEngagement(fd));
  };

  const ativos = client.contratos.filter(isLive);
  const encerrados = client.contratos.filter((e) => !isLive(e));

  const tabs: [typeof tab, string][] = [
    ['contratos', `Contratos (${client.contratos.length})`],
    ['cadastro', 'Cadastro & contatos'],
  ];

  return (
    <Drawer title={client.name ?? 'Cliente'} eyebrow="Cliente" onClose={onClose} wide>
      {/* Resumo do projeto — os macros do cliente num relance */}
      <ProjectHeader client={client} />

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
            <OrgFiscalFields org={client} />
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
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelCls}>Tipo</label>
                  <select name="type" className={inputCls} defaultValue="recorrente"><option value="recorrente">Recorrente</option><option value="pontual">Pontual</option></select>
                </div>
                <div><label className={labelCls}>Etapa de entrega</label>
                  <select name="status" className={inputCls} defaultValue="aguardando">{STAGE_STATUS.map((v) => <option key={v} value={v}>{STAGE_LABELS[v]}</option>)}</select>
                </div>
                <div><label className={labelCls}>Ciclo de vida</label>
                  <select name="lifecycle" className={inputCls} defaultValue="ativo">{LIFECYCLE_STATUS.map((v) => <option key={v} value={v}>{LIFECYCLE_LABELS[v]}</option>)}</select>
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
            <div className="flex flex-col gap-5">
              {ativos.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.14em] text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Ativos ({ativos.length})
                  </p>
                  {ativos.map((e) => <ContractCard key={e.id} eng={e} onMarkPaid={markPaid} onUnmark={unmark} onConclude={(fd) => start(() => concludeEngagement(fd))} onSaveDetails={(fd) => start(() => updateEngagementDetails(fd))} onSaveContract={(fd) => start(() => updateEngagementContract(fd))} onAddParcela={(fd) => start(() => createReceivable(fd))} onChangeStatus={changeStatus} onChangeLifecycle={changeLifecycle} onDelete={remove} pending={pending} />)}
                </div>
              )}
              {encerrados.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted/50" /> Encerrados / inativos ({encerrados.length})
                  </p>
                  {encerrados.map((e) => <ContractCard key={e.id} eng={e} onMarkPaid={markPaid} onUnmark={unmark} onConclude={(fd) => start(() => concludeEngagement(fd))} onSaveDetails={(fd) => start(() => updateEngagementDetails(fd))} onSaveContract={(fd) => start(() => updateEngagementContract(fd))} onAddParcela={(fd) => start(() => createReceivable(fd))} onChangeStatus={changeStatus} onChangeLifecycle={changeLifecycle} onDelete={remove} pending={pending} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

function ContractCard({ eng, onMarkPaid, onUnmark, onConclude, onSaveDetails, onSaveContract, onAddParcela, onChangeStatus, onChangeLifecycle, onDelete, pending }: { eng: Contrato; onMarkPaid: (id: string, amount: number) => void; onUnmark: (id: string) => void; onConclude: (fd: FormData) => void; onSaveDetails: (fd: FormData) => void; onSaveContract: (fd: FormData) => void; onAddParcela: (fd: FormData) => void; onChangeStatus: (id: string, status: string) => void; onChangeLifecycle: (id: string, lifecycle: string) => void; onDelete: (id: string) => void; pending: boolean }) {
  const isConcluded = eng.lifecycle === 'encerrado' || eng.lifecycle === 'churn';
  const isActive = eng.lifecycle === 'ativo';
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingParcela, setAddingParcela] = useState(false);
  const [parcelasOpen, setParcelasOpen] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuItem = 'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary';
  const total = eng.parcelas.reduce((s, r) => s + r.amount, 0);
  const recebido = eng.parcelas.filter((r) => r.status === 'recebido').reduce((s, r) => s + (r.paid_amount ?? r.amount), 0);
  const valorLabel = [
    (eng.mrr ?? 0) > 0 ? `${brl(eng.mrr!)}/mês` : null,
    (eng.valor ?? 0) > 0 ? `${brl(eng.valor!)} avulso` : null,
  ].filter(Boolean).join(' · ') || '—';

  // Cor de fundo/borda e da pílula pelo ciclo de vida (ativo azul · pausado âmbar · churn vermelho · encerrado neutro).
  const cardTone = CARD_TONE[eng.lifecycle] ?? CARD_TONE.encerrado;
  const lifeTone = LIFE_TONE[eng.lifecycle] ?? LIFE_TONE.encerrado;

  return (
    <div className={`rounded-lg border p-4 transition-colors ${cardTone}`}>
      {/* Cabeçalho: título · ciclo de vida (pílula clicável) · menu de ações */}
      <div className="flex items-start justify-between gap-3">
        <p className={`min-w-0 text-[15px] font-semibold leading-tight ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>{eng.title ?? 'Contrato'}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="relative flex items-center">
            <select
              value={eng.lifecycle}
              onChange={(ev) => onChangeLifecycle(eng.id, ev.target.value)}
              disabled={pending}
              aria-label="Ciclo de vida do contrato"
              title="Situação comercial: ativo, pausado, churn ou encerrado"
              className={`cursor-pointer appearance-none rounded-full py-0.5 pl-2 pr-5 font-label text-[10px] uppercase tracking-wider outline-none transition-colors disabled:opacity-50 ${lifeTone}`}
            >
              {LIFECYCLE_STATUS.map((v) => <option key={v} value={v}>{LIFECYCLE_LABELS[v]}</option>)}
            </select>
            <span className="pointer-events-none absolute right-1.5 text-[8px] opacity-70">▼</span>
          </div>
          <div className="relative">
            <button type="button" aria-label="Ações do contrato" onClick={() => setMenuOpen((v) => !v)} className="rounded-md p-1 text-text-muted transition-colors hover:bg-black/[0.06] hover:text-text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
            </button>
            {menuOpen && (
              <>
                <button type="button" aria-hidden onClick={() => setMenuOpen(false)} className="fixed inset-0 z-10 cursor-default" />
                <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-black/[0.08] bg-white py-1 shadow-lg">
                  <button type="button" onClick={() => { setEditingDetails(true); setEditing(false); setMenuOpen(false); }} className={menuItem}>Valores &amp; vigência</button>
                  <button type="button" onClick={() => { setEditing(true); setEditingDetails(false); setMenuOpen(false); }} className={menuItem}>Escopo &amp; cláusulas</button>
                  {!isConcluded && (
                    <form action={onConclude}>
                      <input type="hidden" name="id" value={eng.id} />
                      <button type="submit" onClick={() => setMenuOpen(false)} className={menuItem}>Marcar como concluído</button>
                    </form>
                  )}
                  <div className="my-1 border-t border-black/[0.06]" />
                  <button type="button" onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-danger transition-colors hover:bg-danger/[0.06]">Excluir contrato</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Etapa de entrega — a jornada do projeto, separada da situação comercial acima */}
      <div className="mt-3 flex items-center gap-2">
        <span className={labelCls + ' mb-0 shrink-0'}>Etapa de entrega</span>
        <div className="relative flex items-center">
          <select
            value={eng.status}
            onChange={(ev) => onChangeStatus(eng.id, ev.target.value)}
            disabled={pending}
            aria-label="Etapa de entrega do contrato"
            className="cursor-pointer appearance-none rounded-md border border-black/[0.1] bg-white py-1 pl-2.5 pr-6 text-xs text-text-primary outline-none transition-colors focus:border-primary/50 disabled:opacity-50"
          >
            {STAGE_STATUS.map((v) => <option key={v} value={v}>{STAGE_LABELS[v]}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 text-[8px] opacity-70">▼</span>
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/[0.05] px-3 py-2">
          <span className="text-xs text-danger">Excluir este contrato e suas parcelas? Não dá pra desfazer.</span>
          <span className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => { onDelete(eng.id); setConfirmDelete(false); }} disabled={pending} className="rounded-md bg-danger px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-white transition hover:bg-danger/90 disabled:opacity-50">Excluir</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="font-label text-[10px] text-text-muted hover:text-text-secondary">cancelar</button>
          </span>
        </div>
      )}

      {/* Meta em grid com rótulos, respirando */}
      <dl className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <dt className={labelCls}>Tipo</dt>
          <dd className="text-[13px] text-text-primary">{eng.type === 'recorrente' ? 'Recorrente' : 'Pontual'}</dd>
        </div>
        <div>
          <dt className={labelCls}>Vigência</dt>
          <dd className="text-[13px] text-text-primary">{fmtDate(eng.start_date)} <span className="text-text-muted/50">→</span> {fmtDate(eng.end_date)}</dd>
        </div>
        <div>
          <dt className={labelCls}>Valor</dt>
          <dd className="text-[13px] text-text-primary">{valorLabel}</dd>
        </div>
      </dl>

      {/* Ação principal */}
      <div className="mt-3 border-t border-black/[0.06] pt-3">
        <a href={`/admin/contrato/${eng.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90">Gerar contrato ↗</a>
      </div>

      {editingDetails && (
        <form action={(fd) => { onSaveDetails(fd); setEditingDetails(false); }} className="mt-3 flex flex-col gap-3 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-3">
          <input type="hidden" name="id" value={eng.id} />
          <Field label="Título" name="title" defaultValue={eng.title} placeholder="Ex: Sistema de gestão" />
          <div><label className={labelCls}>Tipo</label>
            <select name="type" className={inputCls} defaultValue={eng.type}><option value="recorrente">Recorrente</option><option value="pontual">Pontual</option></select>
          </div>
          <p className="-mt-1 font-label text-[10px] text-text-muted">Etapa de entrega e ciclo de vida se editam direto no card, acima.</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Mensal / MRR (R$)</label><input name="mrr" inputMode="decimal" defaultValue={eng.mrr != null ? String(eng.mrr) : ''} className={inputCls} placeholder="2500" /></div>
            <div><label className={labelCls}>Valor avulso (R$)</label><input name="valor" inputMode="decimal" defaultValue={eng.valor != null ? String(eng.valor) : ''} className={inputCls} placeholder="650" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Início</label><input name="start_date" type="date" defaultValue={eng.start_date ?? ''} className={inputCls} /></div>
            <div><label className={labelCls}>Fim</label><input name="end_date" type="date" defaultValue={eng.end_date ?? ''} className={inputCls} /></div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">Salvar alterações</button>
            <button type="button" onClick={() => setEditingDetails(false)} className="font-label text-[11px] text-text-muted hover:text-text-secondary">cancelar</button>
          </div>
        </form>
      )}

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
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60">Salvar</button>
            <button type="button" onClick={() => setEditing(false)} className="font-label text-[11px] text-text-muted hover:text-text-secondary">cancelar</button>
          </div>
        </form>
      )}

      {/* Proposta anexa */}
      <div className="mt-3 border-t border-black/[0.06] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">Proposta anexa</p>
          {eng.proposal_path ? (
            <div className="flex flex-wrap items-center gap-2">
              <a href={`/admin/proposta/${eng.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-black/[0.04] px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-text-secondary transition hover:text-primary">📎 Ver proposta</a>
              {eng.proposal_name && <span className="max-w-[9rem] truncate font-label text-[10px] text-text-muted">{eng.proposal_name}</span>}
              <form action={removeProposal}>
                <input type="hidden" name="id" value={eng.id} />
                <button type="submit" className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger">remover</button>
              </form>
            </div>
          ) : (
            <button type="button" onClick={() => setAttaching((v) => !v)} className="font-label text-[10px] font-medium text-primary hover:underline">{attaching ? 'cancelar' : '+ anexar'}</button>
          )}
        </div>
        {!eng.proposal_path && attaching && (
          <form action={uploadProposal} className="mt-2 flex items-center gap-2">
            <input type="hidden" name="id" value={eng.id} />
            <input type="file" name="file" accept=".pdf,.html,.htm,application/pdf,text/html" required className="min-w-0 flex-1 text-[10px] file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-[10px] file:font-medium file:text-primary" />
            <button type="submit" className="shrink-0 rounded-md border border-black/[0.1] px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-text-secondary transition hover:border-primary/40 hover:text-primary">enviar</button>
          </form>
        )}
      </div>

      <div className="mt-3 border-t border-black/[0.06] pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setParcelasOpen((v) => !v)} className="flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-text-muted transition-colors hover:text-text-secondary">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${parcelasOpen ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6" /></svg>
            Parcelas ({eng.parcelas.length})
            {eng.parcelas.length > 0 && <span className="font-normal normal-case tracking-normal text-text-muted/80">· {brl(recebido)} / {brl(total)}</span>}
          </button>
          {parcelasOpen && (
            <button onClick={() => setAddingParcela((v) => !v)} className="font-label text-[10px] font-medium text-primary hover:underline">{addingParcela ? 'cancelar' : '+ parcela'}</button>
          )}
        </div>

        {parcelasOpen && (
        <div className="mt-2">
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
        )}
      </div>
    </div>
  );
}

function Drawer({ title, eyebrow, onClose, children, wide }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <aside className={`relative flex h-full w-full flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl ${wide ? 'max-w-[44rem]' : 'max-w-[28rem]'}`}>
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

// Cabeçalho de projeto: reúne os macros do cliente que antes ficavam espalhados
// (etapa, prazo, valor, saúde financeira, contato, origem do lead e briefing).
function ProjectHeader({ client }: { client: ClientView }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const live = client.contratos.find(isLive) ?? null;
  const fin = financeHealth(client.contratos, todayStr);
  const contact = client.contacts[0] ?? null;
  const lo = client.leadOrigin;

  const mrr = client.contratos.filter((e) => e.lifecycle === 'ativo').reduce((s, e) => s + (e.mrr ?? 0), 0);
  const valorAvulso = client.contratos.filter(isLive).reduce((s, e) => s + (e.valor ?? 0), 0);
  const valorLabel = mrr > 0 ? `${brl(mrr)}/mês` : valorAvulso > 0 ? brl(valorAvulso) : '—';

  const stageLabel = live ? (STAGE_LABELS[live.status] ?? live.status) : client.contratos.length ? 'Encerrado' : 'Sem contrato';
  const lifeTone = live ? (LIFE_TONE[live.lifecycle] ?? LIFE_TONE.encerrado) : 'bg-black/[0.06] text-text-secondary';

  const estMin = lo?.estimated_min, estMax = lo?.estimated_max;
  const estimativa = lo && (estMin || estMax) ? `est. ${estMin ? brl(estMin) : '—'}–${estMax ? brl(estMax) : '—'}` : null;
  const origem = lo
    ? [SERVICE_LABELS[lo.service_tag ?? ''] ?? lo.service_tag, lo.page_origin, estimativa].filter(Boolean).join(' · ')
    : null;

  const cellLabel = 'font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

  return (
    <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-4">
      <p className="mb-3 font-label text-[10px] uppercase tracking-[0.14em] text-primary/80">Resumo do projeto</p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div>
          <p className={cellLabel}>Etapa</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wider ${lifeTone}`}>{stageLabel}</span>
        </div>
        <div>
          <p className={cellLabel}>Prazo</p>
          <p className="mt-1 text-[13px] text-text-primary">{fmtDate(live?.start_date ?? null)} <span className="text-text-muted/50">→</span> {fmtDate(live?.end_date ?? null)}</p>
        </div>
        <div>
          <p className={cellLabel}>Valor</p>
          <p className="mt-1 text-[13px] font-medium text-text-primary">{valorLabel}</p>
        </div>
        <div>
          <p className={cellLabel}>Financeiro</p>
          <p className="mt-1 text-[13px]">
            {fin.count > 0
              ? <span className="font-medium text-danger">{fin.count} atrasada{fin.count === 1 ? '' : 's'} · {brl(fin.atrasadoTotal)}</span>
              : fin.proxima
                ? <span className="text-text-primary">Em dia <span className="text-text-muted">· próx. {fmtDate(fin.proxima.due_date)}</span></span>
                : <span className="text-text-muted">Em dia</span>}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-primary/10 pt-3 text-xs">
        <div className="flex gap-2">
          <span className={cellLabel + ' shrink-0 pt-0.5'}>Contato</span>
          <span className="text-text-secondary">{contact ? [contact.name ?? '—', contact.whatsapp, contact.email].filter(Boolean).join(' · ') : '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className={cellLabel + ' shrink-0 pt-0.5'}>Origem</span>
          <span className="text-text-secondary">{origem || '—'}</span>
        </div>
      </div>

      {client.briefing && <div className="mt-3"><BriefingCard briefing={client.briefing} /></div>}
    </div>
  );
}

function BriefingCard({ briefing }: { briefing: ClientBriefing }) {
  const [copied, setCopied] = useState(false);
  const enviado = briefing.status === 'enviado';
  const quando = briefing.submitted_at
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(briefing.submitted_at))
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-black/[0.06] bg-white px-3 py-2.5">
      <div>
        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          Briefing de onboarding{briefing.product_name ? ` · ${briefing.product_name}` : ''}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <span className={`rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wider ${enviado ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
            {enviado ? 'respondido' : 'aguardando'}
          </span>
          {enviado && quando && <span className="font-label text-[10px] text-text-muted">em {quando}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={async () => {
            try { await navigator.clipboard.writeText(briefing.url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
          }}
          className="rounded-md border border-black/[0.08] px-2.5 py-1.5 font-label text-[11px] text-text-secondary transition-colors hover:border-primary hover:text-primary"
          title={briefing.url}
        >
          {copied ? '✓ copiado' : '⧉ copiar link'}
        </button>
        {enviado && (
          <Link
            href="/admin/onboarding"
            className="rounded-md bg-primary px-2.5 py-1.5 font-label text-[11px] font-semibold text-white transition hover:bg-primary/90"
          >
            ver respostas ↗
          </Link>
        )}
      </div>
    </div>
  );
}
