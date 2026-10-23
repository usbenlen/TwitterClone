import type { ReactNode } from "react";

interface RightSidebarCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const sidebarCardActionClassName =
  "block w-full cursor-pointer px-4 py-3 text-left text-sm text-primary transition-colors hover:bg-muted/40 dark:hover:bg-surface-hover dark:active:bg-muted focus-visible:focus-indicator";

export default function RightSidebarCard({
  title,
  children,
  footer,
}: RightSidebarCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2>
      {children}
      {footer && (
        <div className="-mx-4 -mb-4 mt-1 overflow-hidden rounded-b-2xl">
          {footer}
        </div>
      )}
    </section>
  );
}
