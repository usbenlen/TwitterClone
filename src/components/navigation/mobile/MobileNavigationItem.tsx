import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { cn } from "@/utils/cn";

interface Props {
  icon: ReactNode;
  label: string;

  to?: string;
  end?: boolean;

  onClick?: () => void;
}

export default function MobileNavigationItem({
  to,
  icon,
  label,
  end,
  onClick,
}: Props) {
  const className = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex size-12 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:focus-indicator",
      isActive
        ? "bg-primary text-primary-foreground dark:active:bg-primary-hover"
        : "text-muted-foreground hover:bg-muted dark:text-foreground dark:hover:bg-surface-hover dark:active:bg-muted",
    );

  if (to) {
    return (
      <NavLink to={to} end={end} className={className}>
        <span className="sr-only">{label}</span>
        {icon}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-12 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-foreground dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
    >
      {icon}
    </button>
  );
}
