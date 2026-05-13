'use client';

// Mini project cards in continuous horizontal scroll — used in /cases hero
// Same color palette as the main grid for consistency
const PROJECTS = [
  { name: 'AutoAgentes',           metric: '+R$ 70k',     category: 'SaaS',        initial: 'AA', from: '#3B82F6', to: '#93C5FD' },
  { name: 'ZapInside',             metric: '3 semanas',   category: 'SaaS',        initial: 'ZI', from: '#22C55E', to: '#86EFAC' },
  { name: 'Ativa Clientes',        metric: '+R$ 40k',     category: 'SaaS',        initial: 'AC', from: '#F59E0B', to: '#FCD34D' },
  { name: 'Noodrops',              metric: '+R$ 80k/mês', category: 'E-commerce',  initial: 'ND', from: '#EC4899', to: '#F9A8D4' },
  { name: 'Ponto Patta',           metric: '+R$ 150k/mês',category: 'E-commerce',  initial: 'PP', from: '#8B5CF6', to: '#C4B5FD' },
  { name: 'Solojet Aviação',       metric: 'Multinacional',category: 'Website',    initial: 'SJ', from: '#06B6D4', to: '#67E8F9' },
  { name: 'Azure Investimentos',   metric: 'Assessoria BTG',category: 'Website',   initial: 'AZ', from: '#3B82F6', to: '#60A5FA' },
  { name: 'Agência Cotton',        metric: 'Branding',    category: 'Website',     initial: 'CT', from: '#F97316', to: '#FDBA74' },
  { name: 'Loss Prevention',       metric: 'Modernização',category: 'Website',     initial: 'LP', from: '#10B981', to: '#6EE7B7' },
  { name: 'Receba Seus Direitos',  metric: 'em breve',    category: 'Website',     initial: 'RD', from: '#A855F7', to: '#D8B4FE' },
];

const TRACK = [...PROJECTS, ...PROJECTS];

export function CasesMarquee() {
  return (
    <div className="overflow-hidden relative" style={{
      maskImage: 'linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)',
    }}>
      <div className="flex items-center w-max gap-4 lg:gap-5 animate-marquee hover:[animation-play-state:paused]">
        {TRACK.map((p, i) => (
          <article
            key={`${p.name}-${i}`}
            className="shrink-0 w-[210px] lg:w-[230px] rounded-2xl overflow-hidden border border-black/[0.08] hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
            style={{ background: 'hsl(55 100% 97%)' }}
          >
            {/* Gradient top with initials */}
            <div
              className="relative aspect-[4/3] flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)` }}
            >
              {/* Dot pattern overlay */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
                  backgroundSize: '16px 16px',
                }}
              />
              <span
                className="font-bricolage text-white text-[2.5rem] font-bold tracking-tight relative"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
              >
                {p.initial}
              </span>
              <span className="absolute top-2.5 right-2.5 font-mono text-[9px] text-white/75 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm">
                {p.category}
              </span>
            </div>
            {/* Footer with name + metric */}
            <div className="p-3.5">
              <p className="text-[13px] font-semibold text-text-primary leading-tight mb-1 truncate">
                {p.name}
              </p>
              <p className="font-mono text-[11px] text-primary font-semibold leading-tight">
                {p.metric}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
