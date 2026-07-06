'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2, MessageCircle } from 'lucide-react';

interface InlineFormProps {
  /** Heading above the form */
  title: string;
  /** Subtitle below the heading */
  subtitle: string;
  /** Service tag included in the submission payload (for routing on backend) */
  serviceTag: string;
  /** Custom placeholder for the "needs" textarea */
  needsPlaceholder?: string;
}

export function InlineForm({
  title,
  subtitle,
  serviceTag,
  needsPlaceholder = 'Ex: preciso automatizar o atendimento via WhatsApp dos meus clientes...',
}: InlineFormProps) {
  const [name, setName]         = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail]       = useState('');
  const [needs, setNeeds]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'submitting' | 'success'>('idle');

  const canSubmit = name && whatsapp && email && needs && status !== 'submitting';

  const submit = async () => {
    if (!canSubmit) return;
    setStatus('submitting');
    await new Promise((r) => setTimeout(r, 900));
    // TODO: send to backend webhook when configured
    // eslint-disable-next-line no-console
    console.log('[inline form]', { serviceTag, name, whatsapp, email, needs });
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-black/[0.08] p-8 lg:p-10 text-center" style={{ background: 'hsl(55 100% 97%)' }}>
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
          <Check className="w-7 h-7 text-primary" strokeWidth={2.5} />
        </div>
        <h3 className="text-[1.35rem] lg:text-[1.5rem] font-semibold tracking-tight text-text-primary mb-3">
          Recebemos seu pedido.
        </h3>
        <p className="text-[14px] text-text-secondary leading-relaxed mb-6 max-w-md mx-auto">
          Em algumas horas você recebe uma proposta inicial no seu WhatsApp ou e-mail. Sem call obrigatória, direto ao ponto.
        </p>
        <a
          href="https://wa.me/5511951381254?text=Acabei de preencher o formulário no site, quero acelerar."
          target="_blank"
          rel="noopener noreferrer"
          data-cta="whatsapp-sucesso"
          className="font-bricolage inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          Acelerar pelo WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-black/[0.08] p-6 lg:p-8"
      style={{ background: 'hsl(55 100% 97%)' }}
    >
      <div className="mb-6">
        <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
          ❯ {serviceTag}.sh
        </p>
        <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-1">
          {title}
        </h3>
        <p className="text-[14px] text-text-secondary leading-relaxed">{subtitle}</p>
      </div>

      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Seu nome" value={name} onChange={setName} placeholder="Como te chama?" />
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={setWhatsapp}
            placeholder="(11) 99999-9999"
            type="tel"
          />
        </div>
        <Input
          label="E-mail"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          type="email"
        />
        <label className="block">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-1.5">
            O que você precisa?
          </span>
          <textarea
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            rows={3}
            placeholder={needsPlaceholder}
            className="w-full px-4 py-3 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors leading-relaxed resize-none"
            style={{ border: '1px solid rgba(25,25,24,0.10)' }}
          />
        </label>
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="font-bricolage w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            Receber proposta
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="font-mono text-[10px] text-text-dim text-center mt-3">
        resposta em horas, não dias
      </p>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg text-[14px] bg-white/60 focus:outline-none focus:border-primary/50 transition-colors"
        style={{ border: '1px solid rgba(25,25,24,0.10)' }}
      />
    </label>
  );
}
