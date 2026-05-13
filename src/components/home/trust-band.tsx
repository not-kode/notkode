import { getTranslations } from 'next-intl/server';

interface Client {
  name: string;
  logo: string;
}

const CLIENTS: Client[] = [
  { name: 'Azure Investimentos',  logo: '/images/logos/logos8.png'  },
  { name: 'Noodrops',             logo: '/images/logos/logos1.png'  },
  { name: 'Solojet Aviação',      logo: '/images/logos/logos2.png'  },
  { name: 'Agência Cotton',       logo: '/images/logos/logos4.png'  },
  { name: 'Receba Seus Direitos', logo: '/images/logos/logos5.png'  },
  { name: 'SimbOS',               logo: '/images/logos/logos6.png'  },
  { name: 'Blindy',               logo: '/images/logos/logos7.png'  },
  { name: 'Loss Prevention',      logo: '/images/logos/logos10.png' },
  { name: 'Tonelotto Advogados',  logo: '/images/logos/logos3.png'  },
  { name: 'Fokus',                logo: '/images/logos/logos9.png'  },
];

const TRACK = [...CLIENTS, ...CLIENTS];

export async function TrustBand({ locale }: { locale: string }) {
  await getTranslations({ locale, namespace: 'Home' });

  return (
    <section className="bg-surface-base overflow-hidden">
      <div className="py-14 lg:py-20">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="flex items-center gap-10 lg:gap-16">

            {/* Label */}
            <div className="shrink-0 max-w-[130px] lg:max-w-[148px]">
              <p className="text-[11px] text-text-dim leading-[1.6] tracking-wide uppercase">
                empresas que<br />confiaram na<br />Notkode.
              </p>
            </div>

            {/* Divider */}
            <div className="shrink-0 w-px h-10 bg-black/[0.10]" />

            {/* Scrolling logos */}
            <div
              className="flex-1 overflow-hidden"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)',
              }}
            >
              <div className="flex items-center w-max animate-marquee hover:[animation-play-state:paused]">
                {TRACK.map((client, i) => (
                  <div
                    key={`${client.name}-${i}`}
                    className="flex items-center justify-center mx-10 shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="h-8 lg:h-9 w-auto select-none transition-opacity duration-300 opacity-50 hover:opacity-80"
                      style={{ mixBlendMode: 'multiply' }}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
