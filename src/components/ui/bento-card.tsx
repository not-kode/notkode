import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const bentoCardVariants = cva(
  'relative overflow-hidden rounded-2xl border transition-all duration-300 ' +
    'flex flex-col group',
  {
    variants: {
      tone: {
        // Default glass — for most cards
        glass:
          'bg-white/4 backdrop-blur-glass border-white/8 hover:border-primary/40 hover:-translate-y-1',
        // Solid elevated — clean look
        solid:
          'bg-neutral-800 border-white/5 hover:border-primary/40 hover:-translate-y-1',
        // Flagship — strongest visual weight
        flagship:
          'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/30 hover:border-primary/60 hover:shadow-glow',
        // Vivid — primary cyan background, for CTA cards
        vivid:
          'bg-gradient-brand text-navy border-transparent hover:scale-[1.02]',
        // Dark feature — for metric/highlight cards
        dark:
          'bg-neutral-950 border-white/8 hover:border-primary/40 hover:-translate-y-1',
      },
      padding: {
        sm: 'p-5',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: { tone: 'glass', padding: 'md' },
  }
);

export interface BentoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoCardVariants> {
  as?: 'div' | 'article' | 'section';
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, tone, padding, as: Component = 'div', ...props }, ref) => {
    const Tag = Component as React.ElementType;
    return (
      <Tag
        ref={ref}
        className={cn(bentoCardVariants({ tone, padding }), className)}
        {...props}
      />
    );
  }
);
BentoCard.displayName = 'BentoCard';
