/** @format */
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2
        className={cn("size-5 animate-spin text-current", className)}
        aria-hidden="true"
      />
    </div>
  );
}
