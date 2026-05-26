import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Linkedin } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';
import { TimelineHorizontalLazy as TimelineHorizontal } from '@/components/sobre/timeline-horizontal-lazy';
import { FounderPhoto } from '@/components/sobre/founder-photo';
import { SobreHeroBackground } from '@/components/sobre/sobre-hero-background';
import { FinalCTA } from '@/components/home/final-cta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Sobre' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function SobrePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Sobre' });

  const FOUNDERS = [
    {
      name: 'Camila Tonelotto',
      role: t('founder1Role'),
      bio: t('founder1Bio'),
      linkedin: 'https://www.linkedin.com/in/gregoriocamila/',
      photo: '/images/founders/camila.jpg',
      initials: 'CT',
      accent: '#3B82F6',
    },
    {
      name: 'Matheus Tonelotto',
      role: t('founder2Role'),
      bio: t('founder2Bio'),
      linkedin: 'https://www.linkedin.com/in/matheustonelotto/',
      photo: '/images/founders/matheus.jpg',
      initials: 'MT',
      accent: '#8B5CF6',
    },
  ];

  const STATS = [
    { value: '50+', label: t('statProjects') },
    { value: '9.8', label: t('statRating') },
    { value: '6+',  label: t('statYears') },
    { value: '4',   label: t('statCountries') },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <SobreHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-32 pb-20 lg:pb-24">
          <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-start">
            <Reveal className="min-w-0">
              <SectionMarker number="00" label={t('heroEyebrow')} />
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mt-4 mb-6 break-words">
                <span className="block mb-1">{t('heroTitleLine1')}</span>
                <span className="block">
                  {t('heroTitleLine2')} <span className="font-bricolage">{t('heroTitleAccent')}</span>
                </span>
              </h1>
              <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] max-w-2xl">
                {t('heroDesc')}
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div
                className="rounded-2xl border border-black/[0.08] p-6 lg:p-8"
                style={{ background: 'hsl(55 100% 97%)' }}
              >
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-5">
                  {t('statsHeader')}
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
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">01</span>
                <span className="h-px w-6 bg-text-dim/30" />
                <span className="font-mono text-[10px] text-text-primary uppercase tracking-widest font-medium">{t('purposeEyebrow')}</span>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-[1.4rem] md:text-[1.75rem] lg:text-[1.9rem] font-semibold leading-[1.3] tracking-[-0.015em] text-text-primary">
                {t('purposeBody')}{' '}
                {t('purposeBodyAccent')} <span className="font-bricolage">{t('purposeBodyAccentBricolage')}</span>
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
            <SectionMarker number="03" label={t('foundersEyebrow')} />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4 mb-12 max-w-2xl">
              {t('foundersTitlePre')}{' '}
              {t('foundersTitleLine2')} <span className="font-bricolage">{t('foundersTitleAccent')}</span>
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

      <FinalCTA locale={locale} />
    </>
  );
}
