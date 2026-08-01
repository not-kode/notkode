import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import {
  FolderOpen,
  LayoutGrid,
  Eye,
  Terminal,
  FileCode2,
  Save,
  ShieldCheck,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { seoAlternates } from '@/lib/seo';
import { Reveal } from '@/components/ui/reveal';
import { DotPattern } from '@/components/ui/dot-pattern';
import { ProductFAQ } from '@/components/ui/product-faq';
import { BackToApps } from '@/components/apps/back-to-apps';
import { DownloadPicker } from '@/components/apps/download-picker';
import { SectionIntro } from '@/components/apps/section-intro';
import { AppsQualificationForm } from '@/components/apps/apps-qualification-form';
import { SIMBOS_DOWNLOADS, SIMBOS_VERSION } from '@/data/downloads';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AppSimbos' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: seoAlternates(locale, '/apps/simbos'),
  };
}

const STEP_ICONS = [FolderOpen, LayoutGrid, Eye];
const FEATURE_ICONS = [Terminal, FileCode2, Save, ShieldCheck, WifiOff, RefreshCw];

/** Atalhos do app. A tecla não se traduz; o que ela faz sai das mensagens. */
const SHORTCUTS = ['⌘O', '⌘T', '⌘⇧E', '⌘S', '⌘⇧F', '⌘⏎'] as const;

