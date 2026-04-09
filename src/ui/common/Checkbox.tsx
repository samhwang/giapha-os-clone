import { cn } from "../utils/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  colorClass?: string;
  hoverClass?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  colorClass = "bg-amber-500 border-amber-500",
  hoverClass = "group-hover:text-amber-700",
}: CheckboxProps) {
  return (
    <label className="group flex items-center gap-3">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={cn(
            "flex size-5 items-center justify-center rounded border-2 border-stone-300 transition-colors",
            checked && colorClass,
          )}
        >
          {checked && (
            <svg
              className="size-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={4}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className={cn("text-sm font-semibold text-stone-700 transition-colors", hoverClass)}>
        {label}
      </span>
    </label>
  );
}
