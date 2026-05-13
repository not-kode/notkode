import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full font-label text-xs uppercase tracking-[0.08em] px-3 py-1 border',
  {
    variants: {
      variant: {
        primary: 'bg-primary/15 text-primary border-primary/30',
        neutral: 'bg-black/[0.06] text-text-secondary border-black/12',
        success: 'bg-success/15 text-success border-success/30',
        warning: 'bg-warning/15 text-warning border-warning/30',
        danger:  'bg-danger/15 text-danger border-danger/30',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
