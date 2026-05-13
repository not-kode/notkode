import { setRequestLocale } from 'next-intl/server';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="container mx-auto px-5 lg:px-8 py-section-lg">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Blog</h1>
      <p className="text-lg text-text-secondary max-w-2xl">
        Grid de artigos por categoria. Conteúdo a desenvolver.
      </p>
    </section>
  );
}
