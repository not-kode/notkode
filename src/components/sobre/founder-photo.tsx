'use client';

import Image from 'next/image';
import { useState } from 'react';

interface FounderPhotoProps {
  src: string;
  alt: string;
  initials: string;
  accent: string;
  size?: 'compact' | 'full';
}

export function FounderPhoto({ src, alt, initials, accent, size = 'compact' }: FounderPhotoProps) {
  const [errored, setErrored] = useState(false);

  const dims = size === 'compact'
    ? 'w-[140px] h-[170px] lg:w-[160px] lg:h-[195px]'
    : 'aspect-[4/5] w-full';

  return (
    <div className={`relative overflow-hidden rounded-xl bg-surface-sunken shrink-0 ${dims}`}>
      {/* Gradient fallback */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}88 100%)` }}
      >
        <span className="font-bricolage text-white font-bold text-[3rem] opacity-80">
          {initials}
        </span>
      </div>

      {/* Real photo — only shown when not errored */}
      {!errored && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="200px"
          className="object-cover object-center"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
