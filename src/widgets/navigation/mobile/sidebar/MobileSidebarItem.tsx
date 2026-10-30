import { NavLink } from "react-router";

import { cn } from "@/shared/lib/cn";

import type { ReactNode } from "react";

interface MobileSidebarItemProps {
  icon: ReactNode;
  children: ReactNode;

  to?: string;
  onClick?: () => void | Promise<void>;

  danger?: boolean;
}

export default function MobileSidebarItem({
  icon,
  children,
  to,
  onClick,
  danger = false,
}: MobileSidebarItemProps) {
  const className = cn(
    "flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-base font-medium transition-colors hover:bg-muted",
    "dark:focus-visible:focus-indicator",
    danger
      ? "text-destructive hover:bg-destructive/10 dark:active:bg-destructive/20"
      : "text-foreground dark:hover:bg-surface-hover dark:active:bg-muted",
  );

  if (to) {
    return (
      <NavLink to={to} onClick={onClick} className={className}>
        {icon}
        <span>{children}</span>
      </NavLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
