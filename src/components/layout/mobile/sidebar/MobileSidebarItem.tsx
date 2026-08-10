/** @format */

import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { cn } from "@/utils/cn";

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
    danger ? "text-destructive hover:bg-destructive/10" : "text-foreground",
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
