import type { ReactNode } from 'react';
import { useFieldContext } from '../hooks/useCustomEventForm';

interface CustomEventFieldProps {
  label: string;
  className: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  leftIcon?: ReactNode;
}

export default function CustomEventField({ label, required, className, placeholder, type, leftIcon }: CustomEventFieldProps) {
  const field = useFieldContext<string | undefined>();
  return (
    <div>
      <label htmlFor={`ce-${field.name}`} className="block text-sm font-semibold text-stone-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {leftIcon}
        <input
          id={`ce-${field.name}`}
          required={required}
          type={type}
          className={className}
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </div>
    </div>
  );
}
