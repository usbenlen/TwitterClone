import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

interface SpinnerProps {
  className?: string;
  variant?: "fullscreen" | "inline";
}

export function Spinner({ className, variant = "fullscreen" }: SpinnerProps) {
  const icon = (
    <Loader2
      className={cn("size-5 animate-spin text-current", className)}
      aria-hidden="true"
    />
  );
  return variant === "inline" ? (
    icon
  ) : (
    <div className="flex min-h-screen items-center justify-center">{icon}</div>
  );
}
