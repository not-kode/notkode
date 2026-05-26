import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';
import { CountUp } from '@/components/ui/count-up';
import { TiltCard } from '@/components/ui/tilt-card';
import { DotPattern } from '@/components/ui/dot-pattern';
import { BrandbookHeroBackground } from '@/components/design/brandbook-hero-background';
import { BrandbookPreviewLazy as BrandbookPreview } from '@/components/design/brandbook-preview-lazy';
import { BrandbookPricingForm } from '@/components/brandbook/brandbook-pricing-form';
import { ProductFAQ } from '@/components/ui/product-faq';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Brandbook' });
  return { title: t('metaTitle'), description: t('metaDesc') };
}

export default async function BrandbookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Brandbook' });

  const BRANDBOOK_FAQS = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
  ];

  const STATS = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-surface-base">
        <BrandbookHeroBackground />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-16 lg:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-5">
                <span className="block mb-1">{t('heroTitleLine1')}</span>
                <span className="block">
                  {t('heroTitleLine2')} <span className="font-bricolage">{t('heroTitleAccent')}</span>
                </span>
              </h1>
              <p className="text-[16px] lg:text-[18px] text-text-secondary leading-[1.6] mx-auto mb-7 max-w-xl">{t('heroDesc')}</p>

              <a
                href="#orcamento"
                className="font-bricolage inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-primary/90 transition-all duration-200"
              >
                {t('heroCta')}
                <ArrowDown className="w-4 h-4" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Preview do brandbook ── */}
      <section className="bg-surface-elevated">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-3">
                {t('previewTitlePre')}{' '}
                {t('previewTitleMid')} <span className="font-bricolage">{t('previewTitleAccent')}</span>
              </h2>
              <p className="text-[14px] lg:text-[15px] text-text-secondary leading-relaxed max-w-lg mx-auto">{t('previewDesc')}</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <BrandbookPreview />
          </Reveal>
        </div>
      </section>

      {/* ── Entregáveis ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em]">
                {t('deliverablesTitlePre')}{' '}
                {t('deliverablesTitleMid')} <span className="font-bricolage">{t('deliverablesTitleAccent')}</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">

            {/* Card 1 — Logo: fundo escuro, destaque */}
            <Reveal delay={0}>
              <TiltCard
                className="relative overflow-hidden rounded-2xl p-6 lg:p-8 h-full min-h-[240px]"
                style={{ background: '#191918', border: '1px solid rgba(255,255,255,0.08)' }}
                intensity={5}
              >
                {/* Marca geométrica — lado direito do card, sem tocar no texto */}
                <div className="absolute right-0 top-0 bottom-0 w-[45%] flex items-center justify-center pointer-events-none">
                  <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="opacity-30">
                    <circle cx="80" cy="80" r="70" stroke="#3B82F6" strokeWidth="2.5" />
                    <polygon points="80,20 136,116 24,116" stroke="#60A5FA" strokeWidth="2.5" fill="none" />
                    <circle cx="80" cy="80" r="20" stroke="#93C5FD" strokeWidth="2" />
                    <circle cx="80" cy="80" r="5" fill="#3B82F6" />
                  </svg>
                </div>
                {/* Fade suave entre texto e decoração */}
                <div className="absolute inset-y-0 right-[45%] w-16 pointer-events-none" style={{ background: 'linear-gradient(to right, #191918 0%, transparent 100%)' }} />
                <div className="relative z-10 max-w-[52%]">
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.16em] mb-5 block">01</span>
                  <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-white mb-2">{t('card1Title')}</h3>
                  <p className="text-[14px] text-white/60 leading-relaxed">{t('card1Desc')}</p>
                </div>
              </TiltCard>
            </Reveal>

            {/* Card 2 — Paleta + Tipografia: swatches reais visíveis + "Aa" grande */}
            <Reveal delay={80}>
              <TiltCard
                className="relative overflow-hidden rounded-2xl border border-black/[0.08] p-6 lg:p-8 h-full min-h-[240px] flex flex-col"
                style={{ background: 'hsl(55 100% 97%)' }}
                intensity={5}
              >
                {/* "Aa" grande como backdrop tipográfico */}
                <div
                  className="absolute right-2 top-2 font-bricolage font-bold leading-none pointer-events-none select-none"
                  style={{ fontSize: 120, color: '#191918', opacity: 0.06 }}
                >
                  Aa
                </div>
                <div className="relative z-10 flex flex-col flex-1">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-[0.16em] mb-5 block">02</span>
                  <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">{t('card2Title')}</h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed mb-5">{t('card2Desc')}</p>
                  {/* Swatches visíveis na parte inferior */}
                  <div className="mt-auto flex gap-2">
                    {[
                      { bg: '#191918', label: '#191918' },
                      { bg: '#3B82F6', label: '#3B82F6' },
                      { bg: '#60A5FA', label: '#60A5FA' },
                      { bg: '#F3F2E7', label: '#F3F2E7' },
                      { bg: '#FFFEF2', label: '#FFFEF2' },
                    ].map((s) => (
                      <div key={s.bg} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-full border border-black/10 shadow-sm"
                          style={{ background: s.bg }}
                        />
                        <span className="font-mono text-[8px] text-text-dim">{s.label.slice(0, 5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Card 3 — Brandbook completo: fundo azul suave, manual visível */}
            <Reveal delay={160}>
              <TiltCard
                className="relative overflow-hidden rounded-2xl border border-primary/20 p-6 lg:p-8 h-full min-h-[240px]"
                style={{ background: 'linear-gradient(145deg, rgba(59,130,246,0.07) 0%, hsl(55 100% 97%) 60%)' }}
                intensity={5}
              >
                {/* Manual ilustrado grande */}
                <svg
                  className="absolute right-3 bottom-3 pointer-events-none opacity-20"
                  width="160" height="160" viewBox="0 0 140 150" fill="none"
                >
                  <rect x="10" y="5" width="85" height="110" rx="5" stroke="#3B82F6" strokeWidth="2.5" fill="rgba(59,130,246,0.08)" />
                  <rect x="20" y="5" width="85" height="110" rx="5" stroke="#3B82F6" strokeWidth="2" fill="rgba(59,130,246,0.05)" />
                  <line x1="34" y1="30" x2="90" y2="30" stroke="#3B82F6" strokeWidth="2.5" />
                  <line x1="34" y1="46" x2="80" y2="46" stroke="#3B82F6" strokeWidth="1.5" />
                  <line x1="34" y1="58" x2="86" y2="58" stroke="#3B82F6" strokeWidth="1.5" />
                  <line x1="34" y1="70" x2="74" y2="70" stroke="#3B82F6" strokeWidth="1.5" />
                  <rect x="34" y="84" width="22" height="22" rx="3" stroke="#3B82F6" strokeWidth="1.5" fill="rgba(59,130,246,0.12)" />
                  <rect x="62" y="84" width="22" height="22" rx="3" stroke="#3B82F6" strokeWidth="1.5" fill="rgba(59,130,246,0.12)" />
                </svg>
                <div className="relative z-10">
                  <span className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.16em] mb-5 block">03</span>
                  <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">{t('card3Title')}</h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed max-w-xs">{t('card3Desc')}</p>
                </div>
              </TiltCard>
            </Reveal>

            {/* Card 4 — Aplicações: grid de mockups no lado direito */}
            <Reveal delay={240}>
              <TiltCard
                className="relative overflow-hidden rounded-2xl border border-black/[0.08] p-6 lg:p-8 h-full min-h-[240px]"
                style={{ background: 'hsl(55 100% 97%)' }}
                intensity={5}
              >
                {/* Grid ocupa o lado direito sem tocar no texto */}
                <div className="absolute right-0 top-0 bottom-0 w-[42%] flex items-center justify-center pointer-events-none opacity-[0.22]">
                  <svg width="140" height="120" viewBox="0 0 130 110" fill="none">
                    {[0, 1, 2].map((row) =>
                      [0, 1, 2].map((col) => (
                        <rect
                          key={`${row}-${col}`}
                          x={col * 44 + 2}
                          y={row * 36 + 2}
                          width="38"
                          height="30"
                          rx="6"
                          stroke="#191918"
                          strokeWidth="2"
                          fill="rgba(25,25,24,0.05)"
                        />
                      ))
                    )}
                  </svg>
                </div>
                {/* Fade entre texto e decoração */}
                <div className="absolute inset-y-0 right-[42%] w-12 pointer-events-none" style={{ background: 'linear-gradient(to right, hsl(55 100% 97%) 0%, transparent 100%)' }} />
                <div className="relative z-10 max-w-[55%]">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-[0.16em] mb-5 block">04</span>
                  <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-2">{t('card4Title')}</h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">{t('card4Desc')}</p>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats inline ── */}
      <section className="relative bg-surface-elevated border-t border-black/[0.05] overflow-hidden">
        <DotPattern />
        <div className="relative z-10 container mx-auto px-5 lg:px-8 py-14 lg:py-16">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-3xl mx-auto">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center">
                  <div className="font-bricolage text-[2.5rem] lg:text-[3rem] font-bold text-primary leading-none mb-2 tracking-tight">
                    <CountUp value={s.value} />
                  </div>
                  <div className="font-mono text-[12px] text-text-muted uppercase tracking-widest leading-snug">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ enxuta ── */}
      <ProductFAQ
        title={<><span className="block">{t('faqTitleLine1')}</span><span className="block font-bricolage">{t('faqTitleAccent')}</span></>}
        faqs={BRANDBOOK_FAQS}
        surface="elevated"
      />

      {/* ── Pricing form ── */}
      <section id="orcamento" className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-12">
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em]">
                <span className="block">{t('pricingTitleLine1')}</span>
                <span className="block font-bricolage">{t('pricingTitleAccent')}</span>
              </h2>
              <p className="mt-5 text-[15px] lg:text-[16px] text-text-secondary leading-relaxed max-w-2xl mx-auto">{t('pricingDesc')}</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <BrandbookPricingForm />
          </Reveal>
        </div>
      </section>

      {/* ── Link discreto pro combo ── */}
      <section className="bg-surface-elevated border-t border-black/[0.06]">
        <div className="container mx-auto px-5 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p className="font-mono text-[11px] text-text-dim">{t('comboLabel')}</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link href="/sites" className="text-[13px] text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                {t('comboLinkSite')} <ArrowUpRight className="w-3 h-3" />
              </Link>
              <span className="text-text-dim">·</span>
              <Link href="/sistemas-ia" className="text-[13px] text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                {t('comboLinkSistema')} <ArrowUpRight className="w-3 h-3" />
              </Link>
              <span className="text-text-dim">·</span>
              <Link href="/ecommerce" className="text-[13px] text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                {t('comboLinkLoja')} <ArrowUpRight className="w-3 h-3" />
              </Link>
              <span className="font-mono text-[11px] text-text-dim">{t('comboTag')}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
