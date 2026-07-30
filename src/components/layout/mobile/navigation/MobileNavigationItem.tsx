/** @format */

import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { cn } from "@/utils/cn";

interface Props {
  icon: ReactNode;

  to?: string;
  end?: boolean;

  onClick?: () => void;
}

export default function MobileNavigationItem({
  to,
  icon,
  end,
  onClick,
}: Props) {
  const className = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-full p-3 transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted",
    );

  if (to) {
    return (
      <NavLink to={to} end={end} className={className}>
        {icon}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted"
    >
      {icon}
    </button>
  );
}
