'use client';

import { useMemo, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { saveDraft, submitBriefing } from './actions';
import {
  ONBOARDING_SECTIONS,
  ONBOARDING_VERSION,
  ACCESS_EMAIL,
  isQuestionVisible,
  type OnboardingQuestion,
} from '@/lib/onboarding-schema';

type Context = { cliente: string; produto: string; escopo: string };
type Answers = Record<string, string | string[]>;

const TOTAL = ONBOARDING_SECTIONS.length;

export function OnboardingForm({
  token,
  context,
  initialAnswers = {},
  initialStatus = 'rascunho',
}: {
  token: string;
  context: Context;
  initialAnswers?: Answers;
  initialStatus?: 'rascunho' | 'enviado';
}) {
  // step 0 = boas-vindas · 1..TOTAL = seções · TOTAL+1 = concluído
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  void initialStatus; // rascunho retomável; envio é idempotente

  const setText = (id: string, v: string) =>
    setAnswers((a) => ({ ...a, [id]: v }));

  // Upload real do anexo → grava o path retornado em answers[id].
  const onFile = async (id: string, file: File | undefined) => {
    if (!file) return;
    setUploading(id);
    try {
      const fd = new FormData();
      fd.append('token', token);
      fd.append('file', file);
      const res = await fetch('/api/onboarding/upload', { method: 'POST', body: fd });
      const json = await res.json();
      setText(id, res.ok ? json.name : '');
      if (!res.ok) console.error('[onboarding] upload falhou:', json.error);
    } catch (e) {
      console.error('[onboarding] upload erro:', e);
    } finally {
      setUploading(null);
    }
  };

  const toggleChip = (q: OnboardingQuestion, opt: string) =>
    setAnswers((a) => {
      if (q.multi) {
        const cur = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : [];
        return {
          ...a,
          [q.id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
        };
      }
      return { ...a, [q.id]: a[q.id] === opt ? '' : opt };
    });

  const isChipOn = (q: OnboardingQuestion, opt: string) => {
    const v = answers[q.id];
    return q.multi ? Array.isArray(v) && v.includes(opt) : v === opt;
  };

  const go = (next: number) => {
    setStep(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    // Salva o rascunho a cada avanço (best-effort, não bloqueia a navegação).
    void saveDraft(token, answers);
  };

  const submit = async () => {
    setSending(true);
    const res = await submitBriefing(token, answers);
    setSending(false);
    if (res.ok) go(TOTAL + 1);
    else console.error('[onboarding] submit falhou:', res.error);
  };

  const progress = useMemo(() => {
    if (step === 0) return 6;
    if (step > TOTAL) return 100;
    return Math.round((step / TOTAL) * 100);
  }, [step]);

  const stepLabel =
    step === 0 ? 'Boas-vindas' : step > TOTAL ? 'Concluído' : `Seção ${step} de ${TOTAL}`;

  return (
    <div className="min-h-screen bg-surface-base text-text-primary">
      <StyleBlock />

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border-subtle/50 bg-surface-base/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3.5">
          <Logo variant="horizontal-dark" width={99} height={24} className="h-6 w-auto" priority />

          <p className="text-right text-[12.5px] text-text-secondary">
            Briefing de onboarding · <b className="text-text-primary">{context.cliente}</b>
          </p>
        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-4xl px-6 pt-3">
        <div className="h-1 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-[11px] tracking-wider text-text-muted">{stepLabel}</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Progresso salvo automaticamente
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-[680px] px-6 pb-32 pt-10">
        {step === 0 && <Welcome context={context} onStart={() => go(1)} />}

        {step >= 1 && step <= TOTAL && (
          <Section
            key={step}
            index={step}
            answers={answers}
            setText={setText}
            toggleChip={toggleChip}
            isChipOn={isChipOn}
            onFile={onFile}
            uploading={uploading}
            onPrev={() => go(step - 1)}
            onNext={() => go(step + 1)}
            onSubmit={submit}
            sending={sending}
          />
        )}

        {step > TOTAL && <Done context={context} />}

        <p className="mt-7 text-center font-label text-[10px] uppercase tracking-[0.18em] text-text-muted">
          Feito com cuidado pela Notkode · notkode.com.br
        </p>
      </main>
    </div>
  );
}

// ── Boas-vindas ────────────────────────────────────────────────────────────

function Welcome({ context, onStart }: { context: Context; onStart: () => void }) {
  return (
    <section className="animate-fade-up">
      <span className="font-label text-[11px] uppercase tracking-[0.18em] text-text-muted">
        Notkode · Onboarding de cliente
      </span>
      <h1 className="mt-3.5 text-balance text-[clamp(30px,6vw,44px)] font-semibold leading-[1.05] tracking-[-0.025em]">
        Vamos preparar o lançamento do <span className="text-cyan-700">{context.produto}</span>.
      </h1>
      <p className="mt-3.5 max-w-[54ch] text-[16.5px] text-text-secondary">
        Este briefing nos dá tudo que precisamos para construir o CRM, rodar o tráfego pago e montar
        a landing page do seu novo produto. Leva ~15 minutos e você pode parar e voltar quando quiser
        — salvamos cada resposta automaticamente.
      </p>

      <div className="my-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border-subtle/40 bg-border-subtle/20 max-[560px]:grid-cols-1">
        <Fact k="Cliente" v={context.cliente} />
        <Fact k="Produto" v={context.produto} />
        <Fact k="Escopo" v={context.escopo} />
      </div>

      <span className="font-label text-[11px] uppercase tracking-[0.18em] text-text-muted">
        O que vamos percorrer
      </span>
      <ul className="mt-3 border-y border-border-subtle/40">
        {ONBOARDING_SECTIONS.map((s, i) => (
          <li
            key={s.id}
            className="flex items-center gap-3.5 border-t border-border-subtle/40 py-3 first:border-t-0"
          >
            <span className="min-w-[24px] font-mono text-xs text-text-muted">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="flex-1 text-[15px] font-medium">{s.title}</span>
            {(() => {
              const base = s.questions.filter((q) => !q.showIf).length;
              return (
                <span className="font-mono text-[11px] text-text-muted">
                  {base} {base === 1 ? 'pergunta' : 'perguntas'}
                </span>
              );
            })()}
          </li>
        ))}
      </ul>

      <div className="mt-9 flex items-center justify-between border-t border-border-subtle/40 pt-6">
        <span />
        <button onClick={onStart} className="btn-primary">
          Começar briefing →
        </button>
      </div>
    </section>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-surface-base px-[18px] py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">{k}</div>
      <div className="mt-1 text-[17px] font-semibold tracking-tight">{v}</div>
    </div>
  );
}

function AccessBox() {
  return (
    <div className="accessbox my-8">
      <span className="font-label text-[11px] uppercase tracking-[0.18em] text-[#8B90A8]">
        Como conceder cada acesso
      </span>
      <p className="mt-2.5 text-[14.5px] leading-[1.62] text-[#D4D7E4]">
        Em cada plataforma, convide <span className="font-mono text-[13.5px] text-cyan-300">{ACCESS_EMAIL}</span>{' '}
        com o <b className="text-white">maior nível de acesso disponível</b> (administrador/proprietário) —{' '}
        <b className="text-white">nunca compartilhe senha</b>. Se a conta ainda não existir, crie-a e depois nos convide.
      </p>
    </div>
  );
}

// ── Seção ──────────────────────────────────────────────────────────────────

function Section({
  index,
  answers,
  setText,
  toggleChip,
  isChipOn,
  onFile,
  uploading,
  onPrev,
  onNext,
  onSubmit,
  sending,
}: {
  index: number;
  answers: Answers;
  setText: (id: string, v: string) => void;
  toggleChip: (q: OnboardingQuestion, opt: string) => void;
  isChipOn: (q: OnboardingQuestion, opt: string) => boolean;
  onFile: (id: string, file: File | undefined) => void;
  uploading: string | null;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  sending: boolean;
}) {
  const s = ONBOARDING_SECTIONS[index - 1];
  const isLast = index === TOTAL;

  return (
    <section className="animate-fade-up">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="font-mono text-xs font-semibold text-cyan-700">
          {String(index).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
        </span>
        <span className="h-px flex-1 bg-border-subtle/40" />
        <span className="font-label text-[11px] uppercase tracking-[0.18em] text-text-muted">
          {s.title}
        </span>
      </div>

      <h1 className="text-balance text-[clamp(26px,5vw,34px)] font-semibold leading-[1.08] tracking-[-0.02em]">
        {s.title}
      </h1>
      <p className="mb-8 mt-2 max-w-[56ch] text-[15px] text-text-secondary">{s.lede}</p>

      {s.access && <AccessBox />}

      <div>
        {s.questions
          .filter((q) => isQuestionVisible(q, answers))
          .map((q, i) => (
          <div
            key={q.id}
            className={`border-t border-border-subtle/40 py-[22px] ${i === 0 ? 'border-t-0 pt-1' : ''}`}
          >
            <div className="mb-3 flex items-start gap-2.5">
              <span className="min-w-[22px] pt-[3px] font-mono text-xs text-text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[16.5px] font-medium leading-[1.4]">
                {q.label}
                {q.hint && (
                  <span className="mt-1 block text-[13.5px] font-normal text-text-muted">{q.hint}</span>
                )}
              </span>
            </div>

            <div className="ml-8">
              {q.type === 'chips' ? (
                <div className="flex flex-wrap gap-2">
                  {q.options!.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(q, opt)}
                      className={`chip ${isChipOn(q, opt) ? 'chip-on' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : q.type === 'area' ? (
                <textarea
                  className="field min-h-[78px] resize-y leading-[1.5]"
                  placeholder={q.ph ?? 'Sua resposta...'}
                  value={(answers[q.id] as string) ?? ''}
                  onChange={(e) => setText(q.id, e.target.value)}
                />
              ) : q.type === 'file' ? (
                <label className="filedrop">
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => onFile(q.id, e.target.files?.[0])}
                  />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
                  </svg>
                  <span>
                    {uploading === q.id
                      ? 'Enviando…'
                      : (answers[q.id] as string) || 'Escolher arquivo (PDF, planilha, doc...)'}
                  </span>
                </label>
              ) : (
                <input
                  type="text"
                  className="field"
                  placeholder={q.ph ?? 'Sua resposta...'}
                  value={(answers[q.id] as string) ?? ''}
                  onChange={(e) => setText(q.id, e.target.value)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-9 flex items-center justify-between gap-3.5 border-t border-border-subtle/40 pt-6">
        <button onClick={onPrev} className="btn-ghost">
          ← Voltar
        </button>
        {isLast ? (
          <button onClick={onSubmit} disabled={sending} className="btn-send">
            {sending ? 'Enviando…' : 'Enviar briefing'}
          </button>
        ) : (
          <button onClick={onNext} className="btn-primary">
            Continuar →
          </button>
        )}
      </div>
    </section>
  );
}

// ── Confirmação ──────────────────────────────────────────────────────────────

function Done({ context }: { context: Context }) {
  return (
    <section className="animate-fade-up py-8 text-center">
      <div className="mx-auto mb-5 grid h-[68px] w-[68px] place-items-center rounded-full bg-success/10 text-success">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Briefing enviado 🎉</h1>
      <p className="mx-auto mt-2.5 max-w-[44ch] text-text-secondary">
        Recebemos tudo do {context.produto}. A equipe da Notkode já vai começar a configuração — se
        faltar algum acesso, a gente te chama pelo WhatsApp.
      </p>
      <p className="mx-auto mt-2 max-w-[44ch] text-text-secondary">
        Uma cópia foi registrada no sistema, atrelada à <b className="text-text-primary">{context.cliente}</b>.
      </p>
      <p className="mt-6 font-mono text-xs tracking-wide text-text-muted">
        Briefing {context.produto} · versão {ONBOARDING_VERSION}
      </p>
    </section>
  );
}

// ── Estilos que o Tailwind não cobre limpo (chips, campos, navy box) ─────────

function StyleBlock() {
  return (
    <style>{`
      .field {
        width: 100%; font-size: 15px; color: hsl(var(--text-primary));
        background: hsl(var(--surface-elevated)); border: 1px solid rgba(25,25,24,.14);
        border-radius: 10px; padding: 12px 14px; transition: border-color .15s, box-shadow .15s;
        font-family: inherit;
      }
      .field::placeholder { color: hsl(var(--text-muted)); opacity: .85; }
      .field:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.16); background: hsl(var(--surface-base)); }

      .filedrop {
        display: flex; align-items: center; gap: 10px; cursor: pointer;
        font-size: 14.5px; color: hsl(var(--text-secondary));
        background: hsl(var(--surface-elevated));
        border: 1px dashed rgba(25,25,24,.28); border-radius: 10px;
        padding: 14px 16px; transition: all .15s;
      }
      .filedrop:hover { border-color: #3B82F6; color: hsl(var(--text-primary)); }
      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
      }

      .chip {
        font-size: 14px; padding: 9px 15px; border-radius: 99px; cursor: pointer;
        background: hsl(var(--surface-elevated)); border: 1px solid rgba(25,25,24,.14);
        color: hsl(var(--text-secondary)); transition: all .15s;
      }
      .chip:hover { border-color: rgba(25,25,24,.28); }
      .chip-on { background: #131520; color: #fffef2; border-color: #131520; }

      .star-badge {
        display: inline-flex; align-items: center; gap: 4px; vertical-align: middle;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 9.5px; letter-spacing: .12em; text-transform: uppercase;
        color: #B45309; background: rgba(180,83,9,.10);
        padding: 3px 7px; border-radius: 6px; margin-left: 8px; white-space: nowrap;
      }

      .accessbox {
        position: relative; overflow: hidden;
        background: #131520; border-radius: 14px; padding: 22px 24px;
      }
      .accessbox::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #3B82F6; }

      .btn-primary, .btn-ghost, .btn-send {
        font-size: 15px; font-weight: 500; padding: 12px 22px; border-radius: 10px;
        cursor: pointer; border: 1px solid transparent; transition: all .15s;
        display: inline-flex; align-items: center; gap: 8px; font-family: inherit;
      }
      .btn-primary { background: #131520; color: #fffef2; }
      .btn-primary:hover { background: #0c0d16; transform: translateY(-1px); }
      .btn-ghost { background: transparent; color: hsl(var(--text-secondary)); border-color: rgba(25,25,24,.14); }
      .btn-ghost:hover { border-color: rgba(25,25,24,.28); color: hsl(var(--text-primary)); }
      .btn-send { background: #3B82F6; color: #fff; }
      .btn-send:hover { background: #1D4ED8; }
      .btn-send:disabled { opacity: .6; cursor: not-allowed; }
    `}</style>
  );
}
