import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return {
    title: t('metaTitle'),
    description: t('soon'),
    robots: { index: false, follow: false },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Blog' });

  return (
    <section className="bg-surface-base">
      <div className="container mx-auto px-5 lg:px-8 pt-32 lg:pt-40 pb-32 lg:pb-40 text-center max-w-xl">
        <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">{t('eyebrow')}</p>
        <h1 className="text-[2rem] md:text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] mb-4">
          {t('titlePre')} <span className="font-bricolage">{t('titleAccent')}</span>
        </h1>
        <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed">{t('desc')}</p>
      </div>
    </section>
  );
}
