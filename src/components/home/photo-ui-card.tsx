import Image from 'next/image';

interface PhotoUiCardProps {
  /** Background photo path under /public */
  photo: string;
  photoAlt?: string;
  /** Aspect ratio class, e.g. "aspect-[16/7]" */
  aspect?: string;
  children: React.ReactNode;
}

/**
 * Relace.ai-style composite: photographic background + grain overlay + UI panel on top.
 */
export function PhotoUiCard({
  photo,
  photoAlt = '',
  aspect = 'aspect-[16/7]',
  children,
}: PhotoUiCardProps) {
  return (
    <div className={`relative w-full ${aspect} rounded-2xl overflow-hidden border-hairline shadow-lg shadow-black/[0.07]`}>
      {/* Photo background */}
      <Image
        src={photo}
        alt={photoAlt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 90vw"
      />

      {/* Grain overlay — SVG noise pattern, matches relace.ai texture */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          mixBlendMode: 'overlay',
          opacity: 0.55,
        }}
        aria-hidden
      />

      {/* Dark vignette for contrast */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(15,12,8,0.25) 0%, rgba(15,12,8,0.1) 40%, rgba(15,12,8,0.35) 100%)',
        }}
        aria-hidden
      />

      {/* UI content — sits above photo + grain */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-6 lg:p-10">
        {children}
      </div>
    </div>
  );
}