export default async function SimbosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AppSimbos' });

  const faqs = ['whatIsIt', 'account', 'terminal', 'privacy', 'updates', 'windows'].map((k) => ({
    q: t(`faq.${k}.q`),
    a: t(`faq.${k}.a`),
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-base">
        <DotPattern />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-32 pb-16 lg:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <Reveal>
                <div className="mb-7">
                  <BackToApps />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Image
                    src="/images/apps/simbos.png"
                    alt="SimbOS"
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
                    data-cta="simbos/hero-download"
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
                <p className="font-mono text-[12px] text-text-secondary leading-[1.7]">
                  {t('heroFootnote')}
                </p>
              </Reveal>
            </div>

            {/* Mockup do canvas: quatro cards espalhados, cada agente no seu canto.
                É literalmente o argumento da página — dá pra ver os quatro de uma vez. */}
            <Reveal delay={200} distance={32}>
              <div
                className="relative rounded-2xl p-4 lg:p-5 overflow-hidden"
                style={{
                  background: '#0A0B11',
                  border: '1px solid rgba(25,25,24,0.12)',
                  boxShadow: '0 24px 60px -30px rgba(0,0,0,0.55)',
                  backgroundImage:
                    'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  {(['agentA', 'files', 'agentB', 'agentC'] as const).map((k, i) => {
                    const isFiles = k === 'files';
                    return (
                      <div
                        key={k}
                        className="rounded-lg overflow-hidden"
                        style={{
                          background: '#131520',
                          border: '1px solid rgba(255,255,255,0.08)',
                          marginTop: i === 1 ? '18px' : i === 3 ? '10px' : 0,
                        }}
                      >
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1.5"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          {isFiles ? (
                            <FileCode2 className="w-3 h-3 text-primary-soft" strokeWidth={1.8} />
                          ) : (
                            <Terminal className="w-3 h-3 text-primary-soft" strokeWidth={1.8} />
                          )}
                          <span className="font-mono text-[9px] text-neutral-300 truncate">
                            {t(`mock.${k}.title`)}
                          </span>
                        </div>
                        <div className="px-2.5 py-2 space-y-1">
                          {[0, 1, 2].map((line) => (
                            <p
                              key={line}
                              className="font-mono text-[9px] leading-[1.5] truncate"
                              style={{ color: line === 0 ? '#93C5FD' : '#7B7E85' }}
                            >
                              {t(`mock.${k}.line${line}`)}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="mt-4 text-center text-[13px] text-text-secondary">
                {t('mockCaption')}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Postura do produto, antes de qualquer funcionalidade. Sem isso a página
          é lida como "mais um editor", e a primeira pergunta de todo mundo vira
          se substitui o VS Code — que é justamente a leitura errada. */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 pb-20 lg:pb-24">
          <Reveal>
            <div
              className="rounded-2xl px-6 lg:px-10 py-10 lg:py-12"
              style={{
                background: 'hsl(55 100% 97%)',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              {/* Duas colunas: sozinho numa coluna só, o parágrafo parava no meio
                  do card e deixava metade da largura vazia. */}
              <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 items-start">
                <div>
                  <p className="font-mono text-[11px] text-primary uppercase tracking-widest mb-4">
                    {t('stanceEyebrow')}
                  </p>
                  <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bricolage font-normal leading-[1.1] tracking-[-0.02em] text-text-primary">
                    {t('stanceTitle')}
                  </h2>
                </div>

                <p className="text-[16px] lg:text-[18px] text-text-primary leading-[1.65]">
                  {t('stanceDesc')}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* O problema das abas */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('whyEyebrow')} title={t('whyTitle')} desc={t('whyDesc')} />

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {(['tabs', 'canvas'] as const).map((mode, i) => {
              const isCanvas = mode === 'canvas';
              return (
                <Reveal key={mode} delay={i * 100}>
                  <div
                    className="h-full rounded-2xl p-6 lg:p-8"
                    style={{
                      background: 'hsl(55 100% 97%)',
                      border: isCanvas
                        ? '1px solid rgba(59,130,246,0.35)'
                        : '1px solid rgba(25,25,24,0.08)',
                    }}
                  >
                    <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-4">
                      {t(`compare.${mode}.label`)}
                    </p>
                    <h3
                      className={`text-[20px] lg:text-[22px] font-semibold tracking-tight mb-3 ${
                        isCanvas ? 'text-primary' : 'text-text-primary'
                      }`}
                    >
                      {t(`compare.${mode}.title`)}
                    </h3>
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
          <SectionIntro eyebrow={t('howEyebrow')} title={t('howTitle')} desc={t('howDesc')} />

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {['open', 'arrange', 'watch'].map((k, i) => {
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

      {/* O que tem dentro */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('featuresEyebrow')} title={t('featuresTitle')} />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {['terminals', 'files', 'layout', 'contained', 'local', 'updates'].map((k, i) => {
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

      {/* Atalhos */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('shortcutsEyebrow')} title={t('shortcutsTitle')} />

          <Reveal delay={100}>
            <div
              className="rounded-2xl overflow-hidden max-w-3xl"
              style={{
                background: 'hsl(55 100% 97%)',
                border: '1px solid rgba(25,25,24,0.08)',
              }}
            >
              {SHORTCUTS.map((key, i) => (
                <div
                  key={key}
                  className="flex items-center gap-5 px-6 py-4"
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid rgba(25,25,24,0.07)',
                  }}
                >
                  <kbd
                    className="font-mono text-[13px] px-2.5 py-1.5 rounded-md shrink-0 min-w-[64px] text-center text-text-primary"
                    style={{
                      background: 'rgba(25,25,24,0.05)',
                      border: '1px solid rgba(25,25,24,0.09)',
                    }}
                  >
                    {key}
                  </kbd>
                  <span className="text-[15px] text-text-primary leading-[1.5]">
                    {t(`shortcuts.${i}`)}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Preço */}
      <section className="bg-surface-elevated">
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
      <section id="baixar" className="bg-surface-base scroll-mt-24">
        <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <SectionIntro eyebrow={t('downloadEyebrow')} title={t('downloadTitle')} />

          <DownloadPicker downloads={SIMBOS_DOWNLOADS} namespace="AppSimbos" />

          <Reveal delay={200}>
            <div
              className="mt-8 lg:mt-10 rounded-2xl px-6 lg:px-8 py-6 lg:py-7"
              style={{
                background: 'hsl(55 100% 97%)',
                border: '1px solid rgba(25,25,24,0.08)',
              }}
            >
              <p className="font-mono text-[11px] text-primary uppercase tracking-widest mb-3">
                {t('installTitle')}
              </p>
              <p className="text-[15px] lg:text-[16px] text-text-primary leading-[1.6] mb-4">
                {t('installMac')}
              </p>
              <p className="text-[15px] lg:text-[16px] text-text-primary leading-[1.6]">
                {t('installWin')}
              </p>
              <p className="font-mono text-[11px] text-text-secondary mt-5">
                {t('versionLabel', { version: SIMBOS_VERSION })}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <ProductFAQ eyebrow={t('faqEyebrow')} title={t('faqTitle')} faqs={faqs} surface="base" />

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
