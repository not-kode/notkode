import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, ArrowDown, TrendingUp, Users, Zap, Shield, Code2, Sparkles, type LucideIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Parcerias e white-label · Notkode',
  description:
    'Agência de marketing ou consultoria que precisa entregar tecnologia? A Notkode constrói o que sua equipe não tem time pra fazer, com sua marca na frente.',
};
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { ParceriasHeroBackground } from '@/components/parcerias/parcerias-hero-background';
import { PartnershipIllustration } from '@/components/parcerias/partnership-illustration';
import { AgencyBanner } from '@/components/home/agency-banner';
import { FinalCTA } from '@/components/home/final-cta';
import { ParceriasQualificationForm } from '@/components/parcerias/parcerias-qualification-form';

function HighlightCard({
  icon: Icon,
  value,
  topLabel,
  desc,
  accent = false,
}: {
  icon: LucideIcon;
  value: string;
  topLabel: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <article
      className="rounded-2xl p-6 lg:p-7 h-full transition-all duration-300 hover:-translate-y-1"
      style={{
        background: accent ? 'rgba(59,130,246,0.05)' : 'hsl(55 100% 97%)',
        border: accent
          ? '1px solid rgba(59,130,246,0.25)'
          : '1px solid rgba(25,25,24,0.08)',
        boxShadow: accent
          ? '0 12px 32px -16px rgba(59,130,246,0.25)'
          : '0 6px 20px -10px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: accent ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.10)',
          }}
        >
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
        </div>
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
          {topLabel}
        </span>
      </div>
      <div className="font-bricolage text-[1.75rem] lg:text-[2rem] font-bold text-primary leading-none mb-3 tracking-tight">
        {value}
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        {desc}
      </p>
    </article>
  );
}

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Multiplique seu ticket',
    desc: 'Venda desenvolvimento, IA e automação além do marketing — sem virar uma software house.',
  },
  {
    icon: Users,
    title: 'Sem contratar ninguém',
    desc: 'Nossa equipe entrega como se fosse sua. Você fica com 100% da relação com o cliente.',
  },
  {
    icon: Zap,
    title: 'Entrega em semanas',
    desc: 'Metodologia FastForge™ com entregas semanais. Você acompanha tudo em tempo real.',
  },
  {
    icon: Shield,
    title: 'White-label real',
    desc: 'NDA assinado, sua marca, seu cliente. A Notkode fica nos bastidores — ou na frente, se preferir.',
  },
];

const OFFERINGS = [
  {
    icon: Code2,
    title: 'Sistemas internos com IA',
    desc: 'Plataformas sob medida para clientes que querem largar SaaS genéricos.',
  },
  {
    icon: Sparkles,
    title: 'Agentes & Automações',
    desc: 'Chatbots inteligentes, automação de WhatsApp, fluxos n8n para liberar horas da equipe do cliente.',
  },
  {
    icon: Code2,
    title: 'Produtos digitais',
    desc: 'SaaS, apps mobile, websites e e-commerce — do MVP ao escalar.',
  },
];

export default async function ParceriasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* ── Hero — split with illustration + stat row below ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <ParceriasHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-16 lg:pb-20">

          {/* Top: illustration LEFT + text RIGHT */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-center mb-12 lg:mb-14">

            {/* LEFT — partnership illustration */}
            <Reveal direction="right">
              <PartnershipIllustration />
            </Reveal>

            {/* RIGHT — text + CTAs */}
            <Reveal delay={150} className="min-w-0">
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-5 break-words">
                <span className="block mb-1">Sua agência entrega mais.</span>
                <span className="block">
                  Sem contratar <span className="font-bricolage">ninguém.</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-7">
                Você fecha o projeto. A gente constrói nos bastidores. Seu cliente recebe um produto sob medida com sua marca — e você multiplica o ticket sem mudar a estrutura.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#parceria"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
                >
                  Tornar-se parceiro
                  <ArrowDown className="w-4 h-4" />
                </a>
                <a
                  href="#como-funciona"
                  className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-hairline-strong text-text-primary font-bold text-[13px] uppercase tracking-wide hover:bg-black/[0.04] transition-all duration-200"
                >
                  Ver como funciona
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>

          </div>

          {/* Bottom: 3 highlight stat cards full-width */}
          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
            <Reveal delay={250}>
              <HighlightCard
                icon={TrendingUp}
                value="+R$ 30–100k"
                topLabel="Ticket adicional"
                desc="por projeto que você antes recusaria por falta de tech."
              />
            </Reveal>
            <Reveal delay={320}>
              <HighlightCard
                icon={Shield}
                value="100%"
                topLabel="White-label"
                desc="NDA assinado. Sua marca, seu cliente, nossa entrega nos bastidores."
                accent
              />
            </Reveal>
            <Reveal delay={390}>
              <HighlightCard
                icon={Zap}
                value="Semanal"
                topLabel="Entrega visível"
                desc="Acompanhamento em tempo real, sem call surpresa nem retrabalho."
              />
            </Reveal>
          </div>

        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="01" label="Por que parceria" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Quatro motivos para{' '}
              parar de <span className="font-bricolage">recusar</span> projetos.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <b.icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">
                    {b.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {b.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona (reuse home AgencyBanner) ── */}
      <span id="como-funciona" />
      <AgencyBanner locale={locale} />

      {/* ── O que sua agência passa a oferecer ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="03" label="Seu novo portfólio" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              O que sua agência passa{' '}
              a <span className="font-bricolage">oferecer.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {OFFERINGS.map((o, i) => (
              <Reveal key={o.title} delay={i * 100}>
                <article
                  className="rounded-2xl border border-black/[0.08] p-6 lg:p-7 h-full hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <o.icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-[16px] lg:text-[17px] font-semibold tracking-tight text-text-primary mb-2">
                    {o.title}
                  </h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {o.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      {/* ── Parceria form ── */}
      <section id="parceria" className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <Reveal>
              <SectionMarker number="05" label="Vamos conversar" />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-6">
                Conta como{' '}
                a gente pode te <span className="font-bricolage">ajudar.</span>
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed">
                Três perguntas curtas pra entender sua agência e como podemos ser braço técnico — sem reunião desnecessária. Resposta em até 24h.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <ParceriasQualificationForm />
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA locale={locale} ctaHref="#parceria" />
    </>
  );
}
