import { Reveal } from '@/components/ui/reveal';

export type SectionIntroProps = {
  eyebrow: string;
  title: string;
  /** Texto de apoio. Sem ele, o título ocupa a abertura sozinho. */
  desc?: string;
};

/**
 * Abertura de seção das páginas de produto.
 *
 * Título e apoio ficam lado a lado quando há os dois. Empilhados numa coluna só,
 * o parágrafo parava perto da metade da tela e deixava o resto da linha vazio,
 * o que dava à seção um ar de inacabada.
 */
export function SectionIntro({ eyebrow, title, desc }: SectionIntroProps) {
  return (
    <Reveal>
      <div
        className={
          desc
            ? 'grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-14 items-end mb-12 lg:mb-14'
            : 'mb-12 lg:mb-14'
        }
      >
        <div>
          <p className="font-mono text-[11px] text-primary uppercase tracking-widest mb-3">
            {eyebrow}
          </p>
          <h2
            className={`text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] ${
              desc ? '' : 'max-w-3xl'
            }`}
          >
            {title}
          </h2>
        </div>

        {desc && (
          <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6]">{desc}</p>
        )}
      </div>
    </Reveal>
  );
}
