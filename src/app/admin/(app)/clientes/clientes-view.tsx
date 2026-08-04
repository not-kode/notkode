'use client';

import { useRef, useState, useTransition, type ReactNode } from 'react';
import { createEngagement, createReceivable, concludeEngagement, markReceivablePaid, unmarkReceivable, updateEngagementDetails, deleteEngagement, updateReceivable, deleteReceivable, backfillMonthlyReceivables } from '../financeiro/actions';
import { updateOrganization, updateEngagementContract, uploadProposal, removeProposal, createClient, deleteOrganization } from './actions';
import { DEFAULT_CLIENT_OBLIGATIONS, DEFAULT_PROVIDER_OBLIGATIONS } from '../../contrato/defaults';
import { OrgFiscalFields } from '../_shared/org-fiscal-fields';
import { siteHref, instagramHandle, instagramHref } from '../_shared/org-links';
import { AutoSaveForm } from '../_shared/auto-save-form';
import { AssinaturaBloco, type AssinaturaResumo } from './assinatura-bloco';
import { ModelosView, type ModeloRow } from './modelos-view';
import { definirModeloDoContrato } from './modelos-actions';
import { NewBriefing } from '../onboarding/new-briefing';
import { CopyLink } from '../onboarding/copy-link';
import {
  BriefingConteudo, CopyButton, StatusBadge, buildCopyBlock, fmtDateShort as fmtBriefingDate,
  type BriefingRow,
} from '../onboarding/onboarding-view';

export type ClientContact = { id: string; name: string | null; role: string | null; email: string | null; whatsapp: string | null };
export type Parcela = { id: string; description: string | null; amount: number; due_date: string; status: string; paid_amount: number | null; paid_at: string | null };
export type Contrato = {
  id: string; title: string | null; type: string; status: string; lifecycle: string;
  valor: number | null; mrr: number | null; start_date: string | null; end_date: string | null; notes: string | null;
  scope: string | null; renewal_note: string | null; client_obligations: string | null; provider_obligations: string | null;
  proposal_path: string | null; proposal_name: string | null;
  contract_template_id: string | null;
  assinatura: AssinaturaResumo | null;
  parcelas: Parcela[];
};
export type ModeloDisponivel = { id: string; nome: string };
export type ClientView = {
  id: string; name: string | null; market: string | null;
  site: string | null; instagram: string | null;
  legal_name: string | null; tax_id: string | null; state_registration: string | null;
  address_street: string | null; address_number: string | null; address_district: string | null;
  address_city: string | null; address_state: string | null; address_zip: string | null;
  legal_rep: string | null; legal_rep_cpf: string | null;
  contacts: ClientContact[]; contratos: Contrato[];
  briefing: ClientBriefing | null;
  briefings: BriefingRow[];
  leadOrigin: LeadOrigin | null;
};
/** O link do briefing é público e a URL do site é a mesma em qualquer ambiente. */
const SITE_URL_CLIENTE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

export type ClientBriefing = {
  status: string; product_name: string | null; submitted_at: string | null; url: string;
};
export type LeadOrigin = {
  service_tag: string | null; page_origin: string | null;
  estimated_min: number | null; estimated_max: number | null;
};

// Situação comercial do contrato — o único eixo que faz sentido aqui: o trabalho
// é recorrente, não um projeto com "etapa de entrega"/data de conclusão.
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

// O que falta no cadastro para o contrato sair sem lacuna. Mesma régua do
// documento em /admin/contrato/[id], avisada antes de mandar para assinatura.
function faltamNoCadastro(c: ClientView): string[] {
  const falta: string[] = [];
  if (!c.legal_name) falta.push('razão social');
  if (!c.tax_id) falta.push('CNPJ/CPF');
  if (!c.address_street || !c.address_city) falta.push('endereço');
  if (!c.legal_rep) falta.push('representante legal');
  return falta;
}

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

