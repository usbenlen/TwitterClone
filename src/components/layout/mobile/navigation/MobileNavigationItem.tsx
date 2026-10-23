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
      "rounded-full p-3 transition-colors dark:focus-visible:focus-indicator",
      isActive
        ? "bg-primary text-primary-foreground dark:active:bg-primary-hover"
        : "text-muted-foreground hover:bg-muted dark:text-foreground dark:hover:bg-surface-hover dark:active:bg-muted",
    );

  if (to) {
    return (
      <NavLink to={to} end={end} className={className} aria-label={label}>
        {icon}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted dark:text-foreground dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
    >
      {icon}
    </button>
  );
}
