'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { track, getUtm, saveLeadDraft, getSessionId } from '@/components/analytics';

export type QualificationOption = { id: string; label: string };

export type QualificationSchema = {
  serviceTag: string;
  needs: { title: string; subtitle: string; options: QualificationOption[] };
  identity?: { title?: string; subtitle?: string; companySizes?: string[] };
  context: { title?: string; subtitle?: string; timings: QualificationOption[] };
  whatsappMessage?: string;
  successTitle?: string;
  successBody?: string;
  submitLabel?: string;
};

type Step = 0 | 1 | 2;

interface FormData {
  needs: string[];
  name: string;
  company: string;
  companySize: string;
  email: string;
  whatsapp: string;
  description: string;
  timing: string;
}

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

export function QualificationForm({ schema }: { schema: QualificationSchema }) {
  const t = useTranslations('QualificationForm');
  const defaultSizes = [
    t('sizeOption1'),
    t('sizeOption2'),
    t('sizeOption3'),
    t('sizeOption4'),
  ];

  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [emailTouched, setEmailTouched] = useState(false);
  const [data, setData] = useState<FormData>({
    needs: [],
    name: '',
    company: '',
    companySize: '',
    email: '',
    whatsapp: '',
    description: '',
    timing: '',
  });

  // Funil interno do formulário: marca início e cada etapa alcançada (p/ ver onde desistem).
  // Rótulo da etapa = "Qualificação::<posição>::<nome legível>" para o dashboard mostrar
  // qual formulário e em que etapa a pessoa parou (não só um número).
  const FORM_NAME = 'Qualificação';
  const STEP_NAMES = ['Necessidades', 'Contato', 'Prazo'];
  const formStarted = useRef(false);
  useEffect(() => {
    if (status === 'success') return;
    if (!formStarted.current) {
      formStarted.current = true;
      track({ type: 'form_start', service_tag: schema.serviceTag, label: FORM_NAME });
    }
    track({ type: 'form_step', service_tag: schema.serviceTag, label: `${FORM_NAME}::${step + 1}::${STEP_NAMES[step] ?? String(step + 1)}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Captura progressiva: salva o rascunho conforme a pessoa preenche/escolhe — já a
  // partir da 1ª necessidade marcada, mesmo sem contato. Assim registramos o que o
  // público pede, inclusive de quem desiste antes de se identificar.
  useEffect(() => {
    if (status === 'success') return;
    const hasSomething =
      data.needs.length > 0 ||
      data.name.trim() ||
      data.email.trim() ||
      data.whatsapp.replace(/\D/g, '').length > 0 ||
      !!data.timing ||
      data.description.trim();
    if (!hasSomething) return;
    const id = setTimeout(() => {
      saveLeadDraft({
        service_tag: schema.serviceTag,
        kind: 'qualification',
        name: data.name,
        company: data.company,
        email: data.email,
        whatsapp: data.whatsapp,
        needs: data.needs,
        timing: data.timing,
        description: data.description,
        last_step: STEP_NAMES[step] ?? String(step + 1),
      });
    }, 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, step, status]);

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const toggleNeed = (id: string) =>
    setData((d) => ({
      ...d,
      needs: d.needs.includes(id) ? d.needs.filter((n) => n !== id) : [...d.needs, id],
    }));

  const canContinue =
    (step === 0 && data.needs.length > 0) ||
    (step === 1 && data.name && isValidEmail(data.email) && data.whatsapp.replace(/\D/g, '').length >= 10) ||
    (step === 2 && data.timing);

  const submit = async () => {
    setStatus('submitting');
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTag: schema.serviceTag,
          kind: 'qualification',
          data,
          utm: getUtm(),
          session_id: getSessionId(),
        }),
      });
    } catch {
      // MVP: fire-and-forget
    }
    track({ type: 'form_submit', service_tag: schema.serviceTag, label: FORM_NAME });
    saveLeadDraft({ submitted: true });
    setStatus('success');
  };

  if (status === 'success') {
    const needLabels = data.needs
      .map((id) => schema.needs.options.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    const timingLabel = schema.context.timings.find((tt) => tt.id === data.timing)?.label;
    const name = data.name.trim();
    const company = data.company.trim();
    const greeting = name
      ? (company
          ? t('waGreetingWithCompany', { name, company })
          : t('waGreeting', { name }))
      : '';
    const interestLine = needLabels.length ? `*${t('waInterestLabel')}:* ${needLabels.join(', ')}` : null;
    const timingLine = timingLabel ? `*${t('waTimingLabel')}:* ${timingLabel}` : null;
    const personalized = [
      greeting,
      '',
      t('waFormFilled'),
      '',
      interestLine,
      timingLine,
    ]
      .filter((l) => l !== null && l !== '')
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    const message =
      personalized.trim().length > 0
        ? personalized
        : (schema.whatsappMessage ?? t('waFallbackMessage'));
    return (
      <div
        className="rounded-2xl border border-black/[0.08] p-8 lg:p-10 text-center"
        style={{ background: 'hsl(55 100% 97%)' }}
      >
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-primary" strokeWidth={2.5} />
        </div>
        <h3 className="text-[1.5rem] lg:text-[1.75rem] font-semibold tracking-tight text-text-primary mb-3">
          {schema.successTitle ?? t('successTitleDefault')}
        </h3>
        <p className="text-[15px] text-text-secondary leading-relaxed mb-6 max-w-md mx-auto">
          {schema.successBody ?? (
            <>
              {t('successBodyBefore')}
              <strong>{t('successBodyBold')}</strong>
              {t('successBodyAfter')}
            </>
          )}
        </p>
        <a
          href={`https://wa.me/5511951381254?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="whatsapp-sucesso"
          data-service={schema.serviceTag}
          className="font-bricolage inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          {t('successCta')}
        </a>
      </div>
    );
  }

  const sizes = schema.identity?.companySizes ?? defaultSizes;

  return (
    <div
      className="rounded-2xl border border-black/[0.08] overflow-hidden"
      style={{ background: 'hsl(55 100% 97%)' }}
    >
      {/* Progress bar */}
      <div className="px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            {t('stepLabel', { step: step + 1, total: 3 })}
          </span>
          <span className="font-mono text-[10px] text-text-dim">
            ❯ {schema.serviceTag}.sh
          </span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full"
              style={{
                background: i <= step ? '#3B82F6' : 'rgba(25,25,24,0.10)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 lg:p-8">
        {step === 0 && (
          <div>
            <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">
              {schema.needs.title}
            </h3>
            <p className="text-[14px] text-text-secondary mb-6">{schema.needs.subtitle}</p>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {schema.needs.options.map((n) => {
                const active = data.needs.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleNeed(n.id)}
                    className="text-left px-4 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: active ? 'rgba(59,130,246,0.08)' : 'rgba(25,25,24,0.03)',
                      border: active ? '1.5px solid rgba(59,130,246,0.5)' : '1.5px solid rgba(25,25,24,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all"
                        style={{
                          background: active ? '#3B82F6' : 'transparent',
                          border: active ? '1px solid #3B82F6' : '1px solid rgba(25,25,24,0.25)',
                        }}
                      >
                        {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-[13px] text-text-primary">{n.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">
              {schema.identity?.title ?? t('identityTitle')}
            </h3>
            <p className="text-[14px] text-text-secondary mb-6">
              {schema.identity?.subtitle ?? t('identitySubtitle')}
            </p>

            <div className="space-y-4">
              <Field label={t('fieldName')}>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={t('fieldNamePlaceholder')}
                  className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
                  style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label={t('fieldCompany')}>
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder={t('fieldCompanyPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
                    style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                  />
                </Field>

                <Field label={t('fieldSize')}>
                  <select
                    value={data.companySize}
                    onChange={(e) => update('companySize', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                    style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                  >
                    <option value="">{t('fieldSizeSelect')}</option>
                    {sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label={t('fieldEmail')}>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => update('email', e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder={t('fieldEmailPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none transition-colors"
                    style={{
                      border: emailTouched && data.email && !isValidEmail(data.email)
                        ? '1px solid rgba(239,68,68,0.6)'
                        : '1px solid rgba(25,25,24,0.10)',
                    }}
                  />
                  {emailTouched && data.email && !isValidEmail(data.email) && (
                    <span className="font-mono text-[10px] text-red-500 mt-1 block">{t('fieldEmailInvalid')}</span>
                  )}
                </Field>

                <Field label={t('fieldWhatsapp')}>
                  <input
                    type="tel"
                    value={data.whatsapp}
                    onChange={(e) => update('whatsapp', formatWhatsApp(e.target.value))}
                    placeholder={t('fieldWhatsappPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
                    style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">
              {schema.context.title ?? t('contextTitleDefault')}
            </h3>
            <p className="text-[14px] text-text-secondary mb-6">
              {schema.context.subtitle ?? t('contextSubtitleDefault')}
            </p>

            <div className="space-y-4">
              <Field label={t('contextTimingLabel')}>
                <select
                  value={data.timing}
                  onChange={(e) => update('timing', e.target.value)}
                  className="w-full max-w-sm px-4 py-3 rounded-xl text-[14px] bg-white/70 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                  style={{ border: '1.5px solid rgba(25,25,24,0.12)' }}
                >
                  <option value="" disabled>{t('fieldSizeSelect')}</option>
                  {schema.context.timings.map((tt) => (
                    <option key={tt.id} value={tt.id}>{tt.label}</option>
                  ))}
                </select>
              </Field>

              <Field label={t('contextDescriptionLabel')}>
                <textarea
                  value={data.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  placeholder={t('contextDescriptionPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors leading-relaxed resize-none"
                  style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Consent line on final step */}
      {step === 2 && (
        <div className="px-6 lg:px-8 pb-4 -mt-2">
          <p className="font-mono text-[10px] text-text-dim leading-relaxed">
            {t('consentBefore')}
            <a href="/politica-privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
              {t('consentLink')}
            </a>
            {t('consentAfter')}
          </p>
        </div>
      )}

      {/* Footer with navigation */}
      <div className="flex items-center justify-between gap-3 px-6 lg:px-8 py-5 border-t border-black/[0.06] bg-black/[0.02]">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
          disabled={step === 0}
          className="font-mono text-[12px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('navBack')}
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(2, s + 1) as Step)}
            disabled={!canContinue}
            className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            {t('navContinue')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canContinue || status === 'submitting'}
            className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('navSubmitting')}
              </>
            ) : (
              <>
                {schema.submitLabel ?? t('navSubmit')}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
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
