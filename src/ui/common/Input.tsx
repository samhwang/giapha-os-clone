import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

const INPUT_BASE =
  'bg-surface-primary text-text-primary placeholder-text-muted block w-full rounded-input border border-border-strong shadow-sm focus:border-ring-primary focus:ring-2 focus:ring-ring-primary-bg focus:bg-surface-primary text-sm transition-all outline-none';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, leftIcon, className, id, ...props }, ref): ReactNode => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-text-label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">{leftIcon}</div>}
        <input
          ref={ref}
          id={id}
          className={cn(
            INPUT_BASE,
            leftIcon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-3',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export { INPUT_BASE };
