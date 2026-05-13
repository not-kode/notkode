import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-md border border-black/12 bg-black/[0.04] px-4 py-3 ' +
          'text-base text-text-primary placeholder:text-text-muted ' +
          'transition-all duration-150 ' +
          'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full min-h-[100px] rounded-md border border-black/12 bg-black/[0.04] px-4 py-3 ' +
        'text-base text-text-primary placeholder:text-text-muted resize-y ' +
        'transition-all duration-150 ' +
        'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block font-label uppercase tracking-[0.12em] text-xs text-text-secondary mb-2',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';
