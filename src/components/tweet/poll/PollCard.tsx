import { BarChart3 } from "lucide-react";
import type { ReactNode } from "react";

interface PollCardProps {
  children: ReactNode;
  action?: ReactNode;
  footer: ReactNode;
  busy?: boolean;
}

export const pollRowClassName =
  "min-h-11 min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

export default function PollCard({
  children,
  action,
  footer,
  busy,
}: PollCardProps) {
  return (
    <section
      aria-label="Опитування"
      aria-busy={busy || undefined}
      className="mt-3 min-w-0 rounded-2xl border border-border bg-background p-3"
    >
      <div className="mb-3 flex min-h-7 items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 size={17} className="text-primary" aria-hidden="true" />
          Опитування
        </h4>
        {action}
      </div>
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
      <div className="-mx-3 mt-3 border-t border-border px-3 pt-3 text-[13px] text-muted-foreground">
        {footer}
      </div>
    </section>
  );
}
