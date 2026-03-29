import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

const cardVariants = cva('rounded-card border overflow-hidden transition-all duration-default', {
  variants: {
    variant: {
      glass: 'bg-surface-glass backdrop-blur-md border-border-default shadow-card',
      elevated: 'bg-surface-elevated backdrop-blur-md border-border-default shadow-card',
    },
    interactive: {
      true: 'hover:border-border-hover hover:shadow-card-hover hover:bg-surface-glass-hover',
      false: '',
    },
  },
  defaultVariants: { variant: 'glass', interactive: false },
});

type CardVariants = VariantProps<typeof cardVariants>;

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, CardVariants {}

export function Card({ variant, interactive, children, className, ...props }: CardProps): ReactNode {
  return (
    <div className={cn(cardVariants({ variant, interactive }), className)} {...props}>
      {children}
    </div>
  );
}

export { cardVariants };
