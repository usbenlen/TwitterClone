import { NavLink } from "react-router";

import { APP_ROUTES } from "@/shared/config/routes";
import { APP_NAME } from "@/shared/constants/app";
import { cn } from "@/shared/lib/cn";

export interface AppLogoProps {
  className?: string;
  to?: string;
}

export function AppLogo({ className, to = APP_ROUTES.HOME }: AppLogoProps) {
  return (
    <NavLink
      to={to}
      className={cn(
        "text-4xl font-black tracking-tight text-primary leading-none",
        className,
      )}
    >
      {APP_NAME}
    </NavLink>
  );
}
