import { NavLink } from "react-router";

import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <NavLink
      to={APP_ROUTES.HOME}
      className={cn(
        "text-4xl font-black tracking-tight text-primary leading-none",
        className,
      )}
    >
      Chirp
    </NavLink>
  );
}