// Situação do cliente pela lista: o estado comercial do contrato vivo (Ativo/
// Pausado), não a "etapa de entrega" — o trabalho é recorrente, não tem fim.
function clientStage(c: ClientView): { label: string; cls: string } {
  const live = c.contratos.find(isLive);
  if (live) {
    const cls = live.lifecycle === 'ativo' ? 'bg-primary/12 text-primary' : 'bg-warning/12 text-warning';
    return { label: LIFECYCLE_LABELS[live.lifecycle] ?? live.lifecycle, cls };
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
const fmtDateShort = (d: string | null) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y.slice(2)}`;
};

// ── Vigência / renovação ────────────────────────────────────────────────
// Dias entre hoje e a data de término (ambos YYYY-MM-DD, comparados em UTC).
function daysUntil(endDate: string, todayStr: string): number {
  return Math.round((Date.parse(endDate) - Date.parse(todayStr)) / 86_400_000);
}

type Renewal = { label: string; cls: string };

// Badge de renovação de UM contrato a partir do end_date.
function renewalBadge(endDate: string | null, todayStr: string): Renewal {
  if (!endDate) return { label: 'sem vigência', cls: 'bg-warning/12 text-warning' };
  const d = daysUntil(endDate, todayStr);
  if (d < 0) return { label: `vencido há ${-d}d`, cls: 'bg-danger/12 text-danger' };
  if (d === 0) return { label: 'vence hoje', cls: 'bg-danger/12 text-danger' };
  if (d <= 30) return { label: `vence em ${d}d`, cls: 'bg-warning/12 text-warning' };
  return { label: `até ${fmtDateShort(endDate)}`, cls: 'bg-black/[0.05] text-text-secondary' };
}

// Badge de renovação do CLIENTE na lista: o contrato "vivo" mais urgente.
function clientRenewal(c: ClientView, todayStr: string): Renewal | null {
  const live = c.contratos.filter(isLive);
  if (live.length === 0) return null;
  const comData = live.filter((e) => e.end_date).sort((a, b) => a.end_date!.localeCompare(b.end_date!));
  const semData = live.some((e) => !e.end_date);
  const soonest = comData[0];
  if (soonest) {
    const d = daysUntil(soonest.end_date!, todayStr);
    if (d <= 30) return renewalBadge(soonest.end_date!, todayStr); // vencido ou vence em ≤30d
    if (semData) return { label: 'definir vigência', cls: 'bg-warning/12 text-warning' };
    return renewalBadge(soonest.end_date!, todayStr);
  }
  return { label: 'definir vigência', cls: 'bg-warning/12 text-warning' };
}

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

export function ClientesView({ clients, productLabels = {}, templates = [], modelos = [] }: {
  clients: ClientView[];
  productLabels?: Record<string, string>;
  templates?: { key: string; label: string }[];
  modelos?: ModeloRow[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [novoCliente, setNovoCliente] = useState(false);
  const [vista, setVista] = useState<'clientes' | 'modelos'>('clientes');
  const selected = clients.find((c) => c.id === selectedId) ?? null;
  const excluindo = clients.find((c) => c.id === excluindoId) ?? null;

  // MRR conta só contratos ativos (pausado não fatura; churn/encerrado saíram).
  const mrrOf = (c: ClientView) => c.contratos.filter((e) => e.lifecycle === 'ativo').reduce((s, e) => s + (e.mrr ?? 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="mt-1 text-sm text-text-muted">{clients.length} cliente{clients.length === 1 ? '' : 's'} · dados cadastrais, contratos e contatos.</p>
        </div>
        {vista === 'clientes' && (
          <button onClick={() => setNovoCliente(true)} className="rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-primary/40 hover:text-primary">+ Cliente</button>
        )}
      </header>

      {/* Modelo de contrato é assunto de cliente: entra como sub-aba daqui, não
          como item novo de menu. */}
      <div className="mb-5 flex gap-1 border-b border-black/[0.06]">
        {([['clientes', 'Clientes'], ['modelos', `Modelos de contrato${modelos.length ? ` (${modelos.length})` : ''}`]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setVista(k)}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors ${vista === k ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {vista === 'modelos' ? <ModelosView modelos={modelos} /> : (<>

      {clients.length === 0 ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-text-muted">Nenhum cliente ainda. Ganhe um negócio no pipeline ou use <strong className="font-medium text-text-secondary">+ Cliente</strong> para cadastrar na mão.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-black/[0.06] bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left font-label text-[11px] uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Contato principal</th>
                <th className="px-4 py-3 font-medium">Contratos</th>
                <th className="px-4 py-3 font-medium">Vigência</th>
                <th className="px-4 py-3 text-right font-medium">MRR</th>
                <th className="w-10 px-2 py-3"><span className="sr-only">Excluir</span></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const mrr = mrrOf(c);
                const ativos = c.contratos.filter(isLive).length;
                const stage = clientStage(c);
                const renewal = clientRenewal(c, todayStr);
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
                    <td className="whitespace-nowrap px-4 py-3">
                      {renewal ? <span className={`rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wider ${renewal.cls}`}>{renewal.label}</span> : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">{mrr > 0 ? <span className="font-medium text-primary">{brl(mrr)}<span className="text-text-muted">/mês</span></span> : '—'}</td>
                    <td className="w-10 whitespace-nowrap px-2 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setExcluindoId(c.id)}
                        title={`Excluir ${c.name ?? 'cliente'}`}
                        aria-label={`Excluir ${c.name ?? 'cliente'}`}
                        className="rounded-md p-1.5 text-text-muted/60 transition-colors hover:bg-danger/[0.08] hover:text-danger"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {novoCliente && <NovoClienteDrawer onClose={() => setNovoCliente(false)} />}
      {excluindo && (
        <ExcluirClienteDialog
          client={excluindo}
          onClose={() => setExcluindoId(null)}
          onExcluido={() => setSelectedId(null)}
        />
      )}
      </>)}

      {selected && (
        <ClientDrawer
          client={selected}
          productLabels={productLabels}
          templates={templates}
          modelos={modelos}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

/**
 * Cadastro manual de cliente. O contrato inicial vem junto porque a lista de
 * Clientes é a lista de quem tem contrato: empresa sem contrato seria cadastrada
 * e sumiria da tela. Tudo aqui dá para ajustar depois na ficha.
 */
function NovoClienteDrawer({ onClose }: { onClose: () => void }) {
  const [pending, start] = useTransition();

  return (
    <Drawer title="Novo cliente" eyebrow="Cadastro manual" onClose={onClose}>
      <form action={(fd) => start(async () => { await createClient(fd); onClose(); })} className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Nome do cliente</label>
          <input name="name" required className={inputCls} placeholder="Ex: Rede Papa" />
        </div>

        <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-4">
          <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Contato principal (opcional)</p>
          <Field label="Nome" name="contact_name" placeholder="Ex: Vânia" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>E-mail</label><input name="contact_email" type="email" className={inputCls} placeholder="nome@empresa.com" /></div>
            <div><label className={labelCls}>WhatsApp</label><input name="contact_whatsapp" className={inputCls} placeholder="(11) 99999-9999" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Site</label><input name="site" className={inputCls} placeholder="cliente.com.br" /></div>
            <div><label className={labelCls}>Instagram</label><input name="instagram" className={inputCls} placeholder="@cliente" /></div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-4">
          <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Contrato inicial</p>
          <Field label="Título" name="title" placeholder="Ex: Plano de manutenção" />
          <div><label className={labelCls}>Tipo</label>
            <select name="type" className={inputCls} defaultValue="recorrente"><option value="recorrente">Recorrente</option><option value="pontual">Pontual</option></select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Mensal / MRR (R$)</label><input name="mrr" inputMode="decimal" className={inputCls} placeholder="2500" /></div>
            <div><label className={labelCls}>Valor avulso (R$)</label><input name="valor" inputMode="decimal" className={inputCls} placeholder="650" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Início</label><input name="start_date" type="date" className={inputCls} /></div>
            <div><label className={labelCls}>Fim</label><input name="end_date" type="date" className={inputCls} /></div>
          </div>
        </div>

        <button type="submit" disabled={pending} className="self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
          {pending ? 'Criando…' : 'Criar cliente'}
        </button>
      </form>
    </Drawer>
  );
}

function ClientDrawer({ client, productLabels = {}, templates = [], modelos = [], onClose }: {
  client: ClientView;
  productLabels?: Record<string, string>;
  templates?: { key: string; label: string }[];
  modelos?: ModeloRow[];
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [newContract, setNewContract] = useState(false);
  const [tab, setTab] = useState<'contratos' | 'cadastro' | 'onboarding'>(client.contratos.length > 0 ? 'contratos' : 'cadastro');

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
  const removeParcela = (id: string) => {
    const fd = new FormData();
    fd.set('id', id);
    start(() => deleteReceivable(fd));
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

  const briefingsPendentes = client.briefings.filter((b) => b.status !== 'enviado').length;
  const tabs: [typeof tab, string][] = [
    ['contratos', `Contratos (${client.contratos.length})`],
    ['onboarding', `Onboarding${client.briefings.length ? ` (${client.briefings.length}${briefingsPendentes ? `, ${briefingsPendentes} aguardando` : ''})` : ''}`],
    ['cadastro', 'Cadastro & contatos'],
  ];

  return (
    <Drawer title={client.name ?? 'Cliente'} eyebrow="Cliente" onClose={onClose} wide>
      {/* Resumo do projeto — os macros do cliente num relance */}
      <ProjectHeader client={client} productLabels={productLabels} />

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

      {tab === 'onboarding' && (
        <OnboardingTab client={client} templates={templates} />
      )}

      {tab === 'cadastro' && (
        <>
          {/* Dados cadastrais */}
          <AutoSaveForm action={updateOrganization} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={client.id} />
            <Field label="Nome (como aparece no sistema)" name="name" defaultValue={client.name} placeholder="Nome do cliente" />
            <OrgFiscalFields org={client} />
          </AutoSaveForm>

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

          <div className="border-t border-black/[0.06] pt-4">
            <button
              type="button"
              onClick={() => setConfirmandoExclusao(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-danger/25 px-2.5 py-1.5 font-label text-[10px] uppercase tracking-wider text-danger transition hover:bg-danger/[0.06]"
            >
              <TrashIcon /> Excluir cliente
            </button>
          </div>
          {confirmandoExclusao && (
            <ExcluirClienteDialog client={client} onClose={() => setConfirmandoExclusao(false)} onExcluido={onClose} />
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
                <div><label className={labelCls}>Situação</label>
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
                  {ativos.map((e) => <ContractCard key={e.id} eng={e} cliente={client} modelos={modelos} onMarkPaid={markPaid} onUnmark={unmark} onConclude={(fd) => start(() => concludeEngagement(fd))} onSaveDetails={(fd) => start(() => updateEngagementDetails(fd))} onSaveContract={(fd) => start(() => updateEngagementContract(fd))} onAddParcela={(fd) => start(() => createReceivable(fd))} onSaveParcela={(fd) => start(() => updateReceivable(fd))} onDeleteParcela={removeParcela} onChangeLifecycle={changeLifecycle} onDelete={remove} pending={pending} />)}
                </div>
              )}
              {encerrados.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted/50" /> Encerrados / inativos ({encerrados.length})
                  </p>
                  {encerrados.map((e) => <ContractCard key={e.id} eng={e} cliente={client} modelos={modelos} onMarkPaid={markPaid} onUnmark={unmark} onConclude={(fd) => start(() => concludeEngagement(fd))} onSaveDetails={(fd) => start(() => updateEngagementDetails(fd))} onSaveContract={(fd) => start(() => updateEngagementContract(fd))} onAddParcela={(fd) => start(() => createReceivable(fd))} onSaveParcela={(fd) => start(() => updateReceivable(fd))} onDeleteParcela={removeParcela} onChangeLifecycle={changeLifecycle} onDelete={remove} pending={pending} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

/** Ícone de lixeira da ação de excluir cliente na lista. */
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </svg>
  );
}

/**
 * Confirmação de exclusão de cliente. Some tudo: contratos, parcelas, briefings
 * e negócios do funil. Por isso pede o nome digitado, e não um "tem certeza?" —
 * o clique distraído não passa, e a tela diz de antemão o que vai embora junto.
 *
 * É um diálogo em vez de um bloco na página porque a exclusão é chamada de dois
 * lugares (a lixeira da lista e a ficha do cliente) e deve se comportar igual
 * nos dois.
 */
function ExcluirClienteDialog({ client, onClose, onExcluido }: { client: ClientView; onClose: () => void; onExcluido?: () => void }) {
  const [nome, setNome] = useState('');
  const [pending, start] = useTransition();

  const parcelas = client.contratos.reduce((s, e) => s + e.parcelas.length, 0);
  const recebido = client.contratos
    .flatMap((e) => e.parcelas)
    .filter((r) => r.status === 'recebido')
    .reduce((s, r) => s + (r.paid_amount ?? r.amount), 0);
  const alvo = (client.name ?? '').trim();
  const confere = nome.trim().toLocaleLowerCase('pt-BR') === alvo.toLocaleLowerCase('pt-BR');

  const itens = [
    `${client.contratos.length} contrato${client.contratos.length === 1 ? '' : 's'}`,
    `${parcelas} parcela${parcelas === 1 ? '' : 's'}`,
    client.briefings.length ? `${client.briefings.length} briefing${client.briefings.length === 1 ? '' : 's'}` : null,
    client.contacts.length ? `${client.contacts.length} vínculo${client.contacts.length === 1 ? '' : 's'} de contato` : null,
  ].filter(Boolean).join(' · ');

  const excluir = () => {
    const fd = new FormData();
    fd.set('id', client.id);
    start(async () => { await deleteOrganization(fd); onExcluido?.(); onClose(); });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      <div role="dialog" aria-modal className="relative w-full max-w-[26rem] rounded-lg border border-black/[0.08] bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold text-text-primary">Excluir {alvo || 'cliente'}?</h2>
        <p className="mt-2 text-xs text-text-secondary">
          Vai junto: {itens}.{recebido > 0 && ` Inclui ${brl(recebido)} já registrados como recebidos, que somem do faturamento.`} Não dá pra desfazer.
        </p>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && confere && !pending) excluir(); }}
          autoFocus
          className={`${inputCls} mt-3`}
          placeholder={`Digite ${alvo} para confirmar`}
          aria-label="Nome do cliente para confirmar a exclusão"
        />
        <div className="mt-3 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-black/[0.1] px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-black/20">Cancelar</button>
          <button type="button" onClick={excluir} disabled={!confere || pending} className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-danger/90 disabled:opacity-40">
            {pending ? 'Excluindo…' : 'Excluir cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractCard({ eng, cliente, modelos, onMarkPaid, onUnmark, onConclude, onSaveDetails, onSaveContract, onAddParcela, onSaveParcela, onDeleteParcela, onChangeLifecycle, onDelete, pending }: { eng: Contrato; cliente: ClientView; modelos: ModeloRow[]; onMarkPaid: (id: string, amount: number) => void; onUnmark: (id: string) => void; onConclude: (fd: FormData) => void; onSaveDetails: (fd: FormData) => void; onSaveContract: (fd: FormData) => void; onAddParcela: (fd: FormData) => void; onSaveParcela: (fd: FormData) => void; onDeleteParcela: (id: string) => void; onChangeLifecycle: (id: string, lifecycle: string) => void; onDelete: (id: string) => void; pending: boolean }) {
  const isConcluded = eng.lifecycle === 'encerrado' || eng.lifecycle === 'churn';
  const isActive = eng.lifecycle === 'ativo';
  const todayStr = new Date().toISOString().slice(0, 10);
  const renewal = isLive(eng) ? renewalBadge(eng.end_date, todayStr) : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingParcela, setAddingParcela] = useState(false);
  const [parcelasOpen, setParcelasOpen] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [historico, setHistorico] = useState(false);
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
                  {eng.type === 'recorrente' && (
                    <button type="button" onClick={() => { setHistorico(true); setMenuOpen(false); }} className={menuItem}>Lançar histórico</button>
                  )}
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

      {confirmDelete && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/[0.05] px-3 py-2">
          <span className="text-xs text-danger">Excluir este contrato e suas parcelas? Não dá pra desfazer.</span>
          <span className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => { onDelete(eng.id); setConfirmDelete(false); }} disabled={pending} className="rounded-md bg-danger px-2.5 py-1 font-label text-[10px] uppercase tracking-wider text-white transition hover:bg-danger/90 disabled:opacity-50">Excluir</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="font-label text-[10px] text-text-muted hover:text-text-secondary">cancelar</button>
          </span>
        </div>
      )}

      {historico && <HistoricoForm eng={eng} onClose={() => setHistorico(false)} />}

      {/* Meta em grid com rótulos, respirando */}
      <dl className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <dt className={labelCls}>Tipo</dt>
          <dd className="text-[13px] text-text-primary">{eng.type === 'recorrente' ? 'Recorrente' : 'Pontual'}</dd>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => { setEditingDetails(true); setEditing(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditingDetails(true); setEditing(false); } }}
          className="group -m-1 cursor-pointer rounded-md p-1 transition-colors hover:bg-black/[0.04]"
          title="Editar vigência"
        >
          <dt className={labelCls}>Vigência <span className="text-primary/50 transition-colors group-hover:text-primary">✎</span></dt>
          <dd className="text-[13px] text-text-primary">{fmtDate(eng.start_date)} <span className="text-text-muted/50">→</span> {fmtDate(eng.end_date)}</dd>
          {renewal && (
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wider ${renewal.cls}`}>{renewal.label}</span>
          )}
        </div>
        <div>
          <dt className={labelCls}>Valor</dt>
          <dd className="text-[13px] text-text-primary">{valorLabel}</dd>
        </div>
      </dl>

      {/* Ação principal */}
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-black/[0.06] pt-3">
        <a href={`/admin/contrato/${eng.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90">Ver contrato ↗</a>

        {modelos.length > 0 && (
          <label className="flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-text-muted">
            Modelo
            <select
              defaultValue={eng.contract_template_id ?? ''}
              onChange={(e) => {
                const fd = new FormData();
                fd.set('engagement_id', eng.id);
                fd.set('template_id', e.target.value);
                definirModeloDoContrato(fd);
              }}
              className="rounded-md border border-black/[0.1] bg-white px-2 py-1 text-xs normal-case tracking-normal text-text-primary outline-none transition focus:border-primary"
            >
              <option value="">Padrão</option>
              {modelos.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </label>
        )}
      </div>

      {editingDetails && (
        <AutoSaveForm action={onSaveDetails} className="mt-3 flex flex-col gap-3 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-3">
          <input type="hidden" name="id" value={eng.id} />
          <Field label="Título" name="title" defaultValue={eng.title} placeholder="Ex: Sistema de gestão" />
          <div><label className={labelCls}>Tipo</label>
            <select name="type" className={inputCls} defaultValue={eng.type}><option value="recorrente">Recorrente</option><option value="pontual">Pontual</option></select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Mensal / MRR (R$)</label><input name="mrr" inputMode="decimal" defaultValue={eng.mrr != null ? String(eng.mrr) : ''} className={inputCls} placeholder="2500" /></div>
            <div><label className={labelCls}>Valor avulso (R$)</label><input name="valor" inputMode="decimal" defaultValue={eng.valor != null ? String(eng.valor) : ''} className={inputCls} placeholder="650" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Início</label><input name="start_date" type="date" defaultValue={eng.start_date ?? ''} className={inputCls} /></div>
            <div><label className={labelCls}>Fim</label><input name="end_date" type="date" defaultValue={eng.end_date ?? ''} className={inputCls} /></div>
          </div>
          <button type="button" onClick={() => setEditingDetails(false)} className="self-start font-label text-[11px] text-text-muted hover:text-text-secondary">fechar</button>
        </AutoSaveForm>
      )}

      {editing && (
        <AutoSaveForm action={onSaveContract} className="mt-3 flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-3">
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
          </div>
          <div>
            <label className={labelCls}>Obrigações da CONTRATADA (Cláusula 3)</label>
            <textarea name="provider_obligations" defaultValue={eng.provider_obligations ?? DEFAULT_PROVIDER_OBLIGATIONS} rows={5} className={inputCls + ' resize-y'} />
          </div>
          <button type="button" onClick={() => setEditing(false)} className="self-start font-label text-[11px] text-text-muted hover:text-text-secondary">fechar</button>
        </AutoSaveForm>
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

      <AssinaturaBloco
        engagementId={eng.id}
        assinatura={eng.assinatura}
        sugestao={{
          nome: cliente.legal_rep,
          email: cliente.contacts.find((c) => c.email)?.email ?? null,
          documento: cliente.legal_rep_cpf,
        }}
        faltamDados={faltamNoCadastro(cliente)}
      />

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
              <ParcelaRow key={r.id} r={r} onMarkPaid={onMarkPaid} onUnmark={onUnmark} onSave={onSaveParcela} onDelete={onDeleteParcela} pending={pending} />
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

/** Mês anterior a um YYYY-MM. */
function mesAnterior(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

/**
 * Lança de uma vez as mensalidades de antes de o sistema entrar em uso, já
 * baixadas. A sugestão de período vai de janeiro até o mês anterior à primeira
 * parcela que já existe — que é exatamente o buraco no gráfico de receita.
 */
function HistoricoForm({ eng, onClose }: { eng: Contrato; onClose: () => void }) {
  const [pending, start] = useTransition();
  const primeira = eng.parcelas.map((p) => p.due_date).sort()[0] ?? null;
  const ate = mesAnterior((primeira ?? new Date().toISOString().slice(0, 10)).slice(0, 7));
  const de = `${ate.slice(0, 4)}-01`;

  return (
    <form
      action={(fd) => start(async () => { await backfillMonthlyReceivables(fd); onClose(); })}
      className="mt-3 flex flex-col gap-3 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-3"
    >
      <input type="hidden" name="engagement_id" value={eng.id} />
      <div>
        <p className="text-xs font-medium text-text-primary">Lançar histórico de mensalidades</p>
        <p className="mt-0.5 font-label text-[10px] text-text-muted">Para o que o cliente já pagava antes do sistema. Mês que já tem parcela é pulado, e a vigência recua se o histórico começar antes dela.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>De</label><input name="from_month" type="month" required defaultValue={de} className={inputCls} /></div>
        <div><label className={labelCls}>Até</label><input name="to_month" type="month" required defaultValue={ate} className={inputCls} /></div>
      </div>
      <div>
        <label className={labelCls}>Valor da mensalidade (R$)</label>
        <input name="amount" inputMode="decimal" defaultValue={eng.mrr != null ? String(eng.mrr) : ''} className={inputCls} placeholder="Em branco usa o MRR do contrato" />
      </div>
      <label className="flex items-center gap-2 text-xs text-text-secondary">
        <input type="checkbox" name="pago" defaultChecked className="h-3.5 w-3.5 accent-[#2F6BEA]" />
        Já foram pagas (baixa na data do vencimento)
      </label>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60">{pending ? 'Lançando…' : 'Lançar'}</button>
        <button type="button" onClick={onClose} className="font-label text-[10px] text-text-muted hover:text-text-secondary">cancelar</button>
      </div>
    </form>
  );
}

/** Uma parcela dentro do card de contrato: leitura, edição inline e exclusão. */
function ParcelaRow({ r, onMarkPaid, onUnmark, onSave, onDelete, pending }: { r: Parcela; onMarkPaid: (id: string, amount: number) => void; onUnmark: (id: string) => void; onSave: (fd: FormData) => void; onDelete: (id: string) => void; pending: boolean }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const flushRef = useRef<(() => void) | null>(null);

  if (editing) {
    return (
      <li>
        <AutoSaveForm
          action={onSave}
          flushRef={flushRef}
          className="flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-2.5"
        >
          <input type="hidden" name="id" value={r.id} />
          <input name="description" defaultValue={r.description ?? ''} className={inputCls} placeholder="Descrição" />
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input name="amount" inputMode="decimal" required defaultValue={String(r.amount)} className={inputCls} placeholder="Valor (R$)" />
            <input name="due_date" type="date" required defaultValue={r.due_date} className={inputCls} />
            <button type="button" onClick={() => { flushRef.current?.(); setEditing(false); }} className="rounded-md border border-black/[0.1] px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:border-black/20">Fechar</button>
          </div>
          {confirmDelete ? (
            <span className="flex items-center gap-2 text-[10px] text-danger">
              Excluir esta parcela?
              <button type="button" onClick={() => { onDelete(r.id); setEditing(false); }} disabled={pending} className="rounded bg-danger px-2 py-0.5 font-medium text-white disabled:opacity-60">Excluir</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="text-text-muted underline decoration-dotted">cancelar</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="self-start font-label text-[10px] uppercase tracking-wider text-text-muted underline decoration-dotted transition hover:text-danger">Excluir parcela</button>
          )}
        </AutoSaveForm>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 text-xs">
      <span className="text-text-secondary">{r.description ?? '—'} <span className="text-text-muted">· {fmtDate(r.due_date)} · {brl(r.amount)}</span></span>
      <span className="flex shrink-0 items-center gap-1.5">
        {r.status === 'recebido' ? (
          <>
            <span className="font-label text-[10px] text-success">✓ pago</span>
            <button onClick={() => onUnmark(r.id)} disabled={pending} className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger disabled:opacity-50">desfazer</button>
          </>
        ) : (
          <button onClick={() => onMarkPaid(r.id, r.amount)} disabled={pending} className="rounded border border-success/40 px-2 py-0.5 text-[10px] font-medium text-success transition hover:bg-success/10 disabled:opacity-50">Marcar</button>
        )}
        <button onClick={() => setEditing(true)} className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-primary">editar</button>
      </span>
    </li>
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
function ProjectHeader({ client, productLabels = {} }: { client: ClientView; productLabels?: Record<string, string> }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const live = client.contratos.find(isLive) ?? null;
  const fin = financeHealth(client.contratos, todayStr);
  const contact = client.contacts[0] ?? null;
  const lo = client.leadOrigin;

  const mrr = client.contratos.filter((e) => e.lifecycle === 'ativo').reduce((s, e) => s + (e.mrr ?? 0), 0);
  const valorAvulso = client.contratos.filter(isLive).reduce((s, e) => s + (e.valor ?? 0), 0);
  const valorLabel = mrr > 0 ? `${brl(mrr)}/mês` : valorAvulso > 0 ? brl(valorAvulso) : '—';

  // Contratos "vivos" para a quebra por serviço — ativos primeiro, pausados depois.
  const liveList = client.contratos.filter(isLive).sort((a, b) => (b.mrr ?? 0) - (a.mrr ?? 0));
  const engValorLabel = (e: Contrato) =>
    [
      (e.mrr ?? 0) > 0 ? `${brl(e.mrr!)}/mês` : null,
      (e.valor ?? 0) > 0 ? `${brl(e.valor!)} avulso` : null,
    ].filter(Boolean).join(' · ') || '—';

  // Situação = estado comercial do contrato (Ativo/Pausado…), não "etapa de
  // entrega" — o trabalho é recorrente, não é um projeto com data de conclusão.
  const stageLabel = live ? (LIFECYCLE_LABELS[live.lifecycle] ?? live.lifecycle) : client.contratos.length ? 'Encerrado' : 'Sem contrato';
  const lifeTone = live ? (LIFE_TONE[live.lifecycle] ?? LIFE_TONE.encerrado) : 'bg-black/[0.06] text-text-secondary';

  const estMin = lo?.estimated_min, estMax = lo?.estimated_max;
  const estimativa = lo && (estMin || estMax) ? `est. ${estMin ? brl(estMin) : '—'}–${estMax ? brl(estMax) : '—'}` : null;
  const origem = lo
    ? [productLabels[lo.service_tag ?? ''] ?? SERVICE_LABELS[lo.service_tag ?? ''] ?? lo.service_tag, lo.page_origin, estimativa].filter(Boolean).join(' · ')
    : null;

  const cellLabel = 'font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

  return (
    <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-4">
      <p className="mb-3 font-label text-[10px] uppercase tracking-[0.14em] text-primary/80">Resumo do projeto</p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div>
          <p className={cellLabel}>Situação</p>
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

      {/* Quebra por contrato/serviço: quanto cada um pesa e o total recorrente. */}
      {liveList.length > 0 && (
        <div className="mt-3 border-t border-primary/10 pt-3">
          <p className={cellLabel + ' mb-2'}>Contratos &amp; serviços ({liveList.length})</p>
          <ul className="flex flex-col gap-1">
            {liveList.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5 text-text-secondary">
                  <span className="truncate">{e.title ?? 'Contrato'}</span>
                  {e.lifecycle === 'pausado' && (
                    <span className="shrink-0 rounded-full bg-warning/12 px-1.5 font-label text-[9px] uppercase tracking-wider text-warning">pausado</span>
                  )}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-text-primary">{engValorLabel(e)}</span>
              </li>
            ))}
          </ul>
          {(mrr > 0 || valorAvulso > 0) && (
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-primary/10 pt-2">
              <span className={cellLabel}>Total recorrente</span>
              <span className="font-semibold tabular-nums text-primary">
                {mrr > 0 ? `${brl(mrr)}/mês` : '—'}
                {valorAvulso > 0 && <span className="ml-1.5 font-normal text-text-muted">+ {brl(valorAvulso)} avulso</span>}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1.5 border-t border-primary/10 pt-3 text-xs">
        <div className="flex gap-2">
          <span className={cellLabel + ' shrink-0 pt-0.5'}>Contato</span>
          <span className="text-text-secondary">{contact ? [contact.name ?? '—', contact.whatsapp, contact.email].filter(Boolean).join(' · ') : '—'}</span>
        </div>
        {(client.site || client.instagram) && (
          <div className="flex gap-2">
            <span className={cellLabel + ' shrink-0 pt-0.5'}>Na web</span>
            <span className="flex flex-wrap items-center gap-x-3 text-text-secondary">
              {siteHref(client.site) && (
                <a href={siteHref(client.site)!} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                  {client.site}
                </a>
              )}
              {instagramHandle(client.instagram) && (
                <a href={instagramHref(client.instagram)!} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                  @{instagramHandle(client.instagram)}
                </a>
              )}
            </span>
          </div>
        )}
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
          <span className="font-label text-[10px] text-text-muted">respostas na aba Onboarding</span>
        )}
      </div>
    </div>
  );
}

/**
 * Onboarding do cliente: os briefings dele, com link para copiar e as respostas
 * ali dentro. Antes isso era uma tela separada no menu; onboarding é assunto do
 * cliente, então mora na ficha dele.
 */
function OnboardingTab({ client, templates }: { client: ClientView; templates: { key: string; label: string }[] }) {
  const [abertoId, setAbertoId] = useState<string | null>(client.briefings[0]?.id ?? null);
  const aberto = client.briefings.find((b) => b.id === abertoId) ?? null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          {client.briefings.length} briefing{client.briefings.length === 1 ? '' : 's'}
        </p>
        <NewBriefing
          orgs={[]}
          templates={templates}
          org={{ id: client.id, name: client.name ?? 'Cliente' }}
          discreto
        />
      </div>

      {client.briefings.length === 0 ? (
        <p className="rounded-md border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-text-muted">
          Nenhum briefing ainda. Crie um e mande o link para o cliente responder.
        </p>
      ) : (
        <ul className="mb-4 flex flex-col gap-2">
          {client.briefings.map((b) => {
            const enviado = b.status === 'enviado';
            const ativo = b.id === abertoId;
            return (
              <li key={b.id}>
                {/* O link do cliente fica na linha, sem precisar abrir o briefing:
                    enquanto ninguém respondeu, é a ação principal daqui. */}
                <div
                  className={`flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 transition-colors ${
                    ativo ? 'border-primary/40 bg-primary/[0.04]' : 'border-black/[0.06] bg-white hover:border-black/15'
                  }`}
                >
                  <button
                    onClick={() => setAbertoId(ativo ? null : b.id)}
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                      {b.product_name ?? 'Briefing'}
                    </span>
                    <StatusBadge enviado={enviado} />
                    <span className="font-label text-[10px] text-text-muted">
                      {enviado ? `respondido em ${fmtBriefingDate(b.submitted_at)}` : `criado em ${fmtBriefingDate(b.created_at)}`}
                    </span>
                  </button>
                  {!enviado && <CopyLink url={`${SITE_URL_CLIENTE}/onboarding/${b.token}`} destaque />}
                </div>

                {ativo && (
                  <div className="mt-2 overflow-hidden rounded-md border border-black/[0.06] bg-white">
                    <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] px-4 py-2.5">
                      <CopyButton text={buildCopyBlock(b)} label="copiar tudo" />
                      <CopyLink url={`${SITE_URL_CLIENTE}/onboarding/${b.token}`} />
                    </div>
                    <BriefingConteudo row={b} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
