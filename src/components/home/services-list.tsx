import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Bot, Globe, ShoppingCart, Palette, MonitorDot } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SectionMarker } from '@/components/ui/section-marker';
import { Reveal } from '@/components/ui/reveal';

export async function ServicesList({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  const services = [
    {
      href: '/sistemas-ia' as const,
      icon: MonitorDot,
      title: t('serviceSistemasTitle'),
      desc: t('serviceSistemasDesc'),
      cmd: 'systems',
      featured: true,
    },
    {
      href: '/sites' as const,
      icon: Globe,
      title: t('serviceSitesTitle'),
      desc: t('serviceSitesDesc'),
      cmd: 'sites',
      featured: false,
    },
    {
      href: '/ecommerce' as const,
      icon: ShoppingCart,
      title: t('serviceEcommerceTitle'),
      desc: t('serviceEcommerceDesc'),
      cmd: 'shop',
      featured: false,
    },
    {
      href: '/agentes-automacao' as const,
      icon: Bot,
      title: t('serviceAgentesTitle'),
      desc: t('serviceAgentesDesc'),
      cmd: 'agents',
      featured: false,
    },
    {
      href: '/brandbook' as const,
      icon: Palette,
      title: t('serviceBrandbookTitle'),
      desc: t('serviceBrandbookDesc'),
      cmd: 'brand',
      featured: false,
    },
  ];

  return (
    <section id="servicos" className="bg-surface-elevated scroll-mt-24">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionMarker number="03" label={t('servicesEyebrow')} />
              <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mb-4">
                Tudo que sua empresa precisa,{' '}
                <span className="font-bricolage font-normal">sob medida</span>.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed">
                {t('servicesDesc')}
              </p>
            </div>
          </Reveal>

          <div className="border-hairline rounded-xl bg-surface-elevated/80 backdrop-blur-sm divide-y divide-black/[0.09]">
            {services.map((s, i) => (
              <Reveal key={s.href} delay={i * 100}>
                <Link
                  href={s.href}
                  className={`group flex items-start gap-5 p-6 lg:p-8 transition-all first:rounded-t-xl last:rounded-b-xl ${s.featured ? 'bg-primary/[0.04] hover:bg-primary/[0.07]' : 'hover:bg-black/[0.03]'}`}
                >
                  <div className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-500 ${s.featured ? 'bg-primary/15 border border-primary/25 group-hover:bg-primary/25' : 'border-hairline-strong bg-black/[0.04] group-hover:border-primary/40 group-hover:bg-primary/10'}`}>
                    <s.icon className="w-5 h-5 text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                        {s.title}
                      </h3>
                      <span className="font-mono text-[10px] text-text-dim">{`/${s.cmd}`}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                  <ArrowUpRight
                    className="w-5 h-5 text-text-muted flex-shrink-0 transition-all duration-500 group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
