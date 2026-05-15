import { getTranslations } from 'next-intl/server';
import { SectionMarker } from '@/components/ui/section-marker';
import { ProductScrollShowcaseLazy as ProductScrollShowcase } from '@/components/home/product-scroll-showcase-lazy';

interface ProductShowcaseProps {
  locale: string;
  eyebrow?: string;
  titleMain?: string;
  titleAccent?: string;
  markerNumber?: string;
}

export async function ProductShowcase({
  locale,
  eyebrow,
  titleMain,
  titleAccent,
  markerNumber = '01',
}: ProductShowcaseProps) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  const features = [
    { title: t('feature1Title'), desc: t('feature1Desc') },
    { title: t('feature2Title'), desc: t('feature2Desc') },
    { title: t('feature3Title'), desc: t('feature3Desc') },
    { title: t('feature4Title'), desc: t('feature4Desc') },
  ];

  const label       = eyebrow    ?? t('showcaseEyebrow');
  const headingMain = titleMain  ?? 'Um sistema. Sua operação';
  const headingAccent = titleAccent ?? 'inteira.';

  return (
    <section className="relative overflow-hidden bg-surface-elevated">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">

        {/* Section header */}
        <div className="mb-12">
          <SectionMarker number={markerNumber} label={label} />
          <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4">
            {headingMain}{' '}
            <span className="font-bricolage">{headingAccent}</span>
          </h2>
        </div>

        {/* Scroll-sticky showcase */}
        <ProductScrollShowcase
          features={features}
          cta={t('showcaseCta')}
          ctaHref="/sistemas-ia"
        />

      </div>
    </section>
  );
}
