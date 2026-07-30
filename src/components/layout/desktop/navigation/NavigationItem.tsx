/** @format */

import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { cn } from "@/utils/cn";

interface NavigationItemProps {
  to: string;
  icon: ReactNode;
  children: ReactNode;

  vertical?: boolean;
  end?: boolean;
}

export default function NavigationItem({
  to,
  icon,
  children,
  vertical = false,
  end = false,
}: NavigationItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-full transition-colors hover:bg-muted",
          vertical ? "gap-4 px-4 py-3 text-lg" : "gap-2 px-3 py-2",
          isActive ? "font-bold text-foreground" : "text-muted-foreground",
        )
      }
    >
      {icon}

      <span>{children}</span>
    </NavLink>
  );
}
