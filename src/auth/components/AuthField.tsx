import type { ReactNode } from 'react';
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
          className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </div>
    </div>
  );
}
