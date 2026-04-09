import type { ReactNode } from "react";

import { cn } from "../utils/cn";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  size?: "sm" | "md";
  delay?: number;
  className?: string;
}

const SIZE_MAP = {
  sm: "h-1.5",
  md: "h-2",
} as const;

export function ProgressBar({
  value,
  max,
  color = "bg-amber-400",
  size = "md",
  delay = 0,
  className,
}: ProgressBarProps): ReactNode {
  const rawPercentage = max > 0 ? (value / max) * 100 : 0;
  const percentage = Number.isFinite(rawPercentage) ? Math.min(100, Math.max(0, rawPercentage)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("overflow-hidden rounded-full bg-surface-muted", SIZE_MAP[size], className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-[600ms] ease-out", color)}
        style={{ width: `${percentage}%`, transitionDelay: delay > 0 ? `${delay}s` : undefined }}
      />
    </div>
  );
}
