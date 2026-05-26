import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';

export async function AgencyBanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  return (
    <section className="bg-surface-elevated">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">

          {/* LEFT — photo + grain + code editor (same style as Process) */}
          <Reveal distance={28}>
            <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] aspect-[5/6] sm:aspect-[4/3]">

              {/* Mountain photo */}
              <Image src="/images/generated/bg-hero.jpg" alt="" fill className="object-cover" />

              {/* Warm tint */}
              <div className="absolute inset-0" style={{ background: 'rgba(220,185,140,0.35)', mixBlendMode: 'multiply' }} />

              {/* Square grid pattern over photo */}
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
                                  linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
              }} />

              {/* Grain overlay */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'url(/images/relace-ref/grain.png)',
                backgroundRepeat: 'repeat',
                backgroundSize: '648px auto',
                mixBlendMode: 'multiply',
                opacity: 0.7,
              }} />

              {/* Partnership flow terminal */}
              <div className="absolute inset-0 flex items-center justify-center p-5 lg:p-8">
                <div
                  className="w-full max-w-[360px] rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    background: 'rgba(6,6,8,0.90)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {/* Chrome */}
                  <div className="flex items-center gap-1.5 px-4 h-9 border-b border-white/[0.06]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    <span className="font-mono text-[10px] text-white/20 ml-3">{t('agencyMockFile')}</span>
                  </div>
                  <div className="p-5 font-mono text-[11px] leading-[1.75] select-none">
                    <div className="text-white/30 mb-4">{t('agencyMockCmd')}</div>

                    <div className="flex items-center gap-0 mb-5">
                      <div className="text-center w-[100px]">
                        <div className="border border-white/15 rounded px-2 py-1.5">
                          <div className="text-white/25 text-[8px] mb-0.5 uppercase tracking-widest">{t('agencyMockYou')}</div>
                          <div className="text-white/60 font-semibold text-[10px]">{t('agencyMockAgency')}</div>
                        </div>
                        <div className="text-white/20 text-[9px] mt-1">{t('agencyMockAgencyTag')}</div>
                      </div>
                      <div className="text-white/20 px-1 text-[10px] mb-4">──▶</div>
                      <div className="text-center w-[106px]">
                        <div className="border border-primary/50 rounded px-2 py-1.5 bg-primary/15">
                          <div className="text-primary/60 text-[8px] mb-0.5 uppercase tracking-widest">{t('agencyMockBackstage')}</div>
                          <div className="text-primary font-semibold text-[10px]">Notkode</div>
                        </div>
                        <div className="text-primary/40 text-[9px] mt-1">{t('agencyMockBackstageTag')}</div>
                      </div>
                      <div className="text-white/20 px-1 text-[10px] mb-4">──▶</div>
                      <div className="text-center w-[100px]">
                        <div className="border border-white/15 rounded px-2 py-1.5">
                          <div className="text-white/25 text-[8px] mb-0.5 uppercase tracking-widest">{t('agencyMockResult')}</div>
                          <div className="text-white/60 font-semibold text-[10px]">{t('agencyMockClient')}</div>
                        </div>
                        <div className="text-white/20 text-[9px] mt-1">{t('agencyMockClientTag')}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                      <div><span className="text-[#22C55E]">✓ </span><span className="text-white/50">{t('agencyMockLine1')}</span></div>
                      <div><span className="text-[#22C55E]">✓ </span><span className="text-white/50">{t('agencyMockLine2')}</span></div>
                      <div><span className="text-primary">→ </span><span className="text-white/35">{t('agencyMockLine3')}<span className="cursor-blink">_</span></span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIG label */}
              <span className="absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase select-none">
                FIG. 002
              </span>
            </div>
          </Reveal>

          {/* RIGHT — text + CTA */}
          <Reveal delay={120}>
            <div>
              <div className="inline-flex items-center gap-2.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  {t('agencyEyebrow')}
                </span>
              </div>
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-4 mt-2">
                {t('agencyTitlePre')}{' '}
                <span className="font-bricolage">{t('agencyTitleAccent')}</span>{' '}
                {t('agencyTitlePost')}
              </h2>
              <p className="text-sm lg:text-base text-text-secondary leading-relaxed mb-8">
                {t('agencyDesc')}
              </p>
              <Link
                href="/parcerias"
                className="font-bricolage group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm uppercase tracking-wide hover:bg-primary/90 transition-colors"
              >
                {t('agencyCta')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
