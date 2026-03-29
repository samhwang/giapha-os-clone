import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

const badgeVariants = cva('inline-flex items-center font-bold uppercase shadow-xs border', {
  variants: {
    color: {
      amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      stone: 'bg-stone-100 text-stone-500 border-border-default',
      sky: 'bg-sky-50 text-sky-700 border-sky-200/60',
      rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    },
    size: {
      sm: 'px-1.5 py-0.5 rounded text-3xs tracking-widest',
      md: 'px-2 py-0.5 rounded-badge text-2xs sm:text-xs-plus tracking-widest',
      detail: 'px-2 py-0.5 rounded-badge text-2xs sm:text-xs font-sans tracking-wider whitespace-nowrap',
    },
  },
  defaultVariants: { color: 'stone', size: 'md' },
});

type BadgeVariants = VariantProps<typeof badgeVariants>;

interface BadgeProps extends BadgeVariants {
  children: ReactNode;
  className?: string;
}

export function Badge({ color, size, children, className }: BadgeProps): ReactNode {
  return <span className={cn(badgeVariants({ color, size }), className)}>{children}</span>;
}

export { badgeVariants };
