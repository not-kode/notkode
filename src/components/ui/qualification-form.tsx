'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle } from 'lucide-react';

// ── Schema ────────────────────────────────────────────────────────────────

export type QualificationOption = { id: string; label: string };

export type QualificationSchema = {
  /** identifier sent with the lead payload (e.g. 'sistemas-ia', 'parcerias') */
  serviceTag: string;
  /** Step 1 — multi-select needs/goals */
  needs: { title: string; subtitle: string; options: QualificationOption[] };
  /** Step 2 — identity (always: name + email + whatsapp; company optional) */
  identity?: { title?: string; subtitle?: string; companySizes?: string[] };
  /** Step 3 — context (timing + description) */
  context: { title?: string; subtitle?: string; timings: QualificationOption[] };
  /** WhatsApp message after submit */
  whatsappMessage?: string;
  /** copy on success screen */
  successTitle?: string;
  successBody?: string;
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

const DEFAULT_SIZES = ['1–10 pessoas', '11–50 pessoas', '51–200 pessoas', '200+ pessoas'];

export function QualificationForm({ schema }: { schema: QualificationSchema }) {
  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
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

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const toggleNeed = (id: string) =>
    setData((d) => ({
      ...d,
      needs: d.needs.includes(id) ? d.needs.filter((n) => n !== id) : [...d.needs, id],
    }));

  const canContinue =
    (step === 0 && data.needs.length > 0) ||
    (step === 1 && data.name && data.email && data.whatsapp) ||
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
        }),
      });
    } catch {
      // MVP: fire-and-forget
    }
    // eslint-disable-next-line no-console
    console.log('[qualification-form]', schema.serviceTag, data);
    setStatus('success');
  };

  // Success screen
  if (status === 'success') {
    const message =
      schema.whatsappMessage ?? 'Acabei de preencher o formulário no site, vim para acelerar o contato.';
    return (
      <div
        className="rounded-2xl border border-black/[0.08] p-8 lg:p-10 text-center"
        style={{ background: 'hsl(55 100% 97%)' }}
      >
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-primary" strokeWidth={2.5} />
        </div>
        <h3 className="text-[1.5rem] lg:text-[1.75rem] font-semibold tracking-tight text-text-primary mb-3">
          {schema.successTitle ?? 'Recebemos sua mensagem.'}
        </h3>
        <p className="text-[15px] text-text-secondary leading-relaxed mb-6 max-w-md mx-auto">
          {schema.successBody ??
            <>Em até <strong>24 horas</strong> alguém do nosso time entra em contato pelo e-mail e WhatsApp para agendar um diagnóstico gratuito de 30 minutos.</>}
        </p>
        <a
          href={`https://wa.me/5511951381254?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bricolage inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          Falar agora no WhatsApp
        </a>
      </div>
    );
  }

  const sizes = schema.identity?.companySizes ?? DEFAULT_SIZES;

  return (
    <div
      className="rounded-2xl border border-black/[0.08] overflow-hidden"
      style={{ background: 'hsl(55 100% 97%)' }}
    >
      {/* Progress bar */}
      <div className="px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            Etapa {step + 1} de 3
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
              {schema.identity?.title ?? 'Quem é você?'}
            </h3>
            <p className="text-[14px] text-text-secondary mb-6">
              {schema.identity?.subtitle ?? 'Só o essencial pra a gente entrar em contato.'}
            </p>

            <div className="space-y-4">
              <Field label="Seu nome">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Como gostaria de ser chamado?"
                  className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
                  style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Empresa">
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder="Nome da empresa"
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
                    style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                  />
                </Field>

                <Field label="Tamanho">
                  <select
                    value={data.companySize}
                    onChange={(e) => update('companySize', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                    style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                  >
                    <option value="">Selecione</option>
                    {sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="E-mail">
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
                    style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                  />
                </Field>

                <Field label="WhatsApp">
                  <input
                    type="tel"
                    value={data.whatsapp}
                    onChange={(e) => update('whatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
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
              {schema.context.title ?? 'Contexto do projeto.'}
            </h3>
            <p className="text-[14px] text-text-secondary mb-6">
              {schema.context.subtitle ?? 'Quanto mais detalhes, melhor preparamos a conversa.'}
            </p>

            <div className="space-y-4">
              <Field label="Quando você quer começar?">
                <div className="grid sm:grid-cols-2 gap-2">
                  {schema.context.timings.map((t) => {
                    const active = data.timing === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => update('timing', t.id)}
                        className="text-left px-4 py-2.5 rounded-lg text-[13px] transition-all"
                        style={{
                          background: active ? 'rgba(59,130,246,0.08)' : 'rgba(25,25,24,0.03)',
                          border: active ? '1.5px solid rgba(59,130,246,0.5)' : '1.5px solid rgba(25,25,24,0.08)',
                          color: active ? '#191918' : 'rgba(25,25,24,0.65)',
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Conte um pouco do seu desafio (opcional)">
                <textarea
                  value={data.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  placeholder="Ex: hoje uso planilhas + WhatsApp + Trello, mas não dá conta de organizar 200 pedidos por mês..."
                  className="w-full px-4 py-3 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors leading-relaxed resize-none"
                  style={{ border: '1px solid rgba(25,25,24,0.10)' }}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Footer with navigation */}
      <div className="flex items-center justify-between gap-3 px-6 lg:px-8 py-5 border-t border-black/[0.06] bg-black/[0.02]">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
          disabled={step === 0}
          className="font-mono text-[12px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(2, s + 1) as Step)}
            disabled={!canContinue}
            className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            Continuar
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
                Enviando…
              </>
            ) : (
              <>
                Enviar diagnóstico
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
