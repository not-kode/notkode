import { setRequestLocale } from 'next-intl/server';
import { MessageCircle, Mail, Clock, Check } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ContatoHeroBackground } from '@/components/contato/contato-hero-background';
import { ContatoForm } from '@/components/contato/contato-form';

const PROMISES = [
  { icon: Clock,        label: 'Resposta em 24h'  },
  { icon: Check,        label: 'Sem compromisso'  },
  { icon: MessageCircle,label: 'Conversa de 30min' },
];

export default async function ContatoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* ── Hero + Form ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <ContatoHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-32 lg:pt-40 pb-20 lg:pb-24">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">

            {/* LEFT — pitch + alternative contact */}
            <Reveal>
              <SectionMarker number="00" label="Agendar diagnóstico" />
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] font-bold leading-[1.1] tracking-[-0.03em] mt-4 mb-6">
                <span className="block mb-1">Vamos entender</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">o seu desafio.</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-8">
                Diagnóstico gratuito de 30 minutos. Você sai da conversa com um plano claro do que faz sentido pra sua operação — mesmo que não fechemos projeto.
              </p>

              {/* Promises */}
              <ul className="space-y-3 mb-10">
                {PROMISES.map((p) => (
                  <li key={p.label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <p.icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-[14px] text-text-primary">{p.label}</span>
                  </li>
                ))}
              </ul>

              {/* Alternative direct contact */}
              <div className="pt-6 border-t border-black/[0.07]">
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4">
                  ou se preferir, fale direto
                </p>
                <div className="space-y-3">
                  <a
                    href="https://wa.me/5511951381254?text=Olá equipe da Notkode, quero conversar."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-[14px] text-text-primary hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-primary" strokeWidth={1.8} />
                    <span className="font-semibold">+55 11 95138-1254</span>
                    <span className="font-mono text-[11px] text-text-dim group-hover:text-primary/70 transition-colors">WhatsApp</span>
                  </a>
                  <a
                    href="mailto:camila@notkode.com.br"
                    className="group flex items-center gap-3 text-[14px] text-text-primary hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary" strokeWidth={1.8} />
                    <span className="font-semibold">camila@notkode.com.br</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* RIGHT — form */}
            <Reveal delay={120}>
              <ContatoForm />
            </Reveal>

          </div>
        </div>
      </section>
    </>
  );
}
