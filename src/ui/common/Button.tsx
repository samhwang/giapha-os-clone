import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

import { cn } from '../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-default shrink-0 gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'border border-border-strong text-text-secondary bg-surface-primary hover:bg-surface-muted shadow-sm hover:shadow-md rounded-full hover:-translate-y-0.5',
        primary:
          'border border-transparent text-white bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-sm hover:shadow-md rounded-full hover:-translate-y-0.5',
        secondary:
          'border border-transparent text-white bg-linear-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 shadow-sm hover:shadow-md rounded-full hover:-translate-y-0.5',
        ghost: 'text-text-secondary hover:bg-surface-muted rounded-xl',
        danger: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 rounded-xl',
        dark: 'text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 rounded-xl hover:-translate-y-0.5',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-4 py-4 text-base-plus font-bold',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant, size, type = 'button', className, children, ...props }, ref): ReactNode => {
  return (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export { buttonVariants };
