import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CarinhaConfig {
  className: string;
  size: number;
  animation: 'float-soft' | 'float-soft-alt';
}

// Default scattered configuration — tuned for hero sections
const DEFAULT_CARINHAS: CarinhaConfig[] = [
  { className: 'top-[12%] left-[8%] opacity-[0.42]',  size: 56, animation: 'float-soft' },
  { className: 'top-[16%] right-[11%] opacity-[0.32]', size: 84, animation: 'float-soft' },
  { className: 'bottom-[14%] left-[14%] opacity-[0.28]', size: 68, animation: 'float-soft-alt' },
  { className: 'bottom-[18%] right-[9%] opacity-[0.50]', size: 48, animation: 'float-soft' },
  { className: 'top-[50%] left-[4%] opacity-[0.22]',  size: 34, animation: 'float-soft-alt' },
  { className: 'top-[44%] right-[5%] opacity-[0.18]', size: 42, animation: 'float-soft' },
  { className: 'top-[72%] left-[42%] opacity-[0.35]', size: 26, animation: 'float-soft' },
];

export function CarinhaFloat({ items = DEFAULT_CARINHAS }: { items?: CarinhaConfig[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((c, i) => (
        <Image
          key={i}
          src="/brand/carinha.png"
          alt=""
          width={c.size}
          height={c.size}
          className={cn(
            'absolute drop-shadow-[0_6px_24px_rgba(75,210,229,0.35)]',
            `animate-${c.animation}`,
            c.className
          )}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </div>
  );
}
