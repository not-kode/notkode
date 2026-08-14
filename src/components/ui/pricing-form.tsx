'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { track, getUtm, saveLeadDraft, getSessionId } from '@/components/analytics';
import { WhatsAppFallback } from '@/components/ui/whatsapp-fallback';
import { useFormView } from '@/components/ui/use-form-view';
import { stepEventLabel, stepLabel } from '@/lib/form-steps';
import { emailValido, formatarWhatsapp, sugestaoDeEmail, whatsappValido } from '@/lib/validacao-contato';
import { alternarEscolha } from '@/lib/pricing-multi';

// ── Schema types ──────────────────────────────────────────────────────────

export type PricingFieldOption = {
  value: string;
  label: string;
  hint?: string;
};

export type PricingField =
  | {
      id: string;
      type: 'single';
      label: string;        // step heading
      hint?: string;        // step subheading
      options: PricingFieldOption[];
      /** optional pre-selection */
      default?: string;
      /** 'dropdown' renders a <select> instead of the button grid. Default 'buttons'. */
      render?: 'buttons' | 'dropdown';
    }
  | {
      id: string;
      type: 'multi';
      label: string;
      hint?: string;
      options: PricingFieldOption[];
      /** optional pre-selection */
      default?: string[];
      /** minimum selections required to advance (default 1) */
      min?: number;
    };

export type PricingSelection = Record<string, string | string[]>;

export type BreakdownItem = {
  /** Short label for the line ("Catálogo médio", "4 integrações", "Prazo rápido") */
  label: string;
  /** How it impacts the total ("× 1.25", "+ R$ 3.600", "base R$ 6k – 14k") */
  impact: string;
  /** Optional: dim the line when impact is zero/neutral */
  muted?: boolean;
};

export type InclusionGroup = {
  /** Group title ("Escopo principal", "Integrações", "Pós go-live") */
  title: string;
  /** Items inside the group */
  items: string[];
};

export type TimelinePhase = {
  /** "Semana 1–2", "Sprint 1" */
  range: string;
  /** "Diagnóstico", "Construção", "Go-live" */
  title: string;
  /** One-line description of what happens in this phase */
  desc: string;
};

