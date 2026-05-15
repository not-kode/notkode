'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, Sparkles } from 'lucide-react';

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

export type PricingSchema = {
  serviceTag: string;
  fields: PricingField[];
  /** receives current selection and returns [min, max] in BRL */
  calc: (selection: PricingSelection) => [number, number];
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

function buildWhatsAppMessage(
  schema: PricingSchema,
  summary: SummaryRow[],
  min: number,
  max: number,
  name: string,
): string {
  const greeting = name
    ? `Olá! Sou ${name}, acabei de preencher o formulário no site Notkode (${schema.serviceTag}).`
    : `Olá! Acabei de preencher o formulário no site Notkode (${schema.serviceTag}).`;
  const lines = [
    greeting,
    '',
    'Meu escopo:',
    ...summary.map((s) => `• ${s.label}: ${s.valueLabels.join(', ')}`),
    '',
    `Faixa estimada: ${fmt(min)} – ${fmt(max)}`,
    '',
    'Podemos seguir com a proposta detalhada?',
  ];
  return lines.join('\n');
}

// ── Main component ────────────────────────────────────────────────────────

export function PricingForm({ schema }: { schema: PricingSchema }) {
  const totalSteps = schema.fields.length + 1; // +1 = reveal/identify
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState<PricingSelection>(() => buildInitialSelection(schema));
  const [name, setName]         = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail]       = useState('');
  const [notes, setNotes]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'submitting' | 'success'>('idle');

  const isRevealStep = step === schema.fields.length;
  const currentField = !isRevealStep ? schema.fields[step] : null;
  const [min, max] = useMemo(() => schema.calc(selection), [selection, schema]);

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
    : Boolean(name && whatsapp && email && status !== 'submitting');

  const submit = async () => {
    if (!canAdvance) return;
    setStatus('submitting');
    const payload = {
      serviceTag: schema.serviceTag,
      selection,
      estimatedRange: [min, max],
      lead: { name, whatsapp, email, notes },
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
    // eslint-disable-next-line no-console
    console.log('[pricing-form]', payload);
    setStatus('success');
  };

  // ── Success screen ──
  if (status === 'success') {
    const copy = schema.copy ?? {};
    const summary = summarizeSelection(schema, selection);
    const waMessage = buildWhatsAppMessage(schema, summary, min, max, name);
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
            {copy.successTitle ?? 'Sua proposta tá pronta.'}
          </h3>
          <p className="text-[14px] text-text-secondary leading-relaxed max-w-md mx-auto">
            {name ? `${name}, ` : ''}sua faixa está estimada abaixo. Próximo passo é confirmar tudo no WhatsApp.
          </p>
        </div>

        {/* Faixa de preço destacada */}
        <div className="px-6 lg:px-10 pb-6">
          <div
            className="rounded-2xl border border-primary/30 px-6 py-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">
              Investimento estimado
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
              Seu escopo
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
            O que vem agora
          </p>
          <ol className="space-y-2 max-w-md mx-auto">
            {[
              'Você abre o WhatsApp com o resumo já preenchido.',
              'A gente confirma o escopo numa conversa de 15 minutos.',
              'Em até 24h você recebe a proposta detalhada com prazo final.',
            ].map((step, i) => (
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
            className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            Continuar pelo WhatsApp
          </a>
          <p className="text-[12px] text-text-muted mt-3">
            Mensagem com seu escopo já pré-preenchida.
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
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            Etapa {step + 1} de {totalSteps}
          </span>
          <span className="font-mono text-[10px] text-text-dim">
            ❯ {schema.serviceTag}.sh
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
      <div className="px-6 lg:px-10 py-8 lg:py-10 min-h-[340px]">
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
            title={copy.revealTitle ?? 'Seu investimento estimado'}
            subtitle={
              copy.revealSubtitle ??
              'Faixa preliminar baseada nas suas escolhas. Para receber a proposta detalhada, deixa seu contato.'
            }
            eyebrow={copy.eyebrow}
          />
        )}
      </div>

      {/* ── Footer nav ── */}
      <div className="flex items-center justify-between gap-3 px-6 lg:px-10 py-5 border-t border-black/[0.06] bg-black/[0.02]">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-mono text-[12px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
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
                Enviando…
              </>
            ) : (
              <>
                {copy.submitLabel ?? 'Receber proposta'}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
            disabled={!canAdvance}
            className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            Continuar
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

function RevealStep({
  min, max, name, whatsapp, email, notes,
  onName, onWhats, onEmail, onNotes,
  title, subtitle, eyebrow,
}: {
  min: number; max: number;
  name: string; whatsapp: string; email: string; notes: string;
  onName: (v: string) => void; onWhats: (v: string) => void;
  onEmail: (v: string) => void; onNotes: (v: string) => void;
  title: string; subtitle: string;
  eyebrow?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-3">
          {eyebrow}
        </span>
      )}

      {/* Reveal */}
      <div
        className="rounded-2xl border border-primary/30 px-6 py-7 lg:px-8 lg:py-8 mb-7 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02))',
          animation: 'priceReveal 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="inline-flex items-center gap-1.5 mb-3 text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-widest">{title}</span>
        </div>
        <div className="font-bricolage text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] font-bold text-text-primary leading-tight tracking-tight">
          {fmt(min)} <span className="text-text-muted font-normal">–</span> {fmt(max)}
        </div>
        <p className="text-[13px] text-text-muted mt-3 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Identification */}
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Seu nome">
            <input
              type="text"
              value={name}
              onChange={(e) => onName(e.target.value)}
              placeholder="Como te chama?"
              className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
              style={{ border: '1px solid rgba(25,25,24,0.10)' }}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => onWhats(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
              style={{ border: '1px solid rgba(25,25,24,0.10)' }}
            />
          </Field>
        </div>
        <Field label="E-mail">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
            style={{ border: '1px solid rgba(25,25,24,0.10)' }}
          />
        </Field>
        <Field label="Algo a acrescentar? (opcional)">
          <textarea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            rows={2}
            placeholder="Contexto, prazo, links..."
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
