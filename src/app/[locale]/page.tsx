import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { seoAlternates } from '@/lib/seo';
import { OrganizationJsonLd } from '@/components/seo/organization-jsonld';
import { Hero } from '@/components/home/hero';
import { TrustBand } from '@/components/home/trust-band';
import { AiActivation } from '@/components/home/ai-activation';
import { ServicesList } from '@/components/home/services-list';
import { Testimonials } from '@/components/home/testimonials';
import { FeaturedCase } from '@/components/home/featured-case';
import { Process } from '@/components/home/process';
import { AgencyBanner } from '@/components/home/agency-banner';
import { FinalCTA } from '@/components/home/final-cta';

// Título e descrição vêm do layout; aqui só a canônica/hreflang da raiz.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: seoAlternates(locale, '/') };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return (
    <>
      <OrganizationJsonLd description={t('description')} />
      <Hero locale={locale} />
      <TrustBand locale={locale} />
      <AiActivation locale={locale} />
      <ServicesList locale={locale} />
      <Testimonials locale={locale} />
      <FeaturedCase locale={locale} />
      <Process locale={locale} />
      <AgencyBanner locale={locale} />
      <FinalCTA locale={locale} />
    </>
  );
}
