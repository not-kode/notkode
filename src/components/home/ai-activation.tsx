import { getTranslations } from 'next-intl/server';
import { Stethoscope, Map, Wrench, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

export async function AiActivation({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  const steps: { title: string; desc: string; cmd: string; icon: LucideIcon }[] = [
    { title: t('activationStep1Title'), desc: t('activationStep1Desc'), cmd: 'diagnose', icon: Stethoscope },
    { title: t('activationStep2Title'), desc: t('activationStep2Desc'), cmd: 'map', icon: Map },
    { title: t('activationStep3Title'), desc: t('activationStep3Desc'), cmd: 'build', icon: Wrench },
  ];

  return (
    <section className="bg-surface-base scroll-mt-24">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 bg-black/[0.04] border border-black/[0.08]">
              <span className="font-mono text-[11px] text-text-secondary tracking-tight">
                <span className="text-text-dim">{'❯ '}</span>
                {t('activationEyebrow')}
              </span>
            </div>
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-4">
              {t('activationTitlePre')}{' '}
              <span className="font-bricolage font-normal text-primary">{t('activationTitleAccent')}</span>
            </h2>
            <p className="text-base lg:text-lg text-text-secondary leading-relaxed">
              {t('activationDesc')}
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 mt-14 lg:mt-16">
          {steps.map((step, i) => (
            <Reveal key={step.cmd} delay={i * 120}>
              <div className="group h-full rounded-2xl border-hairline bg-surface-elevated/80 p-7 lg:p-8 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20">
                    <step.icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                  </div>
                  <span className="font-mono text-[11px] text-text-dim">{`0${i + 1} / 03`}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <span className="font-mono text-[10px] text-text-dim">{`> ${step.cmd}`}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-12 lg:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <p className="text-sm lg:text-base text-text-secondary">
              {t('activationCtaText')}
            </p>
            <a
              href={`https://wa.me/5511951381254?text=${encodeURIComponent(t('activationCtaWhatsappMessage'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-[13px] uppercase tracking-wide hover:-translate-y-px hover:bg-[#20BD5A] transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              {t('activationCtaButton')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
