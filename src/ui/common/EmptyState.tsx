import type { ReactNode } from "react";

import { cn } from "../utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): ReactNode {
  return (
    <div className={cn("animate-[fade-in_0.3s_ease-out_forwards] py-16 text-center", className)}>
      {icon && <div className="mx-auto mb-3 text-text-muted">{icon}</div>}
      <p className="text-text-muted italic">{title}</p>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
