import { Check, Circle } from "lucide-react";
import { cn } from "@/utils/cn";

interface RadioOptionProps<T extends string> {
  checked: boolean;
  disabled?: boolean;
  label: string;
  className?: string;
  value: T;
  onChange: (value: T) => void;
}

export function RadioOption<T extends string>({
  checked,
  className,
  disabled,
  label,
  value,
  onChange,
}: RadioOptionProps<T>) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={cn(
        "group flex w-full cursor-pointer items-center justify-between text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span>{label}</span>
      {checked ? (
        <span
          className={`relative flex size-5 items-center justify-center before:absolute before:-inset-2 before:rounded-full before:transition-colors ${
            disabled
              ? ""
              : "group-hover:before:bg-primary/10 group-focus-visible:before:bg-primary/10"
          }`}
        >
          <span className="relative flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        </span>
      ) : (
        <span
          className={`relative flex size-5 items-center justify-center before:absolute before:-inset-2 before:rounded-full before:transition-colors ${
            disabled
              ? ""
              : "group-hover:before:bg-muted group-focus-visible:before:bg-muted"
          }`}
        >
          <Circle className="relative size-5 text-muted-foreground" />
        </span>
      )}
    </button>
  );
}
