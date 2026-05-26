import { Sliders, Network, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/ui/reveal';

const PILLAR_ICONS = [Sliders, Network, Sparkles] as const;

export async function SistemaSobMedida() {
  const t = await getTranslations('SistemasIA');

  const pillars = [1, 2, 3].map((n, i) => ({
    Icon: PILLAR_ICONS[i],
    title: t(`sobMedidaPillar${n}Title` as 'sobMedidaPillar1Title'),
    body: t(`sobMedidaPillar${n}Body` as 'sobMedidaPillar1Body'),
  }));

  return (
    <section className="bg-surface-base overflow-hidden">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <div className="max-w-3xl mb-14 lg:mb-20">
            <p className="font-mono text-[10.5px] text-text-dim uppercase tracking-widest mb-4">
              {t('sobMedidaEyebrow')}
            </p>
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em] mb-5">
              <span className="block">{t('sobMedidaTitleLine1')}</span>
              <span className="block">
                {t('sobMedidaTitleLine2Before')}
                <span className="font-bricolage">{t('sobMedidaTitleAccent')}</span>
              </span>
            </h2>
            <p className="text-[16px] lg:text-[18px] text-text-secondary leading-[1.6] max-w-2xl">
              {t('sobMedidaSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {pillars.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 120}>
              <article
                className="h-full rounded-2xl p-6 lg:p-7 transition-all duration-300 hover:-translate-y-px"
                style={{
                  background: 'hsl(55 100% 97%)',
                  border: '1px solid rgba(25,25,24,0.08)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(75,210,229,0.12)',
                    border: '1px solid rgba(75,210,229,0.22)',
                  }}
                >
                  <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-[17px] lg:text-[18px] font-semibold tracking-tight text-text-primary leading-snug mb-2.5">
                  {title}
                </h3>
                <p className="text-[14.5px] text-text-secondary leading-[1.6]">
                  {body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
