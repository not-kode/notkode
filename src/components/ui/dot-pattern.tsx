import { cn } from '@/lib/utils';

interface DotPatternProps {
  className?: string;
  size?: number;
  opacity?: number;
}

export function DotPattern({ className, size = 22, opacity = 0.045 }: DotPatternProps) {
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(25,25,24,${opacity}) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
