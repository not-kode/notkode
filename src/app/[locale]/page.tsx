import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/home/hero';
import { TrustBand } from '@/components/home/trust-band';
import { ServicesList } from '@/components/home/services-list';
import { Testimonials } from '@/components/home/testimonials';
import { FeaturedCase } from '@/components/home/featured-case';
import { Process } from '@/components/home/process';
import { AgencyBanner } from '@/components/home/agency-banner';
import { FinalCTA } from '@/components/home/final-cta';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero locale={locale} />
      <TrustBand locale={locale} />
      <ServicesList locale={locale} />
      <Testimonials locale={locale} />
      <FeaturedCase locale={locale} />
      <Process locale={locale} />
      <AgencyBanner locale={locale} />
      <FinalCTA locale={locale} />
    </>
  );
}
