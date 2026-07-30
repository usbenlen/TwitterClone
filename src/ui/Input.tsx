/** @format */
import { forwardRef, useId } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  // Необов'язковий префікс, наприклад @ для username
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex items-center rounded-md border bg-input px-3 transition-colors focus-within:border-primary",
            error ? "border-destructive" : "border-border",
          )}
        >
          {prefix && (
            <span className="mr-1 text-muted-foreground select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
