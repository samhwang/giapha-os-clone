import type { ReactNode } from "react";

import { INPUT_BASE } from "../../ui/common/Input";
import { cn } from "../../ui/utils/cn";
import { useFieldContext } from "../hooks/useAuthForm";

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
      <label htmlFor={field.name} className="text-label ml-1">
        {label}
      </label>
      <div className="group relative flex items-center">
        {leftIcon}
        <input
          id={field.name}
          name={field.name}
          type={type}
          autoComplete={field.name}
          required
          className={cn(
            INPUT_BASE,
            "bg-white/50 py-3.5 pr-4 pl-11 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]",
          )}
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </div>
    </div>
  );
}
