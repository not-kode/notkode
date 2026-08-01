import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import {
  Keyboard,
  Mic,
  Check,
  Lock,
  Globe,
  WifiOff,
  Minimize2,
  RefreshCw,
  EyeOff,
} from 'lucide-react';
import { seoAlternates } from '@/lib/seo';
import { Reveal } from '@/components/ui/reveal';
import { CountUp } from '@/components/ui/count-up';
import { DotPattern } from '@/components/ui/dot-pattern';
import { ProductFAQ } from '@/components/ui/product-faq';
import { BackToApps } from '@/components/apps/back-to-apps';
import { DownloadPicker } from '@/components/apps/download-picker';
import { SectionIntro } from '@/components/apps/section-intro';
import { AppsQualificationForm } from '@/components/apps/apps-qualification-form';
import { FALA_DOWNLOADS, FALA_VERSION } from '@/data/downloads';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AppFala' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: seoAlternates(locale, '/apps/fala-que-eu-te-escuto'),
  };
}

const FEATURE_ICONS = [Lock, Globe, WifiOff, Minimize2, RefreshCw, EyeOff];
const STEP_ICONS = [Keyboard, Mic, Check];

export default async function FalaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AppFala' });

  const faqs = ['free', 'privacy', 'anywhere', 'wispr', 'terminal', 'firstRun'].map((k) => ({
    q: t(`faq.${k}.q`),
    a: t(`faq.${k}.a`),
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-base">
        <DotPattern />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-32 pb-16 lg:pb-20">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <Reveal>
                <div className="mb-7">
                  <BackToApps />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Image
                    src="/images/apps/fala.png"
                    alt="Fala que eu te escuto"
                    width={96}
                    height={96}
                    className="w-12 h-12 rounded-xl"
                  />
                  <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
                    {t('eyebrow')}
                  </span>
                </div>

                <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-semibold leading-[1.1] tracking-[-0.03em] mb-5 text-text-primary">
                  {t('heroTitlePre')}{' '}
                  <span className="font-bricolage font-normal">{t('heroTitleAccent')}</span>
                </h1>

                <p className="text-[17px] lg:text-[19px] text-text-secondary leading-[1.6] mb-8">
                  {t('heroDesc')}
                </p>
              </Reveal>

              <Reveal delay={150}>
                <div className="flex flex-wrap gap-3 mb-8">
                  <a
                    href="#baixar"
                    data-cta="fala/hero-download"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bricolage text-[13px] font-bold uppercase tracking-wide text-white transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ background: '#3B82F6' }}
                  >
                    {t('heroCtaPrimary')}
                  </a>
                  <a
                    href="#como"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bricolage text-[13px] font-bold uppercase tracking-wide text-text-primary transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ background: 'rgba(25,25,24,0.05)' }}
                  >
                    {t('heroCtaSecondary')}
                  </a>
                </div>
              </Reveal>

              <Reveal delay={240}>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {['free', 'offline', 'private'].map((k) => (
                    <li key={k} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                      <span className="text-[14px] text-text-secondary">{t(`trust.${k}`)}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* Mockup: o texto ditado caindo dentro de um editor qualquer. É o
                produto inteiro numa imagem — você fala, ele escreve onde o cursor
                estiver. */}
            <Reveal delay={200} distance={32}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#131520',
                  border: '1px solid rgba(25,25,24,0.12)',
                  boxShadow: '0 24px 60px -30px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
                  <span className="flex-1 text-center font-mono text-[11px] text-neutral-300 mr-8">
                    {t('mockWindow')}
                  </span>
                </div>

                <div className="p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                    {t('mockLabel')}
                  </p>
                  <p className="text-[15px] leading-[1.65] text-neutral-100">
                    {t('mockPrompt')}
                    <span
                      className="inline-block w-[2px] h-[18px] align-[-3px] ml-0.5"
                      style={{ background: '#3B82F6' }}
                    />
                  </p>

                  <div
                    className="mt-6 inline-flex items-center gap-2.5 rounded-full px-3.5 py-2"
                    style={{ background: 'rgba(59,130,246,0.14)' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#3B82F6' }}
                    />
                    <span className="flex items-end gap-[3px] h-3.5">
                      {[0.4, 0.75, 1, 0.55, 0.85, 0.35, 0.6].map((h, i) => (
                        <span
                          key={i}
                          className="w-[3px] rounded-full"
                          style={{ height: `${h * 100}%`, background: '#93C5FD' }}
                        />
                      ))}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary-soft">
                      {t('mockRecording')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-[13px] text-text-secondary">
                {t('mockCaption')}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Digitando x falando */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('whyEyebrow')} title={t('whyTitle')} desc={t('whyDesc')} />

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {(['typing', 'speaking'] as const).map((mode, i) => {
              const isSpeaking = mode === 'speaking';
              const Icon = isSpeaking ? Mic : Keyboard;
              return (
                <Reveal key={mode} delay={i * 100}>
                  <div
                    className="h-full rounded-2xl p-6 lg:p-8"
                    style={{
                      background: 'hsl(55 100% 97%)',
                      border: isSpeaking
                        ? '1px solid rgba(59,130,246,0.35)'
                        : '1px solid rgba(25,25,24,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-6">
                      <Icon
                        className={isSpeaking ? 'w-5 h-5 text-primary' : 'w-5 h-5 text-text-secondary'}
                        strokeWidth={1.8}
                      />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
                        {t(`compare.${mode}.label`)}
                      </span>
                    </div>

                    <p className="flex items-baseline gap-2 mb-5">
                      <span
                        className={`font-mono text-[2.75rem] lg:text-[3.25rem] font-semibold tracking-tight ${
                          isSpeaking ? 'text-primary' : 'text-text-primary'
                        }`}
                      >
                        <CountUp value={isSpeaking ? '150' : '40'} />
                      </span>
                      <span className="font-mono text-[12px] text-text-secondary">
                        {t('compare.unit')}
                      </span>
                    </p>

                    <div
                      className="h-1.5 rounded-full mb-6 overflow-hidden"
                      style={{ background: 'rgba(25,25,24,0.07)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: isSpeaking ? '100%' : '27%',
                          background: isSpeaking ? '#3B82F6' : 'rgba(25,25,24,0.25)',
                        }}
                      />
                    </div>

                    <p className="text-[15px] lg:text-[16px] text-text-primary leading-[1.6]">
                      {t(`compare.${mode}.desc`)}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como" className="bg-surface-base scroll-mt-24">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('howEyebrow')} title={t('howTitle')} />

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {['hold', 'speak', 'release'].map((k, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <Reveal key={k} delay={i * 100}>
                  <div
                    className="h-full rounded-2xl p-6 lg:p-7"
                    style={{
                      background: 'hsl(55 100% 97%)',
                      border: '1px solid rgba(25,25,24,0.08)',
                    }}
                  >
                    <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-4">
                      {t('stepLabel', { n: i + 1 })}
                    </p>
                    <Icon className="w-6 h-6 text-primary mb-4" strokeWidth={1.6} />
                    <h3 className="text-[18px] font-semibold tracking-tight text-text-primary mb-2">
                      {t(`steps.${k}.title`)}
                    </h3>
                    <p className="text-[15px] text-text-secondary leading-[1.6]">
                      {t(`steps.${k}.desc`)}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Por que este */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('featuresEyebrow')} title={t('featuresTitle')} desc={t('featuresDesc')} />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {['local', 'portuguese', 'offline', 'quiet', 'updates', 'nothingSent'].map((k, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <Reveal key={k} delay={i * 70}>
                  <div
                    className="h-full rounded-2xl p-6"
                    style={{
                      background: 'hsl(55 100% 97%)',
                      border: '1px solid rgba(25,25,24,0.08)',
                    }}
                  >
                    <Icon className="w-5 h-5 text-primary mb-4" strokeWidth={1.6} />
                    <h3 className="text-[17px] font-semibold tracking-tight text-text-primary mb-2">
                      {t(`features.${k}.title`)}
                    </h3>
                    <p className="text-[15px] text-text-secondary leading-[1.6]">
                      {t(`features.${k}.desc`)}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <Reveal>
            <div
              className="rounded-2xl px-6 lg:px-10 py-10 lg:py-12 text-center max-w-3xl mx-auto"
              style={{
                background: 'hsl(55 100% 97%)',
                border: '1px solid rgba(25,25,24,0.08)',
              }}
            >
              <p className="flex items-baseline justify-center gap-2 mb-4">
                <span className="font-mono text-[3rem] lg:text-[4rem] font-semibold tracking-tight text-text-primary">
                  {t('priceValue')}
                </span>
                <span className="font-mono text-[13px] text-text-secondary">
                  {t('priceSuffix')}
                </span>
              </p>
              <p className="text-[16px] lg:text-[17px] text-text-primary leading-[1.6] max-w-xl mx-auto mb-3">
                {t('priceDesc')}
              </p>
              <p className="text-[14px] text-text-secondary">{t('priceFine')}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Download */}
      <section id="baixar" className="bg-surface-elevated scroll-mt-24">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('downloadEyebrow')} title={t('downloadTitle')} />

          <DownloadPicker downloads={FALA_DOWNLOADS} namespace="AppFala" />

          <Reveal delay={200}>
            <div
              className="mt-8 lg:mt-10 rounded-2xl px-6 lg:px-8 py-6 lg:py-7"
              style={{
                background: 'hsl(55 100% 97%)',
                border: '1px solid rgba(25,25,24,0.08)',
              }}
            >
              <p className="font-mono text-[11px] text-primary uppercase tracking-widest mb-3">
                {t('permissionsTitle')}
              </p>
              <p className="text-[15px] lg:text-[16px] text-text-primary leading-[1.6] mb-4">
                {t('permissionsIntro')}
              </p>
              <ul className="space-y-2 mb-4">
                {['input', 'accessibility', 'mic'].map((k) => (
                  <li key={k} className="flex gap-2.5 text-[15px] text-text-secondary leading-[1.6]">
                    <span className="text-primary shrink-0">·</span>
                    <span>
                      <strong className="text-text-primary font-semibold">
                        {t(`permissions.${k}.name`)}
                      </strong>
                      , {t(`permissions.${k}.why`)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[14px] text-text-secondary leading-[1.6]">
                {t('permissionsNote')}
              </p>
              <p className="font-mono text-[11px] text-text-secondary mt-5">
                {t('versionLabel', { version: FALA_VERSION })}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <ProductFAQ eyebrow={t('faqEyebrow')} title={t('faqTitle')} faqs={faqs} surface="base" />

      {/* Fecha no mesmo caminho do resto do site: quem gostou do produto e quer
          um assim. O formulário é o de apps, para o lead cair no mesmo funil. */}
      <section id="construir" className="bg-surface-elevated">
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
