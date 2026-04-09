import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';

import { cn } from '../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps): ReactNode {
  const previousOverflow = useRef<string>('');

  useEffect(() => {
    if (!isOpen) return;

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (onClose) {
      const handleEscape = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = previousOverflow.current;
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex animate-[fade-in_0.2s_ease-out_forwards] items-center justify-center bg-surface-overlay p-4 backdrop-blur-sm sm:p-6">
      {onClose && <button type="button" tabIndex={-1} aria-hidden="true" className="absolute inset-0 cursor-pointer" onClick={onClose} />}
      {children}
    </div>
  );
}

interface ModalPanelProps {
  children: ReactNode;
  maxWidth?: 'md' | '2xl' | '4xl';
  className?: string;
}

const MAX_WIDTH_MAP = {
  md: 'max-w-md',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
} as const;

export function ModalPanel({ children, maxWidth = '4xl', className }: ModalPanelProps): ReactNode {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'relative flex max-h-[90vh] w-full animate-[scale-in_0.2s_ease-out_forwards] flex-col overflow-hidden rounded-3xl border border-border-default bg-surface-panel shadow-2xl backdrop-blur-2xl',
        MAX_WIDTH_MAP[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ModalCloseButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export function ModalCloseButton({ onClick, label, className }: ModalCloseButtonProps): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex size-10 items-center justify-center rounded-full border border-border-default bg-surface-muted/80 text-text-secondary shadow-sm backdrop-blur-md transition-colors hover:bg-surface-muted hover:text-text-primary',
        className
      )}
      aria-label={label}
    >
      <X className="size-5" />
    </button>
  );
}
