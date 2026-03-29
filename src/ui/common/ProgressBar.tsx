import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  size?: 'sm' | 'md';
  delay?: number;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-1.5',
  md: 'h-2',
} as const;

export function ProgressBar({ value, max, color = 'bg-amber-400', size = 'md', delay = 0, className }: ProgressBarProps): ReactNode {
  const rawPercentage = max > 0 ? (value / max) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, rawPercentage));

  return (
    <div className={cn('bg-surface-muted rounded-full overflow-hidden', SIZE_MAP[size], className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-[600ms] ease-out', color)}
        style={{ width: `${percentage}%`, transitionDelay: delay > 0 ? `${delay}s` : undefined }}
      />
    </div>
  );
}
