import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft, ArrowRight, ExternalLink, Quote } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/reveal';
import { CASES, getCaseBySlug, getAdjacentCases } from '@/data/cases';
import { FinalCTA } from '@/components/home/final-cta';

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = getCaseBySlug(slug);
  if (!item) notFound();

  const { prev, next } = getAdjacentCases(slug);

  return (
    <>
      {/* ── Hero — colored top with case name + meta ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${item.accentFrom} 0%, ${item.accentTo} 100%)`,
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative z-10 container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-20 lg:pb-24">
          {/* Back link */}
          <Reveal>
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 text-white/75 hover:text-white text-[12px] font-mono mb-8 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Todos os cases
            </Link>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-end">
            {/* Title block */}
            <Reveal delay={100}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-mono text-[10px] text-white/75 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm uppercase tracking-widest">
                  {item.category}
                </span>
                <span className="font-mono text-[10px] text-white/75">{item.year}</span>
                {item.pending && (
                  <span className="font-mono text-[10px] text-white/80 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm uppercase tracking-widest">
                    em breve
                  </span>
                )}
              </div>
              <h1 className="font-bricolage text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-bold leading-none tracking-[-0.04em] text-white mb-5">
                {item.name}
              </h1>
              <p className="text-[17px] lg:text-[19px] text-white/85 leading-[1.55] max-w-2xl">
                {item.description}
              </p>
            </Reveal>

            {/* Big initial badge */}
            <Reveal delay={200}>
              <div
                className="hidden lg:flex w-32 h-32 rounded-3xl items-center justify-center backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span
                  className="font-bricolage text-[3rem] font-bold text-white tracking-tight"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
                >
                  {item.initial}
                </span>
              </div>
            </Reveal>
          </div>

          {/* Quick meta bar */}
          {item.liveUrl && (
            <Reveal delay={280}>
              <div className="mt-10 pt-6 border-t border-white/20 flex flex-wrap items-center gap-5">
                <a
                  href={item.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bricolage inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-text-primary font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px transition-all duration-200"
                >
                  Ver projeto ao vivo
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Pending state ── */}
      {item.pending && (
        <section className="bg-surface-base">
          <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-28">
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4">
                ❯ conteúdo em coleta
              </p>
              <h2 className="text-[1.5rem] lg:text-[1.75rem] font-semibold tracking-tight text-text-primary mb-4">
                Estamos finalizando este case.
              </h2>
              <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
                Em breve traremos detalhes do desafio, solução, métricas reais e depoimento do cliente. Enquanto isso, você pode conhecer outros projetos ou visitar o site ao vivo.
              </p>
              <Link
                href="/cases"
                className="font-bricolage inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-wide hover:-translate-y-px transition-all duration-200"
              >
                Ver outros cases
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Metrics row ── */}
      {!item.pending && item.detailMetrics && (
        <section className="bg-surface-base">
          <div className="container mx-auto px-5 lg:px-8 py-16 lg:py-20">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
              {item.detailMetrics.map((m, i) => (
                <Reveal key={m.label} delay={i * 80}>
                  <div className="text-center">
                    <div className="font-bricolage text-[2.25rem] lg:text-[2.75rem] font-bold text-primary leading-none mb-2 tracking-tight">
                      {m.value}
                    </div>
                    <div className="font-mono text-[12px] text-text-muted">
                      {m.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Problem / Solution ── */}
      {!item.pending && (item.problem || item.solution) && (
        <section className="bg-surface-elevated">
          <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 max-w-5xl mx-auto">
              {item.problem && (
                <Reveal>
                  <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">
                    {'// Desafio'}
                  </p>
                  <p className="text-[17px] lg:text-[19px] text-text-primary leading-[1.55]">
                    {item.problem}
                  </p>
                </Reveal>
              )}
              {item.solution && (
                <Reveal delay={150}>
                  <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-3">
                    {'// Solução'}
                  </p>
                  <p className="text-[17px] lg:text-[19px] text-text-primary leading-[1.55]">
                    {item.solution}
                  </p>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Stack ── */}
      {!item.pending && (
        <section className="bg-surface-base">
          <div className="container mx-auto px-5 lg:px-8 py-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-4">
                ❯ tecnologias usadas
              </p>
              <h2 className="text-[1.5rem] lg:text-[1.9rem] font-semibold tracking-tight text-text-primary mb-8">
                Construído com{' '}
                <span className="font-bricolage">{item.stack.length} ferramentas integradas.</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {item.stack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[13px] text-text-secondary px-4 py-2 rounded-lg"
                    style={{
                      background: 'hsl(55 100% 97%)',
                      border: '1px solid rgba(25,25,24,0.10)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Quote ── */}
      {!item.pending && item.quote && (
        <section className="bg-surface-elevated">
          <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-28">
            <Reveal>
              <article
                className="max-w-3xl mx-auto rounded-2xl p-8 lg:p-12 relative"
                style={{ background: 'hsl(55 100% 97%)', border: '1px solid rgba(25,25,24,0.08)' }}
              >
                <Quote className="w-10 h-10 text-primary/40 mb-5" strokeWidth={1.3} />
                <p className="text-[19px] lg:text-[22px] text-text-primary leading-[1.5] tracking-tight mb-6">
                  &ldquo;{item.quote.text}&rdquo;
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[12px]">
                      {item.quote.author.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[14px] text-text-primary">{item.quote.author}</div>
                    <div className="font-mono text-[11px] text-text-muted">{item.quote.role}</div>
                  </div>
                </footer>
              </article>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Prev / Next navigation ── */}
      <section className="bg-surface-base">
        <div className="container mx-auto px-5 lg:px-8 py-12 lg:py-16">
          <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
            {prev && <NavCard direction="prev" item={prev} />}
            {next && <NavCard direction="next" item={next} />}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <FinalCTA locale={locale} />
    </>
  );
}

function NavCard({ direction, item }: { direction: 'prev' | 'next'; item: ReturnType<typeof getCaseBySlug> }) {
  if (!item) return null;
  const isPrev = direction === 'prev';
  return (
    <Link
      href={{ pathname: '/cases/[slug]', params: { slug: item.slug } }}
      className={`group rounded-2xl border border-black/[0.08] p-5 lg:p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ${isPrev ? '' : 'md:text-right'}`}
      style={{ background: 'hsl(55 100% 97%)' }}
    >
      <p className={`font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3 inline-flex items-center gap-2 ${isPrev ? '' : 'md:flex-row-reverse'}`}>
        {isPrev ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
        {isPrev ? 'Anterior' : 'Próximo'}
      </p>
      <p className="text-[17px] font-semibold tracking-tight text-text-primary group-hover:text-primary transition-colors">
        {item.name}
      </p>
      <p className="font-mono text-[11px] text-text-muted mt-1">{item.category} · {item.year}</p>
    </Link>
  );
}
