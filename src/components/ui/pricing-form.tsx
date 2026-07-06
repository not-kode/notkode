'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { track, getUtm } from '@/components/analytics';

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
  /** receives current selection and returns [min, max] in BRL */
  calc: (selection: PricingSelection) => [number, number];
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

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

function formatWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
  rangeLabel: string;
  closeQuestion: string;
};

function buildWhatsAppMessage(
  schema: PricingSchema,
  summary: SummaryRow[],
  min: number,
  max: number,
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
    `${wa.rangeLabel} ${fmt(min)} – ${fmt(max)}`,
    '',
    wa.closeQuestion,
  ];
  return lines.join('\n');
}

// ── Main component ────────────────────────────────────────────────────────

export function PricingForm({ schema }: { schema: PricingSchema }) {
  const t = useTranslations('PricingForm');
  const totalSteps = schema.fields.length + 1; // +1 = reveal/identify
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selection, setSelection] = useState<PricingSelection>(() => buildInitialSelection(schema));
  const [name, setName]         = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail]       = useState('');
  const [notes, setNotes]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'submitting' | 'success'>('idle');

  const isRevealStep = step === schema.fields.length;
  const currentField = !isRevealStep ? schema.fields[step] : null;
  const [min, max] = useMemo(() => schema.calc(selection), [selection, schema]);

  // Funil interno do formulário: marca início e cada etapa alcançada (p/ ver onde desistem).
  const formStarted = useRef(false);
  useEffect(() => {
    if (status === 'success') return;
    if (!formStarted.current) {
      formStarted.current = true;
      track({ type: 'form_start', service_tag: schema.serviceTag });
    }
    track({ type: 'form_step', service_tag: schema.serviceTag, label: String(step + 1) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const setSingle = (fieldId: string, value: string) =>
    setSelection((prev) => ({ ...prev, [fieldId]: value }));

  const toggleMulti = (fieldId: string, value: string) =>
    setSelection((prev) => {
      const current = (prev[fieldId] as string[]) ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [fieldId]: next };
    });

  const canAdvance = currentField
    ? isFieldComplete(currentField, selection[currentField.id])
    : Boolean(name && whatsapp.replace(/\D/g, '').length >= 10 && isValidEmail(email) && status !== 'submitting');

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
      estimatedRange: [min, max],
      lead: { name, whatsapp, email, notes },
      utm: getUtm(),
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
    track({ type: 'form_submit', service_tag: schema.serviceTag });
    setStatus('success');
  };

  // ── Success screen ──
  if (status === 'success') {
    const copy = schema.copy ?? {};
    const summary = summarizeSelection(schema, selection);
    const waMessage = buildWhatsAppMessage(schema, summary, min, max, name, {
      greetingWithName: (n, tag) => t('waGreetingWithName', { name: n, tag }),
      greetingNoName: (tag) => t('waGreetingNoName', { tag }),
      scopeLabel: t('waScopeLabel'),
      rangeLabel: t('waRangeLabel'),
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

        {/* Faixa de preço destacada */}
        <div className="px-6 lg:px-10 pb-6">
          <div
            className="rounded-2xl border border-primary/30 px-6 py-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">
              {t('investmentLabel')}
            </p>
            <p className="font-bricolage text-[1.75rem] md:text-[2.25rem] font-bold text-text-primary leading-tight tracking-tight">
              {fmt(min)} <span className="text-text-muted font-normal">–</span> {fmt(max)}
            </p>
          </div>
        </div>

        {/* Resumo das escolhas */}
        {summary.length > 0 && (
          <div className="px-6 lg:px-10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim text-center mb-4">
              {t('scopeLabel')}
            </p>
            <ul className="space-y-2.5 max-w-md mx-auto">
              {summary.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px]">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <span className="text-text-dim">{s.label}: </span>
                    <span className="text-text-primary font-medium">{s.valueLabels.join(', ')}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

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
    <div
      className="rounded-2xl border border-black/[0.08] overflow-hidden max-w-3xl mx-auto"
      style={{ background: 'hsl(55 100% 97%)' }}
    >
      {/* ── Progress bar ── */}
      <div className="px-6 lg:px-10 pt-7 pb-3">
        <div className="flex items-center justify-between mb-3 gap-3">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            {t('stepLabel', { step: step + 1, total: totalSteps })}
          </span>
          <LiveEstimatePill min={min} max={max} visible={step > 0 && !isRevealStep} />
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
              min={min}
              max={max}
              name={name}
              whatsapp={whatsapp}
              email={email}
              notes={notes}
              onName={setName}
              onWhats={setWhatsapp}
              onEmail={setEmail}
              onNotes={setNotes}
              title={copy.revealTitle ?? t('revealTitleDefault')}
              subtitle={copy.revealSubtitle ?? t('revealSubtitleDefault')}
            />
          )}
        </div>
      </div>

      {/* ── Consent line (visible only on reveal step) ── */}
      {isRevealStep && (
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

      {field.type === 'single' ? (
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

function LiveEstimatePill({ min, max, visible }: { min: number; max: number; visible: boolean }) {
  const prevRef = useRef<string>('');
  const current = `${min}-${max}`;
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (prevRef.current && prevRef.current !== current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 320);
      return () => clearTimeout(t);
    }
    prevRef.current = current;
  }, [current, visible]);

  if (!visible) return <span aria-hidden />;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-transform duration-200"
      style={{
        background: 'rgba(59,130,246,0.10)',
        border: '1px solid rgba(59,130,246,0.25)',
        transform: pulse ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <Sparkles className="w-3 h-3 text-primary" strokeWidth={2.2} />
      <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
        estimativa
      </span>
      <span className="font-mono text-[11px] text-text-primary font-semibold">
        {fmt(min)} – {fmt(max)}
      </span>
    </span>
  );
}

function RevealStep({
  schema, selection,
  min, max, name, whatsapp, email, notes,
  onName, onWhats, onEmail, onNotes,
  title, subtitle,
}: {
  schema: PricingSchema;
  selection: PricingSelection;
  min: number; max: number;
  name: string; whatsapp: string; email: string; notes: string;
  onName: (v: string) => void; onWhats: (v: string) => void;
  onEmail: (v: string) => void; onNotes: (v: string) => void;
  title: string; subtitle: string;
}) {
  const t = useTranslations('PricingForm');
  const [emailTouched, setEmailTouched] = useState(false);
  const avg = Math.round(((min + max) / 2) / 100) * 100;
  const inclusions = schema.inclusions?.(selection) ?? [];
  const timeline = schema.timeline?.(selection) ?? [];
  const reportTitle = schema.reportTitle?.(selection) ?? t('reportTitleDefault');
  const protocol = `#NTK-${(Math.abs(hashString(JSON.stringify(selection))) % 9000 + 1000).toString()}`;
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div style={{ animation: 'priceReveal 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}>

      {/* ── Report header strip ── */}
      <div
        className="rounded-t-2xl border border-black/[0.08] border-b-0 px-5 py-3 flex items-center justify-between"
        style={{ background: 'rgba(25,25,24,0.025)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            {t('reportPrefix')}{schema.serviceTag}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-dim">{protocol}</span>
          <span className="font-mono text-[10px] text-text-dim hidden sm:inline">·</span>
          <span className="font-mono text-[10px] text-text-dim hidden sm:inline">{today}</span>
        </div>
      </div>

      {/* ── Hero do valor ── */}
      <div
        className="border border-black/[0.08] border-b-0 px-6 lg:px-10 py-9 lg:py-11 text-center"
        style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.05) 0%, transparent 100%)' }}
      >
        <h3 className="font-bricolage text-[1.5rem] lg:text-[2rem] text-text-primary leading-tight tracking-tight mb-7">
          {reportTitle}
        </h3>
        <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          {title}
        </p>
        <div className="font-bricolage text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] font-bold text-text-primary leading-none tracking-tight">
          {fmt(avg)}
        </div>
        <p className="font-mono text-[11px] text-text-muted mt-3">
          {t('rangeLabel')} {fmt(min)} – {fmt(max)}
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

      {/* ── Cronograma ── */}
      {timeline.length > 0 && (
        <div className="border border-black/[0.08] border-b-0 px-6 lg:px-10 py-7" style={{ background: 'rgba(25,25,24,0.02)' }}>
          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
              {t('timelineHeader')}
            </span>
            <div className="flex-1 h-px bg-black/[0.06]" />
          </div>

          {/* Timeline track (desktop horizontal, mobile vertical) */}
          <div className="hidden sm:grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-3 relative" style={{ gridTemplateColumns: `repeat(${timeline.length}, minmax(0,1fr))` }}>
            <div className="absolute left-2 right-2 top-[7px] h-px bg-primary/25" />
            {timeline.map((p, i) => (
              <div key={i} className="relative">
                <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-[hsl(55_100%_97%)] mb-3 relative z-10" />
                <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">{p.range}</p>
                <p className="font-bricolage text-[14px] font-semibold text-text-primary mb-1 leading-tight">{p.title}</p>
                <p className="text-[12px] text-text-secondary leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile — stacked */}
          <ol className="sm:hidden space-y-4 relative">
            {timeline.map((p, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                  {i < timeline.length - 1 && <div className="flex-1 w-px bg-primary/20 mt-1" />}
                </div>
                <div className="pb-1">
                  <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-0.5">{p.range}</p>
                  <p className="font-bricolage text-[14px] font-semibold text-text-primary mb-0.5 leading-tight">{p.title}</p>
                  <p className="text-[12px] text-text-secondary leading-snug">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Próximo passo: identificação ── */}
      <div className="rounded-b-2xl border border-black/[0.08] px-6 lg:px-10 py-7" style={{ background: 'hsl(55 100% 97%)' }}>
        <div className="flex items-center gap-2 mb-5">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            {t('nextStepHeader')}
          </span>
          <div className="flex-1 h-px bg-black/[0.06]" />
        </div>
        <p className="text-[13px] text-text-secondary mb-5 leading-relaxed max-w-lg">
          {t('nextStepBody')}
        </p>
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
            <Field label={t('fieldWhatsapp')}>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => onWhats(formatWhatsApp(e.target.value))}
                placeholder={t('fieldWhatsappPlaceholder')}
                className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
                style={{ border: '1px solid rgba(25,25,24,0.10)' }}
              />
            </Field>
          </div>
          <Field label={t('fieldEmail')}>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder={t('fieldEmailPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none transition-colors"
              style={{
                border: emailTouched && email && !isValidEmail(email)
                  ? '1px solid rgba(239,68,68,0.6)'
                  : '1px solid rgba(25,25,24,0.10)',
              }}
            />
            {emailTouched && email && !isValidEmail(email) && (
              <span className="font-mono text-[10px] text-red-500 mt-1 block">{t('fieldEmailInvalid')}</span>
            )}
          </Field>
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
    </div>
  );
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
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
