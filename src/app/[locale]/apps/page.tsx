import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { seoAlternates } from '@/lib/seo';
import { Reveal } from '@/components/ui/reveal';
import { AppCard } from '@/components/apps/app-card';
import { AppsQualificationForm } from '@/components/apps/apps-qualification-form';
import { APPS, type AppPlatform } from '@/data/apps';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Apps' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: seoAlternates(locale, '/apps'),
  };
}

export default async function AppsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Apps' });

  const platformLabel = (p: AppPlatform) => t(`platforms.${p}`);

  return (
    <>
      <section className="relative overflow-hidden bg-surface-base">
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-32 pb-14 lg:pb-16">
          <Reveal>
            <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-semibold leading-[1.1] tracking-[-0.03em] mb-5 break-words text-text-primary">
              {t('heroTitlePre')}{' '}
              <span className="font-bricolage font-normal">{t('heroTitleAccent')}</span>
            </h1>
            <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6]">
              {t('heroDesc')}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 pb-24 lg:pb-32 pt-14 lg:pt-16">
          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {APPS.map((app, i) => (
              <Reveal key={app.id} delay={i * 90}>
                <AppCard
                  app={app}
                  name={t(`items.${app.id}.name`)}
                  tagline={t(`items.${app.id}.tagline`)}
                  description={t(`items.${app.id}.description`)}
                  platformLabels={app.platforms.map(platformLabel)}
                  ctaLabel={t(`items.${app.id}.cta`)}
                  ratingSuffix={t('ratingSuffix')}
                />
              </Reveal>
            ))}
          </div>

          {/* Prova de capacidade: discreta, no pé da grade. Quem chegou até aqui já viu
              os produtos; a linha só nomeia quem os construiu e abre a porta. */}
          <Reveal delay={120}>
            <div
              className="mt-10 lg:mt-12 rounded-2xl px-6 lg:px-8 py-6 lg:py-7"
              style={{
                background: 'hsl(55 100% 97%)',
                border: '1px solid rgba(25,25,24,0.08)',
              }}
            >
              <p className="font-mono text-[11px] text-primary uppercase tracking-widest mb-2.5">
                {t('builtByEyebrow')}
              </p>
              <p className="text-[16px] lg:text-[17px] text-text-primary leading-[1.6]">
                {t('builtByDesc')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Fecha na intenção da própria página: quem viu os apps e quer construir o dele.
          Mesmo caminho do resto do site (formulário + saída de WhatsApp), não um CTA genérico. */}
      <section id="construir" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <Reveal>
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-6">
                {t('ctaTitlePre')}{' '}
                <span className="font-bricolage font-normal">{t('ctaTitleAccent')}</span>
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed">{t('ctaDesc')}</p>
            </Reveal>

            <Reveal delay={120}>
              <AppsQualificationForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
