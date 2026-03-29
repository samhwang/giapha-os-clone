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

    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-surface-overlay backdrop-blur-sm animate-[fade-in_0.2s_ease-out_forwards]">
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
      className={cn(
        'relative bg-surface-panel backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border-default animate-[scale-in_0.2s_ease-out_forwards]',
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
        'size-10 flex items-center justify-center bg-stone-100/80 backdrop-blur-md text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 shadow-sm border border-stone-200/50 transition-colors',
        className
      )}
      aria-label={label}
    >
      <X className="size-5" />
    </button>
  );
}
