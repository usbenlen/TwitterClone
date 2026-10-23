import { forwardRef } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { Spinner } from "@/ui/Spinner";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 dark:active:bg-foreground/80 dark:disabled:bg-muted dark:disabled:text-muted-foreground dark:disabled:opacity-100",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted dark:border-control-border dark:hover:bg-surface-hover dark:active:bg-muted",
        ghost:
          "bg-transparent text-foreground hover:bg-muted dark:hover:bg-surface-hover dark:active:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        sm: "h-8 px-4 text-sm",
        md: "h-10 px-5 text-sm",
        comfortable: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-sm",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "pill",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      fullWidth,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, shape, fullWidth, className }),
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner variant="inline" className="size-4" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
