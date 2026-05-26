import { getTranslations } from 'next-intl/server';
import { SectionMarker } from '@/components/ui/section-marker';
import { Reveal } from '@/components/ui/reveal';
import { TestimonialsCarousel } from '@/components/home/testimonials-carousel';

export async function Testimonials({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  const items = [
    { quote: t('testimonial1Quote'), author: t('testimonial1Author'), role: t('testimonial1Role') },
    { quote: t('testimonial3Quote'), author: t('testimonial3Author'), role: t('testimonial3Role') },
    { quote: t('testimonial4Quote'), author: t('testimonial4Author'), role: t('testimonial4Role') },
  ];

  return (
    <section className="relative bg-surface-elevated overflow-hidden">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">

        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-start">

          {/* LEFT — video in terminal */}
          <Reveal>
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Chrome bar */}
              <div
                className="flex items-center gap-1.5 px-4 h-10"
                style={{ background: 'rgba(14,14,18,0.96)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <span className="font-mono text-[10px] text-white/25 ml-3">{t('testimonialsVideoFile')}</span>
                <span className="font-mono text-[10px] text-white/15 ml-auto">{t('testimonialsVideoPlay')}</span>
              </div>

              {/* Video */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#0a0a0f' }}>
                <iframe
                  src="https://www.youtube.com/embed/YoIYH7y2p54?rel=0&modestbranding=1"
                  title={t('testimonialsVideoTitle')}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>

              {/* Footer bar */}
              <div
                className="flex items-center justify-between px-4 h-9"
                style={{ background: 'rgba(14,14,18,0.96)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="font-mono text-[10px] text-white/25">{t('testimonialsVideoUrl')}</span>
                <span className="font-mono text-[10px] text-white/20">{'// video testimonial'}</span>
              </div>
            </div>
          </Reveal>

          {/* RIGHT — eyebrow + title + carousel grouped */}
          <div className="flex flex-col">
            <Reveal>
              <SectionMarker number="05" label={t('testimonialsEyebrow')} />
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-4">
                <TestimonialsCarousel
                  items={items}
                  titleMain={t('testimonialsTitlePre')}
                  titleAccent={t('testimonialsTitleAccent')}
                />
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
