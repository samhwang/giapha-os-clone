import type { ReactNode } from 'react';
import { INPUT_BASE } from '../../ui/common/Input';
import { cn } from '../../ui/utils/cn';
import { useFieldContext } from '../hooks/useAuthForm';

interface AuthFieldProps {
  label: string;
  type: string;
  leftIcon: ReactNode;
  placeholder: string;
}

export default function AuthField({ label, type, leftIcon, placeholder }: AuthFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="relative">
      <label htmlFor={field.name} className="block text-sm-plus font-semibold text-stone-600 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative flex items-center group">
        {leftIcon}
        <input
          id={field.name}
          name={field.name}
          type={type}
          autoComplete={field.name}
          required
          className={cn(INPUT_BASE, 'bg-white/50 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 pl-11 pr-4 py-3.5')}
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </div>
    </div>
  );
}
