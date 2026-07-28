'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import {
  createDeal,
  updateDeal,
  winDeal,
  uploadDealProposal,
  removeDealProposal,
  addDealInstallment,
  deleteDealInstallment,
  generateInstallments,
  generateRecurringInstallments,
} from './actions';
import { PIPELINE_STAGES, STAGE_LABELS, SERVICE_TAGS, SERVICE_LABELS, type DealStage } from './stages';
import { normalizeOrgName, type OrgOption, type Product } from './orgs';
import { ProductsManager } from './products-manager';
import { ProductSelect } from './product-select';
import type { BoardDeal } from './board';
import { AutoSaveForm } from '../_shared/auto-save-form';

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const fmtDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
  type = 'text',
  className = '',
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        className={inputCls}
      />
    </div>
  );
}

/**
 * Empresa + contato do modo criação. O campo Empresa busca nas empresas já
 * cadastradas: escolher uma sugestão vincula o negócio ao cliente existente
 * (organization_id) e já preenche o contato principal (nome/whats/e-mail),
 * reaproveitando o cadastro (contact_id) em vez de duplicar.
 */
function CreateIdentityFields({ orgOptions }: { orgOptions: OrgOption[] }) {
  const [company, setCompany] = useState('');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = normalizeOrgName(company);
    if (!q) return [];
    return orgOptions.filter((o) => normalizeOrgName(o.name).includes(q)).slice(0, 6);
  }, [company, orgOptions]);

  const linked = orgId ? orgOptions.find((o) => o.id === orgId) : null;

  function pickOrg(o: OrgOption) {
    setCompany(o.name);
    setOrgId(o.id);
    setOpen(false);
    setContactId(o.contact?.id ?? null);
    setName(o.contact?.name ?? '');
    setWhatsapp(o.contact?.whatsapp ?? '');
    setEmail(o.contact?.email ?? '');
  }

  return (
    <>
      <div className="relative">
        <label className={labelCls}>
          Empresa<span className="text-danger"> *</span>
        </label>
        <input
          name="company"
          value={company}
          required
          autoComplete="off"
          placeholder="Nome da empresa"
          className={inputCls}
          onChange={(e) => {
            setCompany(e.target.value);
            setOrgId(null); // digitou por cima: desfaz o vínculo
            setContactId(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
        <input type="hidden" name="organization_id" value={orgId ?? ''} />
        <input type="hidden" name="contact_id" value={contactId ?? ''} />

        {open && !linked && matches.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-black/[0.08] bg-white shadow-lg">
            {matches.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  // mousedown dispara antes do blur do input
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickOrg(o);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm text-text-primary transition-colors hover:bg-primary/[0.06]"
                >
                  <span className="truncate">{o.name}</span>
                  <span className="shrink-0 font-label text-[10px] uppercase tracking-wider text-text-muted">já cadastrada</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className={`mt-1 font-label text-[10px] ${linked ? 'text-success' : 'text-text-muted'}`}>
          {linked
            ? `Vinculado ao cliente existente: ${linked.name}${contactId ? ' (contato preenchido)' : ''}`
            : 'Se a empresa já existir, escolha na lista para não duplicar o cliente.'}
        </p>
      </div>

      <div>
        <label className={labelCls}>Contato (opcional)</label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Quem você fala (pode ser um terceiro)"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>WhatsApp</label>
          <input
            name="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(00) 00000-0000"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="opcional"
            className={inputCls}
          />
        </div>
      </div>
    </>
  );
}

const brl2 = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

/** Converte texto pt-BR ("12.500" / "12500,50") em número; mesma regra do servidor. */
const parseNum = (raw: string): number => {
  const n = Number(raw.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Bloco financeiro do negócio: tipo de cobrança (à vista ou recorrente mensal),
 * valor, estágio, repasse pro gestor e nota fiscal. Com "precisa de nota" marcado,
 * mostra na hora os 6% pagos e o valor líquido (já descontando também o repasse).
 * No recorrente, as contas são sobre o valor mensal.
 */
function FinanceFields({
  deal,
  stageOptions,
  currentStage,
}: {
  deal: BoardDeal | null;
  stageOptions: readonly string[];
  currentStage: string;
}) {
  const [billing, setBilling] = useState<'pontual' | 'recorrente'>(
    deal?.mrr != null && deal.mrr > 0 ? 'recorrente' : 'pontual',
  );
  const [valor, setValor] = useState(deal?.valor_pontual != null ? String(deal.valor_pontual) : '');
  const [mrr, setMrr] = useState(deal?.mrr != null && deal.mrr > 0 ? String(deal.mrr) : '');
  const [repasseValor, setRepasseValor] = useState(deal?.repasse_valor != null ? String(deal.repasse_valor) : '');
  const [precisaNota, setPrecisaNota] = useState(deal?.precisa_nota ?? false);

  const recorrente = billing === 'recorrente';
  const v = recorrente ? parseNum(mrr) : parseNum(valor);
  const nf = precisaNota ? v * 0.06 : 0;
  const rep = parseNum(repasseValor);
  const liquido = v - nf - rep;
  const sufixo = recorrente ? '/mês' : '';

  return (
    <>
      {/* Marcador do tipo de cobrança lido pelo servidor. */}
      <input type="hidden" name="billing" value={billing} />

      <div>
        <label className={labelCls}>Cobrança</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            ['pontual', 'À vista / pontual'],
            ['recorrente', 'Recorrente (mensal)'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setBilling(key)}
              className={[
                'rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                billing === key
                  ? 'border-primary/50 bg-primary/[0.06] font-medium text-text-primary'
                  : 'border-black/[0.08] text-text-secondary hover:border-primary/40',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{recorrente ? 'Valor mensal (R$)' : 'Valor (R$)'}</label>
          {recorrente ? (
            <input
              name="mrr"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          ) : (
            <input
              name="valor_pontual"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          )}
        </div>
        <div>
          <label className={labelCls}>Estágio</label>
          <select name="stage" defaultValue={currentStage} className={inputCls}>
            {stageOptions.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s as DealStage] ?? s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {recorrente && (
        <p className="-mt-1 rounded-md border border-primary/20 bg-primary/[0.03] px-2.5 py-2 font-label text-[10px] text-text-secondary">
          Defina o prazo (nº de meses) e gere as mensalidades logo abaixo, em “Parcelas do negócio”.
          Ao ganhar, elas viram as cobranças mensais do contrato.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Repasse (R$)</label>
          <input
            name="repasse_valor"
            value={repasseValor}
            onChange={(e) => setRepasseValor(e.target.value)}
            placeholder="0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Repasse para</label>
          <input name="repasse_para" defaultValue={deal?.repasse_para ?? ''} placeholder="ex.: gestor" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            name="precisa_nota"
            checked={precisaNota}
            onChange={(e) => setPrecisaNota(e.target.checked)}
            className="h-3.5 w-3.5 accent-primary"
          />
          Precisa de nota fiscal?
        </label>
        {v > 0 && (precisaNota || rep > 0) && (
          <p className="mt-1.5 rounded-md border border-black/[0.06] bg-[#F4F5F7] px-2.5 py-2 font-label text-[11px] text-text-secondary">
            {precisaNota && (
              <>
                NF (6%): <strong>{brl2(nf)}{sufixo}</strong> ·{' '}
              </>
            )}
            {rep > 0 && (
              <>
                Repasse: <strong>{brl2(rep)}{sufixo}</strong> ·{' '}
              </>
            )}
            Líquido: <strong className="text-text-primary">{brl2(liquido)}{sufixo}</strong>
          </p>
        )}
      </div>
    </>
  );
}

/**
 * Gaveta lateral única do pipeline: cria (deal = null) ou edita um negócio.
 * A EMPRESA é o campo principal/obrigatório; o contato é opcional.
 */
export function DealDrawer({
  deal,
  onClose,
  orgOptions = [],
  products = [],
  defaultStage,
}: {
  deal: BoardDeal | null;
  onClose: () => void;
  orgOptions?: OrgOption[];
  products?: Product[];
  /** Etapa em que o negócio novo nasce (vem do "+" da coluna do kanban). */
  defaultStage?: DealStage;
}) {
  const isNew = deal === null;
  const [savePending, startSave] = useTransition();
  const [winPending, startWin] = useTransition();
  const [manageOpen, setManageOpen] = useState(false);
  // Salvamento pendente do autosave: garante que o que foi digitado agora não se
  // perca se o painel for fechado antes da pausa.
  const flushRef = useRef<(() => void) | null>(null);
  const fechar = () => { flushRef.current?.(); onClose(); };
  // O seletor de produto não é um <input>: precisa pedir o salvamento na mão.
  const salvarAgora = () => {
    const form = document.getElementById('dealForm') as HTMLFormElement | null;
    if (form?.checkValidity()) form.requestSubmit();
  };


  // Opções de produto: tabela products (ativos), com fallback pra lista antiga do
  // código; tags já gravadas no negócio continuam aparecendo mesmo se desativadas.
  const productOptions = useMemo(() => {
    const opts = products.length
      ? products.filter((p) => p.active).map((p) => ({ key: p.key, label: p.name }))
      : SERVICE_TAGS.map((s) => ({ key: s as string, label: SERVICE_LABELS[s] }));
    for (const tag of deal?.service_tags ?? []) {
      if (!opts.some((o) => o.key === tag)) {
        opts.push({
          key: tag,
          label: products.find((p) => p.key === tag)?.name ?? SERVICE_LABELS[tag as keyof typeof SERVICE_LABELS] ?? tag,
        });
      }
    }
    return opts;
  }, [products, deal]);

  const isWon = deal?.stage === 'ganho';
  const currentStage = deal?.stage ?? defaultStage ?? 'novo';
  // Ganho/perdido saem das colunas; ainda assim mostramos o estágio atual no select.
  const stageOptions = PIPELINE_STAGES.includes(currentStage as (typeof PIPELINE_STAGES)[number])
    ? [...PIPELINE_STAGES]
    : [currentStage, ...PIPELINE_STAGES];

  const title = isNew ? 'Novo negócio' : deal!.org?.name ?? deal!.name ?? 'Negócio';
  const eyebrow = isNew ? `Novo em ${STAGE_LABELS[currentStage as DealStage]}` : STAGE_LABELS[deal!.stage];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <button
        aria-label="Fechar"
        onClick={fechar}
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
      />

      {/* Painel */}
      <aside className="relative flex h-full w-full max-w-[26rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-white px-5 py-4">
          <div>
            <p className="eyebrow mb-1">
              <span className="status-dot" />
              {eyebrow}
            </p>
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-text-primary">{title}</h2>

            {/* Toggle Ganhar negócio — só na edição; cria o contrato no financeiro ao ligar */}
            {!isNew && (
              <button
                type="button"
                role="switch"
                aria-checked={isWon}
                disabled={isWon || winPending}
                onClick={() => {
                  const fd = new FormData();
                  fd.set('id', deal!.id);
                  startWin(() => winDeal(fd));
                }}
                title={isWon ? 'Negócio ganho' : `Marcar como ganho — cria o contrato${deal!.valor_pontual ? ` de ${brl(deal!.valor_pontual)}` : ''} no financeiro`}
                className="mt-2.5 inline-flex items-center gap-2 disabled:cursor-default"
              >
                <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isWon ? 'bg-success' : 'bg-black/[0.15]'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isWon ? 'left-[1.15rem]' : 'left-0.5'}`} />
                </span>
                <span className={`font-label text-[11px] uppercase tracking-wider ${isWon ? 'text-success' : 'text-text-secondary'}`}>
                  {winPending ? 'Fechando…' : isWon ? 'Ganho' : 'Ganhar negócio'}
                </span>
              </button>
            )}
          </div>
          <button
            onClick={fechar}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desfecho ganho + próximo passo */}
        {isWon && (
          <div className="mx-5 mt-4 rounded-md border border-success/25 bg-success/[0.06] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Negócio ganho
            </p>
            <p className="mt-1 font-label text-[11px] text-text-secondary">
              Próximo passo: preencher os dados cadastrais e o contrato na aba <strong className="font-semibold">Clientes</strong>.
            </p>
          </div>
        )}

        {/* Mesmos campos para criar e editar. Na edição não há botão de salvar:
            o formulário grava sozinho a cada alteração. */}
        <AutoSaveForm
          id="dealForm"
          auto={!isNew}
          flushRef={flushRef}
          action={(fd) =>
            isNew
              ? startSave(async () => { await createDeal(fd); onClose(); })
              : updateDeal(fd)
          }
          className="flex flex-col gap-4 px-5 pt-4"
        >
          {!isNew && (
            <>
              <input type="hidden" name="id" value={deal!.id} />
              <input type="hidden" name="organization_id" value={deal!.organization_id ?? ''} />
              <input type="hidden" name="contact_id" value={deal!.contact_id ?? ''} />
            </>
          )}

          {isNew ? (
            <CreateIdentityFields orgOptions={orgOptions} />
          ) : (
            <>
              <Field
                label="Empresa"
                name="company"
                defaultValue={deal?.org?.name}
                placeholder="Nome da empresa"
                required
              />

              <Field
                label="Contato (opcional)"
                name="name"
                defaultValue={deal?.name}
                placeholder="Quem você fala (pode ser um terceiro)"
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="WhatsApp" name="whatsapp" defaultValue={deal?.whatsapp} placeholder="(00) 00000-0000" />
                <Field label="E-mail" name="email" type="email" defaultValue={deal?.email} placeholder="opcional" />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted">
              Produto / serviço (pode marcar mais de um)
            </label>
            <input type="hidden" name="service_tags_present" value="1" />
            <ProductSelect
              options={productOptions.map((o) => ({ key: o.key, label: o.label }))}
              defaultSelected={deal?.service_tags ?? []}
              name="service_tag"
              onManage={() => setManageOpen(true)}
              onChangeSelection={isNew ? undefined : salvarAgora}
            />
          </div>

          <FinanceFields deal={deal} stageOptions={stageOptions} currentStage={currentStage} />

          <div>
            <label className={labelCls}>Notas</label>
            <textarea
              name="notes"
              defaultValue={deal?.notes ?? ''}
              rows={5}
              className={inputCls + ' resize-y'}
              placeholder="Contexto do negócio, origem da indicação, condições, próximos passos…"
            />
          </div>
        </AutoSaveForm>

        {/* Proposta e parcelas exigem o negócio já salvo (precisam do id). */}
        {!isNew && (
          <div className="mt-5 flex flex-col gap-5 border-t border-black/[0.06] px-5 py-4">
            <ProposalSection deal={deal!} />
            <InstallmentsSection deal={deal!} />
          </div>
        )}

        {/* Criar exige confirmação; editar salva sozinho. */}
        {isNew && (
          <div className="sticky bottom-0 mt-auto border-t border-black/[0.06] bg-white px-5 py-3">
            <button
              type="submit"
              form="dealForm"
              disabled={savePending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {savePending ? 'Criando…' : 'Criar negócio'}
            </button>
          </div>
        )}
      </aside>

      {manageOpen && <ProductsManager products={products} onClose={() => setManageOpen(false)} />}
    </div>
  );
}

/** Proposta enviada, anexada ao negócio (bucket privado, aberta por URL assinada). */
function ProposalSection({ deal }: { deal: BoardDeal }) {
  return (
    <section>
      <p className="mb-2 font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Proposta enviada</p>
      {deal.proposal_path ? (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/admin/proposta/deal/${deal.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-black/[0.04] px-2.5 py-1.5 font-label text-[11px] uppercase tracking-wider text-text-secondary transition hover:text-primary"
          >
            📎 Ver proposta
          </a>
          {deal.proposal_name && (
            <span className="max-w-[10rem] truncate font-label text-[10px] text-text-muted">{deal.proposal_name}</span>
          )}
          <form action={removeDealProposal}>
            <input type="hidden" name="id" value={deal.id} />
            <button type="submit" className="font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger">
              remover
            </button>
          </form>
        </div>
      ) : (
        <form action={uploadDealProposal}>
          <input type="hidden" name="id" value={deal.id} />
          {/* Ao escolher o arquivo já anexa (sem botão extra). */}
          <input
            type="file"
            name="file"
            accept=".pdf,.html,.htm,application/pdf,text/html"
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="w-full text-[11px] file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-[10px] file:font-medium file:text-primary"
          />
          <p className="mt-1 font-label text-[10px] text-text-muted">Escolha o PDF/HTML: anexa automaticamente.</p>
        </form>
      )}
    </section>
  );
}

/**
 * Gerador de parcelas do projeto ÚNICO: divide o valor cheio em N. Mostra o valor
 * de cada parcela enquanto você digita — é o que denuncia na hora quando o valor
 * digitado era uma mensalidade e não o total do contrato.
 */
function SplitInstallments({ dealId, valor }: { dealId: string; valor: number }) {
  const [count, setCount] = useState(1);
  const cada = count > 0 ? valor / count : 0;

  return (
    <form action={generateInstallments} className="mb-2 flex flex-col gap-2 rounded-md border border-primary/20 bg-primary/[0.03] p-2.5">
      <input type="hidden" name="deal_id" value={dealId} />
      <p className="font-label text-[10px] uppercase tracking-wider text-text-secondary">
        Parcelar {brl(valor)} automaticamente
      </p>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="flex items-center gap-1.5">
          <input
            name="count"
            type="number"
            min={1}
            max={60}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
            required
            className={inputCls + ' w-14 text-center'}
          />
          <span className="font-label text-[11px] text-text-secondary">x a partir de</span>
        </div>
        <input name="first_due_date" type="date" required className={inputCls} />
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90">
          Gerar
        </button>
      </div>
      {count > 1 && (
        <p className="font-label text-[10px] text-text-secondary">
          Vai gerar <strong>{count}x de {brl(cada)}</strong>. O valor cheio do contrato é que se divide;
          se {brl(valor)} for a mensalidade, o negócio é recorrente, não pontual.
        </p>
      )}
    </form>
  );
}

/** Parcelas planejadas do negócio. Ao ganhar, viram as cobranças do contrato (financeiro). */
function InstallmentsSection({ deal }: { deal: BoardDeal }) {
  const total = deal.installments.reduce((s, p) => s + p.amount, 0);
  const valor = deal.valor_pontual ?? 0;
  const mrr = deal.mrr ?? 0;
  const recorrente = mrr > 0;

  // Parcela que não bate com a cobrança do negócio. Acontece quando o negócio é
  // criado como pontual, as parcelas são geradas (valor dividido) e depois ele
  // vira recorrente: as parcelas velhas ficam e alimentam a projeção com um valor
  // que não existe. Aqui isso aparece em vez de passar batido.
  const desalinhada =
    deal.installments.length > 0 &&
    (recorrente
      ? deal.installments.some((p) => Math.abs(p.amount - mrr) > 0.01)
      : valor > 0 && Math.abs(total - valor) > 0.01);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          {recorrente ? 'Mensalidades do negócio' : 'Parcelas do negócio'} ({deal.installments.length})
        </p>
        {total > 0 && <span className="font-label text-[10px] text-text-muted">{brl(total)}</span>}
      </div>

      {desalinhada && (
        <p className="mb-2 rounded-md border border-warning/30 bg-warning/[0.06] px-2.5 py-2 text-[11px] leading-relaxed text-text-secondary">
          {recorrente ? (
            <>
              A mensalidade é <strong>{brl(mrr)}/mês</strong>, mas as parcelas lançadas não são desse
              valor. Elas continuam valendo na projeção de receita. Gere as mensalidades de novo abaixo
              para corrigir.
            </>
          ) : (
            <>
              As parcelas somam <strong>{brl(total)}</strong> e o negócio vale <strong>{brl(valor)}</strong>.
              A projeção usa as parcelas. Gere de novo abaixo para corrigir.
            </>
          )}
        </p>
      )}

      {/* Gerador automático. No recorrente: N mensalidades iguais ao valor mensal.
          No à vista: divide o valor total em N parcelas. */}
      {recorrente ? (
        <form action={generateRecurringInstallments} className="mb-2 flex flex-col gap-2 rounded-md border border-primary/20 bg-primary/[0.03] p-2.5">
          <input type="hidden" name="deal_id" value={deal.id} />
          <p className="font-label text-[10px] uppercase tracking-wider text-text-secondary">
            Gerar mensalidades de {brl(mrr)}/mês
          </p>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                name="months"
                type="number"
                min={1}
                max={60}
                defaultValue={6}
                required
                className={inputCls + ' w-14 text-center'}
              />
              <span className="font-label text-[11px] text-text-secondary">meses desde</span>
            </div>
            <input name="first_due_date" type="date" required className={inputCls} />
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90">
              Gerar
            </button>
          </div>
        </form>
      ) : valor > 0 ? (
        <SplitInstallments dealId={deal.id} valor={valor} />
      ) : null}

      {deal.installments.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1">
          {deal.installments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-text-secondary">
                {p.description ?? 'Parcela'} <span className="text-text-muted">· {fmtDate(p.due_date)} · {brl(p.amount)}</span>
              </span>
              <form action={deleteDealInstallment}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="shrink-0 font-label text-[10px] text-text-muted underline decoration-dotted transition hover:text-danger">
                  remover
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* Ajuste manual (opcional), para casos fora do padrão. */}
      <details className="group">
        <summary className="cursor-pointer list-none font-label text-[10px] uppercase tracking-wider text-text-muted transition-colors hover:text-text-secondary">
          + adicionar parcela manual
        </summary>
        <form action={addDealInstallment} className="mt-2 flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-2.5">
          <input type="hidden" name="deal_id" value={deal.id} />
          <input name="description" className={inputCls} placeholder="Descrição — ex: Entrada" />
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input name="amount" inputMode="decimal" required className={inputCls} placeholder="Valor (R$)" />
            <input name="due_date" type="date" required className={inputCls} />
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90">
              Add
            </button>
          </div>
        </form>
      </details>

    </section>
  );
}
