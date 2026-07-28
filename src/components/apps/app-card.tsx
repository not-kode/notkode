import Image from 'next/image';
import { ArrowUpRight, Star } from 'lucide-react';
import type { NotkodeApp } from '@/data/apps';

export type AppCardProps = {
  app: NotkodeApp;
  name: string;
  tagline: string;
  description: string;
  /** Rótulos já traduzidos das plataformas, na ordem de `app.platforms`. */
  platformLabels: string[];
  ctaLabel: string;
  /** Sufixo do selo de avaliação, ex.: "avaliações". */
  ratingSuffix: string;
};

export function AppCard({
  app,
  name,
  tagline,
  description,
  platformLabels,
  ctaLabel,
  ratingSuffix,
}: AppCardProps) {
  return (
    <a
      href={app.href}
      target="_blank"
      rel="noopener noreferrer"
      data-cta={`app-card/${app.id}`}
      className="group flex flex-col h-full rounded-2xl p-6 lg:p-7 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'hsl(55 100% 97%)',
        border: '1px solid rgba(25,25,24,0.08)',
        boxShadow: '0 6px 20px -10px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        {/* Ícone real do app. Fundo neutro só aparece nos ícones com transparência;
            os quadrados das lojas preenchem o container inteiro. */}
        <div
          className="w-14 h-14 rounded-xl overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{ background: 'rgba(25,25,24,0.04)', border: '1px solid rgba(25,25,24,0.06)' }}
        >
          <Image
            src={app.icon}
            alt={name}
            width={112}
            height={112}
            className="w-full h-full object-contain"
          />
        </div>

        {app.rating && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" strokeWidth={0} />
            <span className="font-mono text-[12px] text-text-primary font-medium">
              {app.rating.score}
            </span>
            <span className="font-mono text-[11px] text-text-secondary">
              · {app.rating.count} {ratingSuffix}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-[20px] lg:text-[22px] font-semibold tracking-tight text-text-primary mb-1.5 group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="font-mono text-[11px] text-primary uppercase tracking-widest mb-4">
        {tagline}
      </p>

      <p className="text-[15px] lg:text-[16px] text-text-primary leading-[1.6] mb-6 flex-1">
        {description}
      </p>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {platformLabels.map((label) => (
            <span
              key={label}
              className="font-mono text-[11px] uppercase tracking-wide px-2 py-1 rounded-md text-text-secondary"
              style={{ background: 'rgba(25,25,24,0.05)' }}
            >
              {label}
            </span>
          ))}
        </div>

        <span className="font-bricolage inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-primary shrink-0">
          {ctaLabel}
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  );
}
