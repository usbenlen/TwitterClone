import { cn } from "@/shared/lib/cn";

import type { ReactNode } from "react";

interface PollCardProps {
  children: ReactNode;
  action?: ReactNode;
  footer: ReactNode;
  busy?: boolean;
  variant?: "composer" | "display";
}

export default function PollCard({
  children,
  action,
  footer,
  busy,
  variant = "composer",
}: PollCardProps) {
  const composing = variant === "composer";
  return (
    <section
      aria-label="Опитування"
      aria-busy={busy || undefined}
      className={cn(
        "mt-3 min-w-0",
        composing &&
          "overflow-hidden rounded-2xl border border-border bg-background p-3",
      )}
    >
      {composing && action}
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
      <div
        className={cn(
          "mt-3 text-[13px] text-muted-foreground",
          composing && "-mx-3 border-t border-border px-3 pt-3",
        )}
      >
        {!composing && action}
        {footer}
      </div>
    </section>
  );
}
