import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ' +
    'rounded-full border border-transparent transition-all duration-200 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
    'disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'font-bricolage bg-gradient-brand text-white uppercase tracking-wide hover:-translate-y-0.5 hover:shadow-glow',
        secondary:
          'glass-strong text-text-primary border border-black/10 hover:border-primary hover:text-primary',
        outline:
          'border-primary text-primary hover:bg-primary hover:text-white',
        ghost:
          'bg-transparent text-text-secondary hover:bg-black/5 hover:text-text-primary',
        whatsapp:
          'bg-[#25D366] text-white hover:bg-[#1DAE52] hover:-translate-y-0.5',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { buttonVariants };
