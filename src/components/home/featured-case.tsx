import { getTranslations } from 'next-intl/server';
import { Quote } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';

export async function FeaturedCase({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  return (
    <section id="cases" className="relative overflow-hidden bg-surface-base scroll-mt-24">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
              {t('caseEyebrow')}
            </span>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 mt-10">
          <Reveal>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em]">
                  <span className="font-bricolage">{t('caseTitle')}</span>
                </h2>
                <span className="font-mono text-xs text-text-muted px-3 py-1 rounded-full border-hairline-strong">
                  {t('caseSegment')}
                </span>
              </div>

              <div className="space-y-6 text-text-secondary leading-relaxed max-w-xl mb-10">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim block mb-2">
                    {'// problema'}
                  </span>
                  <p className="text-base">{t('caseProblem')}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim block mb-2">
                    {'// solução'}
                  </span>
                  <p className="text-base text-text-primary">{t('caseSolution')}</p>
                </div>
              </div>

              <blockquote className="relative pl-6 border-l-2 border-primary/40 max-w-xl">
                <Quote className="absolute -left-3 -top-1 w-5 h-5 text-primary bg-surface-base" />
                <p className="text-base text-text-primary italic mb-3 leading-relaxed">
                  {t('caseQuote')}
                </p>
                <footer className="font-mono text-xs text-text-muted">
                  <span className="text-text-primary font-semibold">{t('caseAuthor')}</span>
                  {' · '}
                  {t('caseAuthorRole')}
                </footer>
              </blockquote>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="lg:pl-8 lg:border-l lg:border-black/10">
              <div className="space-y-8">
                <Metric num="01" value={t('caseMetric1Value')} label={t('caseMetric1Label')} />
                <Metric num="02" value={t('caseMetric2Value')} label={t('caseMetric2Label')} />
                <Metric num="03" value={t('caseMetric3Value')} label={t('caseMetric3Label')} />
              </div>

            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Metric({ num, value, label }: { num: string; value: string; label: string }) {
  return (
    <div>
      <span className="font-mono text-[10px] text-text-dim block mb-2">{`// ${num}`}</span>
      <div className="text-3xl md:text-[2.25rem] font-light text-text-primary leading-none mb-2 tracking-tight">
        {value}
      </div>
      <div className="font-mono text-[12px] text-text-muted lowercase tracking-tight">
        {label.toLowerCase()}
      </div>
    </div>
  );
}
