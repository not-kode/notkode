import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'horizontal-white' | 'horizontal-dark' | 'vertical-light' | 'vertical-dark';
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const SRC: Record<NonNullable<LogoProps['variant']>, string> = {
  'horizontal-white': '/brand/logos/logo-horizontal-white.png',
  'horizontal-dark':  '/brand/logos/logo-horizontal-dark.png',
  'vertical-light':   '/brand/logos/logo-vertical-light.png',
  'vertical-dark':    '/brand/logos/logo-vertical-dark.png',
};

export function Logo({
  variant = 'horizontal-white',
  width = 140,
  height = 36,
  className,
  priority = false,
}: LogoProps) {
  return (
    <Image
      src={SRC[variant]}
      alt="Notkode"
      width={width}
      height={height}
      className={cn('h-auto w-auto', className)}
      priority={priority}
    />
  );
}
