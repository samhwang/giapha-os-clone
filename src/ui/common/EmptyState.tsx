import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps): ReactNode {
  return (
    <div className={cn('text-center py-16 animate-[fade-in_0.3s_ease-out_forwards]', className)}>
      {icon && <div className="mx-auto mb-3 text-text-muted">{icon}</div>}
      <p className="text-text-muted italic">{title}</p>
      {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