export type PricingSchema = {
  serviceTag: string;
  fields: PricingField[];
  /** optional: explain what's pushing the price on the reveal screen */
  breakdown?: (selection: PricingSelection) => BreakdownItem[];
  /** optional: build the "what's included" visual scope from selection */
  inclusions?: (selection: PricingSelection) => InclusionGroup[];
  /** optional: build the project timeline from selection */
  timeline?: (selection: PricingSelection) => TimelinePhase[];
  /** optional: title shown on the reveal screen header (e.g. "Sua loja sob medida") */
  reportTitle?: (selection: PricingSelection) => string;
  copy?: {
    /** small label above the heading on each step (e.g. "Orçamento") */
    eyebrow?: string;
    /** title on the reveal step */
    revealTitle?: string;
    /** subtitle on the reveal step */
    revealSubtitle?: string;
    submitLabel?: string;
    successTitle?: string;
    successBody?: string;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────

function buildInitialSelection(schema: PricingSchema): PricingSelection {
  const sel: PricingSelection = {};
  for (const f of schema.fields) {
    if (f.type === 'multi') sel[f.id] = f.default ? [...f.default] : [];
    else sel[f.id] = f.default ?? '';
  }
  return sel;
}

function isFieldComplete(field: PricingField, value: string | string[]): boolean {
  if (field.type === 'single') return typeof value === 'string' && value.length > 0;
  const min = field.min ?? 1;
  return Array.isArray(value) && value.length >= min;
}

type SummaryRow = { label: string; valueLabels: string[] };

function summarizeSelection(schema: PricingSchema, selection: PricingSelection): SummaryRow[] {
  return schema.fields
    .map((field): SummaryRow => {
      const value = selection[field.id];
      if (field.type === 'single') {
        const opt = field.options.find((o) => o.value === value);
        return { label: field.label, valueLabels: opt ? [opt.label] : [] };
      }
      const arr = (value as string[]) ?? [];
      const labels = arr
        .map((v) => field.options.find((o) => o.value === v)?.label)
        .filter((l): l is string => Boolean(l));
      return { label: field.label, valueLabels: labels };
    })
    .filter((s) => s.valueLabels.length > 0);
}

type WaCopy = {
  greetingWithName: (name: string, tag: string) => string;
  greetingNoName: (tag: string) => string;
  scopeLabel: string;
  closeQuestion: string;
};

function buildWhatsAppMessage(
  schema: PricingSchema,
  summary: SummaryRow[],
  name: string,
  wa: WaCopy,
): string {
  const greeting = name
    ? wa.greetingWithName(name, schema.serviceTag)
    : wa.greetingNoName(schema.serviceTag);
  const lines = [
    greeting,
    '',
    wa.scopeLabel,
    ...summary.map((s) => `• ${s.label}: ${s.valueLabels.join(', ')}`),
    '',
    wa.closeQuestion,
  ];
  return lines.join('\n');
}

// ── Main component ────────────────────────────────────────────────────────

export function PricingForm({ schema }: { schema: PricingSchema }) {
  const t = useTranslations('PricingForm');
  // Etapa 0 = identificação, depois as perguntas, e a última é a revelação do preço.
  // O contato vem na frente porque quem desiste no meio já fica gravado com nome e
  // WhatsApp; com ele no fim, 20 dias de tráfego não deixaram um único contato.
  const totalSteps = schema.fields.length + 2; // identificação + campos + revelação
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selection, setSelection] = useState<PricingSelection>(() => buildInitialSelection(schema));
  const [name, setName]         = useState('');
  const [company, setCompany]   = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail]       = useState('');
  const [notes, setNotes]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'submitting' | 'success'>('idle');

  const isIdentityStep = step === 0;
  const isRevealStep = step === totalSteps - 1;
  const currentField = !isIdentityStep && !isRevealStep ? schema.fields[step - 1] : null;

  // Funil interno do formulário: marca início e cada etapa alcançada (p/ ver onde desistem).
  // Rótulo vem de lib/form-steps para o dashboard falar a mesma língua em todos os
  // formulários (rótulo curto, com versão da sequência).
  const FORM_NAME = 'Orçamento';
  const stepId = (i: number) =>
    i === 0 ? 'contato' : i <= schema.fields.length ? schema.fields[i - 1].id : 'proposta';
  const stepName = (i: number) => stepLabel(stepId(i));
  // O funil só começa a contar na PRIMEIRA INTERAÇÃO real (escolher uma opção, digitar
  // algo). Antes isto disparava no mount, então bastava a página carregar para inflar
  // o topo do funil com gente que nem chegou a rolar até o formulário.
  const formStarted = useRef(false);
  // Antes da interação vem o simples "apareceu na tela": é o que diz se o
  // problema é ninguém chegar ao formulário ou ninguém começar a preencher.
  const formRef = useFormView(schema.serviceTag, FORM_NAME);

  const trackStep = (s: number) =>
    track({ type: 'form_step', service_tag: schema.serviceTag, label: stepEventLabel(FORM_NAME, s + 1, stepId(s)) });

  const markInteraction = () => {
    if (formStarted.current || status === 'success') return;
    formStarted.current = true;
    track({ type: 'form_start', service_tag: schema.serviceTag, label: FORM_NAME });
    trackStep(step);
  };

  useEffect(() => {
    if (status === 'success' || !formStarted.current) return;
    trackStep(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Captura progressiva: salva o rascunho já a partir da PRIMEIRA escolha, mesmo sem
  // contato. Antes só gravava quando havia nome/e-mail/WhatsApp, então perdíamos o
  // registro do que o público pede quando desiste antes de se identificar.
  useEffect(() => {
    if (status === 'success') return;
    const picked = summarizeSelection(schema, selection).map((s) => `${s.label}: ${s.valueLabels.join(', ')}`);
    const hasContact = name.trim() || email.trim() || whatsapp.replace(/\D/g, '').length > 0;
    if (!picked.length && !hasContact) return;
    const id = setTimeout(() => {
      saveLeadDraft({
        service_tag: schema.serviceTag,
        kind: 'pricing',
        name,
        company,
        email,
        whatsapp,
        needs: picked,
        description: notes,
        last_step: stepName(step),
      });
    }, 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, company, email, whatsapp, notes, selection, step, status]);

  const setSingle = (fieldId: string, value: string) => {
    markInteraction();
    setSelection((prev) => ({ ...prev, [fieldId]: value }));
  };

  const toggleMulti = (fieldId: string, value: string) => {
    markInteraction();
    setSelection((prev) => {
      const current = (prev[fieldId] as string[]) ?? [];
      return { ...prev, [fieldId]: alternarEscolha(current, value) };
    });
  };

  // Sem campo opcional: nome, empresa, WhatsApp e e-mail para sair da identificação, e
  // a observação preenchida para enviar. Antes bastava UM canal (WhatsApp OU e-mail),
  // mas a /api/lead exige nome, e-mail e WhatsApp e devolvia 400 quando faltava o e-mail,
  // descartando o lead sem que a pessoa percebesse.
  const hasWhatsapp = whatsappValido(whatsapp);
  const hasEmail = emailValido(email);
  const canAdvance = isIdentityStep
    ? Boolean(name.trim() && company.trim() && hasWhatsapp && hasEmail)
    : currentField
      ? isFieldComplete(currentField, selection[currentField.id])
      : status !== 'submitting' && Boolean(notes.trim());

  const goNext = useCallback(() => {
    if (!canAdvance) return;
    setDirection(1);
    setStep((s) => Math.min(totalSteps - 1, s + 1));
  }, [canAdvance, totalSteps]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  // Keyboard navigation: Enter advances (when not in a textarea), arrows move steps
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (e.key === 'Enter') {
        // On the reveal step, only intercept if not inside a textarea (let multiline work)
        if (isRevealStep && target?.tagName === 'TEXTAREA') return;
        if (canAdvance) {
          e.preventDefault();
          if (isRevealStep) submit();
          else goNext();
        }
      } else if (e.key === 'ArrowRight' && !inField) {
        if (canAdvance) goNext();
      } else if (e.key === 'ArrowLeft' && !inField) {
        goBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAdvance, isRevealStep, goNext, goBack]);

  const submit = async () => {
    if (!canAdvance) return;
    setStatus('submitting');
    const payload = {
      serviceTag: schema.serviceTag,
      selection,
      lead: { name, whatsapp, email, notes, company },
      utm: getUtm(),
      session_id: getSessionId(),
    };
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // MVP: fire-and-forget
    }
    track({ type: 'form_submit', service_tag: schema.serviceTag, label: FORM_NAME });
    saveLeadDraft({ submitted: true });
    setStatus('success');
  };

  // ── Success screen ──
  if (status === 'success') {
    const copy = schema.copy ?? {};
    const summary = summarizeSelection(schema, selection);
    const waMessage = buildWhatsAppMessage(schema, summary, name, {
      greetingWithName: (n, tag) => t('waGreetingWithName', { name: n, tag }),
      greetingNoName: (tag) => t('waGreetingNoName', { tag }),
      scopeLabel: t('waScopeLabel'),
      closeQuestion: t('waCloseQuestion'),
    });
    const waUrl = `https://wa.me/5511951381254?text=${encodeURIComponent(waMessage)}`;

    return (
      <div
        className="rounded-2xl border border-black/[0.08] overflow-hidden max-w-2xl mx-auto"
        style={{ background: 'hsl(55 100% 97%)' }}
      >
        {/* Header centralizado */}
        <div className="px-6 lg:px-10 pt-10 pb-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="text-[1.5rem] lg:text-[1.75rem] font-semibold tracking-tight text-text-primary mb-2">
            {copy.successTitle ?? t('successTitleDefault')}
          </h3>
          <p className="text-[14px] text-text-secondary leading-relaxed max-w-md mx-auto">
            {name ? t('successBodyWithName', { name }) : t('successBodyNoName')}
          </p>
        </div>

        {/* Próximos passos */}
        <div className="px-6 lg:px-10 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim text-center mb-4">
            {t('nextStepsLabel')}
          </p>
          <ol className="space-y-2 max-w-md mx-auto">
            {[t('nextStep1'), t('nextStep2'), t('nextStep3')].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-text-secondary leading-relaxed">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center font-mono text-[10px] text-primary mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA WhatsApp */}
        <div className="px-6 lg:px-10 pb-10 pt-2 text-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="whatsapp-sucesso"
            data-service={schema.serviceTag}
            className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            {t('waCta')}
          </a>
          <p className="text-[12px] text-text-muted mt-3">
            {t('waCtaHint')}
          </p>
        </div>
      </div>
    );
  }

  const copy = schema.copy ?? {};

  return (
    <div className="max-w-3xl mx-auto">
    <div
      ref={formRef}
      className="rounded-2xl border border-black/[0.08] overflow-hidden"
      style={{ background: 'hsl(55 100% 97%)' }}
    >
      {/* ── Progress bar ── */}
      <div className="px-6 lg:px-10 pt-7 pb-3">
        <div className="flex items-center justify-between mb-3 gap-3">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            {t('stepLabel', { step: step + 1, total: totalSteps })}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-colors duration-300"
              style={{ background: i <= step ? '#3B82F6' : 'rgba(25,25,24,0.10)' }}
            />
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="px-6 lg:px-10 py-8 lg:py-10 min-h-[340px] overflow-hidden">
        <div
          key={step}
          style={{
            animation: `pf-slide-${direction > 0 ? 'in-right' : 'in-left'} 320ms cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          {isIdentityStep && (
            <IdentityStep
              name={name}
              company={company}
              whatsapp={whatsapp}
              email={email}
              onName={setName}
              onCompany={setCompany}
              onWhats={setWhatsapp}
              onEmail={setEmail}
              eyebrow={copy.eyebrow}
            />
          )}

          {currentField && (
            <FieldStep
              field={currentField}
              value={selection[currentField.id]}
              onSingle={(v) => setSingle(currentField.id, v)}
              onToggle={(v) => toggleMulti(currentField.id, v)}
              eyebrow={copy.eyebrow}
            />
          )}

          {isRevealStep && (
            <RevealStep
              schema={schema}
              selection={selection}
              name={name}
              notes={notes}
              onNotes={setNotes}
              title={copy.revealTitle ?? t('revealTitleDefault')}
              subtitle={copy.revealSubtitle ?? t('revealSubtitleDefault')}
            />
          )}
        </div>
      </div>

      {/* ── Consentimento: onde a pessoa entrega o dado e onde ela envia ── */}
      {(isIdentityStep || isRevealStep) && (
        <div className="px-6 lg:px-10 pb-4 -mt-2">
          <p className="font-mono text-[10px] text-text-dim leading-relaxed">
            {t('consentBefore')}
            <a href="/politica-privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
              {t('consentLink')}
            </a>
            {t('consentAfter')}
          </p>
        </div>
      )}

      {/* ── Footer nav ── */}
      <div className="flex items-center justify-between gap-3 px-6 lg:px-10 py-5 border-t border-black/[0.06] bg-black/[0.02]">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="font-mono text-[12px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('navBack')}
        </button>

        {isRevealStep ? (
          <button
            onClick={submit}
            disabled={!canAdvance}
            className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('navSubmitting')}
              </>
            ) : (
              <>
                {copy.submitLabel ?? t('navSubmitDefault')}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canAdvance}
            className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            {t('navContinue')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
    <WhatsAppFallback serviceTag={schema.serviceTag} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function FieldStep({
  field, value, onSingle, onToggle, eyebrow,
}: {
  field: PricingField;
  value: string | string[];
  onSingle: (v: string) => void;
  onToggle: (v: string) => void;
  eyebrow?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-3">
          {eyebrow}
        </span>
      )}
      <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">
        {field.label}
      </h3>
      {field.hint && (
        <p className="text-[14px] text-text-secondary leading-relaxed mb-7">{field.hint}</p>
      )}

      {field.type === 'single' && field.render === 'dropdown' ? (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onSingle(e.target.value)}
          className="w-full max-w-sm px-4 py-3 rounded-xl text-[14px] bg-white/70 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          style={{ border: '1.5px solid rgba(25,25,24,0.12)' }}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : field.type === 'single' ? (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {field.options.map((opt) => {
            const active = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSingle(opt.value)}
                className="text-left px-4 py-3.5 rounded-xl transition-all duration-150"
                style={{
                  background: active ? 'rgba(59,130,246,0.08)' : 'rgba(25,25,24,0.03)',
                  border: active ? '1.5px solid rgba(59,130,246,0.5)' : '1.5px solid rgba(25,25,24,0.08)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 mt-0.5 transition-all"
                    style={{
                      background: active ? '#3B82F6' : 'transparent',
                      border: active ? '1px solid #3B82F6' : '1px solid rgba(25,25,24,0.25)',
                      boxShadow: active ? 'inset 0 0 0 3px hsl(55 100% 97%)' : 'none',
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-[14px] text-text-primary font-medium">{opt.label}</div>
                    {opt.hint && <div className="text-[12px] text-text-muted mt-0.5">{opt.hint}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {field.options.map((opt) => {
            const active = Array.isArray(value) && value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggle(opt.value)}
                className="text-left px-4 py-3.5 rounded-xl transition-all duration-150"
                style={{
                  background: active ? 'rgba(59,130,246,0.08)' : 'rgba(25,25,24,0.03)',
                  border: active ? '1.5px solid rgba(59,130,246,0.5)' : '1.5px solid rgba(25,25,24,0.08)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center transition-all"
                    style={{
                      background: active ? '#3B82F6' : 'transparent',
                      border: active ? '1px solid #3B82F6' : '1px solid rgba(25,25,24,0.25)',
                    }}
                  >
                    {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] text-text-primary font-medium">{opt.label}</div>
                    {opt.hint && <div className="text-[12px] text-text-muted mt-0.5">{opt.hint}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Primeira etapa: quem é a pessoa. Fica antes das perguntas porque o rascunho
 * (lead_drafts) já nasce com nome e telefone, então quem some no meio do caminho
 * continua sendo alguém para a gente ligar.
 */
function IdentityStep({
  name, company, whatsapp, email,
  onName, onCompany, onWhats, onEmail, eyebrow,
}: {
  name: string; company: string; whatsapp: string; email: string;
  onName: (v: string) => void; onCompany: (v: string) => void;
  onWhats: (v: string) => void; onEmail: (v: string) => void;
  eyebrow?: string;
}) {
  const t = useTranslations('PricingForm');
  const [emailTouched, setEmailTouched] = useState(false);
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const emailOk = emailValido(email);
  const whatsappOk = whatsappValido(whatsapp);
  const emailSugerido = sugestaoDeEmail(email);

  return (
    <div>
      {eyebrow && (
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-3">
          {eyebrow}
        </span>
      )}
      <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">
        {t('identifyTitle')}
      </h3>
      <p className="text-[14px] text-text-secondary leading-relaxed mb-7">{t('identifySubtitle')}</p>

      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t('fieldName')}>
            <input
              type="text"
              value={name}
              onChange={(e) => onName(e.target.value)}
              placeholder={t('fieldNamePlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
              style={{ border: '1px solid rgba(25,25,24,0.10)' }}
            />
          </Field>
          <Field label={t('fieldCompany')}>
            <input
              type="text"
              value={company}
              onChange={(e) => onCompany(e.target.value)}
              placeholder={t('fieldCompanyPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
              style={{ border: '1px solid rgba(25,25,24,0.10)' }}
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t('fieldWhatsapp')}>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => onWhats(formatarWhatsapp(e.target.value))}
              onBlur={() => setWhatsappTouched(true)}
              placeholder={t('fieldWhatsappPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none transition-colors"
              style={{
                border: whatsappTouched && whatsapp && !whatsappOk
                  ? '1px solid rgba(239,68,68,0.6)'
                  : '1px solid rgba(25,25,24,0.10)',
              }}
            />
            {whatsappTouched && whatsapp && !whatsappOk && (
              <span className="font-mono text-[10px] text-red-500 mt-1 block">{t('fieldWhatsappInvalid')}</span>
            )}
          </Field>
          <Field label={t('fieldEmail')}>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder={t('fieldEmailPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none transition-colors"
              style={{
                border: emailTouched && email && !emailOk
                  ? '1px solid rgba(239,68,68,0.6)'
                  : '1px solid rgba(25,25,24,0.10)',
              }}
            />
            {emailTouched && email && !emailOk && (
              <span className="font-mono text-[10px] text-red-500 mt-1 block">{t('fieldEmailInvalid')}</span>
            )}
            {/* Domínio com cara de erro de digitação: sugere, sem bloquear. */}
            {emailTouched && emailOk && emailSugerido && (
              <button
                type="button"
                onClick={() => onEmail(emailSugerido)}
                className="font-mono text-[10px] text-primary mt-1 block underline"
              >
                {t('fieldEmailSuggestion', { email: emailSugerido })}
              </button>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
}

function RevealStep({
  schema, selection,
  name, notes, onNotes,
  title, subtitle,
}: {
  schema: PricingSchema;
  selection: PricingSelection;
  name: string; notes: string;
  onNotes: (v: string) => void;
  title: string; subtitle: string;
}) {
  const t = useTranslations('PricingForm');
  const inclusions = schema.inclusions?.(selection) ?? [];
  const reportTitle = schema.reportTitle?.(selection) ?? t('reportTitleDefault');

  return (
    <div style={{ animation: 'priceReveal 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}>

      {/* ── Abertura: o que a pessoa pediu. Sem valor: preço é conversa, não formulário. ── */}
      <div
        className="rounded-t-2xl border border-black/[0.08] border-b-0 px-6 lg:px-10 py-9 lg:py-11 text-center"
        style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.05) 0%, transparent 100%)' }}
      >
        <h3 className="font-bricolage text-[1.5rem] lg:text-[2rem] text-text-primary leading-tight tracking-tight mb-7">
          {reportTitle}
        </h3>
        <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          {title}
        </p>
        <p className="text-[12px] text-text-muted mt-4 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* ── Escopo ── */}
      {inclusions.length > 0 && (
        <div className="border border-black/[0.08] border-b-0 px-6 lg:px-10 py-7" style={{ background: 'hsl(55 100% 97%)' }}>
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
              {t('inclusionsHeader')}
            </span>
            <div className="flex-1 h-px bg-black/[0.06]" />
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {inclusions.map((group, gi) => (
              <div key={gi}>
                <p className="font-bricolage text-[14px] font-semibold text-text-primary mb-2.5">
                  {group.title}
                </p>
                <ul className="space-y-1.5">
                  {group.items.map((it, ii) => (
                    <li key={ii} className="flex items-start gap-2 text-[13px] text-text-secondary leading-snug">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Próximo passo: a pessoa já se identificou na primeira etapa ── */}
      <div className="rounded-b-2xl border border-black/[0.08] px-6 lg:px-10 py-7" style={{ background: 'hsl(55 100% 97%)' }}>
        <div className="flex items-center gap-2 mb-5">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            {t('nextStepHeader')}
          </span>
          <div className="flex-1 h-px bg-black/[0.06]" />
        </div>
        <p className="text-[13px] text-text-secondary mb-5 leading-relaxed max-w-lg">
          {name ? t('nextStepBodyWithName', { name }) : t('nextStepBody')}
        </p>
        <Field label={t('fieldNotes')}>
          <textarea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            rows={2}
            placeholder={t('fieldNotesPlaceholder')}
            className="w-full px-4 py-3 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors leading-relaxed resize-none"
            style={{ border: '1px solid rgba(25,25,24,0.10)' }}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
