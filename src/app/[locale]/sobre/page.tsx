import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Linkedin } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { TimelineHorizontal } from '@/components/sobre/timeline-horizontal';
import { FounderPhoto } from '@/components/sobre/founder-photo';
import { SobreHeroBackground } from '@/components/sobre/sobre-hero-background';
import { FinalCTA } from '@/components/home/final-cta';

const FOUNDERS = [
  {
    name: 'Camila Tonelotto',
    role: 'Co-fundadora · Design & UX',
    bio: 'Trajetória de arte → design → UX → desenvolvimento. Lidera a experiência dos produtos e a relação direta com os clientes da Notkode.',
    linkedin: 'https://www.linkedin.com/in/gregoriocamila/',
    photo: '/images/founders/camila.jpg',
    initials: 'CT',
    accent: '#3B82F6',
  },
  {
    name: 'Matheus Tonelotto',
    role: 'Co-fundador · Estratégia & Tecnologia',
    bio: 'Experiência em multinacionais de software e startups brasileiras. Especialista em IA. Já liderou projetos no Canadá, EUA e Inglaterra.',
    linkedin: 'https://www.linkedin.com/in/matheustonelotto/',
    photo: '/images/founders/matheus.jpg',
    initials: 'MT',
    accent: '#8B5CF6',
  },
];

const STATS = [
  { value: '50+', label: 'projetos entregues' },
  { value: '9.8', label: 'avaliação média' },
  { value: '6+',  label: 'anos de mercado' },
  { value: '4',   label: 'países atendidos' },
];

export default async function SobrePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <SobreHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-32 lg:pt-44 pb-20 lg:pb-24">
          <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-20 items-start">
            <Reveal>
              <SectionMarker number="00" label="Sobre a Notkode" />
              <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.08] tracking-[-0.03em] mt-4 mb-6">
                <span className="block mb-1">Tecnologia sob medida,</span>
                <span className="block">
                  <span className="font-bricolage text-gradient">feita por gente que entende.</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl">
                Somos uma boutique de tecnologia brasileira que ajuda empresas a construir software que serve ao negócio — não o contrário. Desde 2020, operamos de São Paulo para Brasil, EUA, Canadá e Inglaterra.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div
                className="rounded-2xl border border-black/[0.08] p-6 lg:p-8"
                style={{ background: 'hsl(55 100% 97%)' }}
              >
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-5">
                  ❯ números reais
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {STATS.map((s) => (
                    <div key={s.label}>
                      <div className="font-bricolage text-[2rem] font-bold text-primary leading-none mb-1.5">
                        {s.value}
                      </div>
                      <div className="font-mono text-[11px] text-text-muted lowercase">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Missão ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-28">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
            <Reveal>
              <SectionMarker number="01" label="Missão" />
            </Reveal>
            <Reveal delay={100}>
              <p className="text-[1.4rem] md:text-[1.75rem] lg:text-[1.9rem] font-semibold leading-[1.3] tracking-[-0.015em] text-text-primary">
                Devolver às empresas o controle da sua tecnologia. Construir software que reflete o jeito único de cada operação, com IA que aprende, e código que fica nas mãos certas —{' '}
                <span className="font-bricolage text-gradient">as do cliente.</span>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Timeline horizontal (scroll pinned) ── */}
      <TimelineHorizontal />

      {/* ── Fundadores ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <SectionMarker number="03" label="Quem está por trás" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              Dois fundadores,{' '}
              <span className="font-bricolage">um time direto.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={i * 120}>
                <article
                  className="group rounded-2xl border border-black/[0.08] p-5 lg:p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 flex gap-5"
                  style={{ background: 'hsl(55 100% 97%)' }}
                >
                  <FounderPhoto
                    src={f.photo}
                    alt={f.name}
                    initials={f.initials}
                    accent={f.accent}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-[17px] lg:text-[18px] font-semibold tracking-tight text-text-primary mb-1">
                      {f.name}
                    </h3>
                    <p className="font-mono text-[10px] text-text-muted mb-3 leading-snug">{f.role}</p>
                    <p className="text-[13px] text-text-secondary leading-relaxed mb-4 flex-1">{f.bio}</p>
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:gap-2.5 transition-all self-start"
                    >
                      <Linkedin className="w-3.5 h-3.5" strokeWidth={2} />
                      LinkedIn
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final reaproveitado ── */}
      <FinalCTA locale={locale} />
    </>
  );
}
