/** @format */

import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { cn } from "@/utils/cn";

interface LeftSidebarItemProps {
  to?: string;
  icon: ReactNode;
  children: ReactNode;
  end?: boolean;
  onClick?: () => void | Promise<void>;
}

const classes = ({ isActive }: { isActive?: boolean }) =>
  cn(
    "flex w-full items-center gap-4 rounded-full px-4 py-3 text-lg transition-colors hover:bg-muted",
    isActive ? "font-bold text-foreground" : "text-muted-foreground",
  );

export default function LeftSidebarItem({
  to,
  icon,
  children,
  end,
  onClick,
}: LeftSidebarItemProps) {
  if (to) {
    return (
      <NavLink to={to} end={end} className={classes}>
        {icon}
        <span>{children}</span>
      </NavLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes({})}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
