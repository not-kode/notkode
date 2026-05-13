import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-xl transition-all duration-300', {
  variants: {
    variant: {
      solid: 'bg-surface-elevated border border-black/[0.08]',
      glass: 'glass shadow-glass',
      feature: 'bg-gradient-to-br from-primary/10 to-primary-soft/5 border border-primary/30',
    },
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    hover: {
      true: 'hover:-translate-y-1 hover:border-primary',
      false: '',
    },
  },
  defaultVariants: { variant: 'solid', padding: 'md', hover: false },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-bold mb-3', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-text-secondary', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';
