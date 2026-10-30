import { Link, NavLink } from "react-router";

import { APP_ROUTES } from "@/constants/routes";
import { FOOTER_LINKS } from "@/constants/layout";

import { useAppSelector } from "@/store/hooks";

import { AppLogo } from "@/components/navigation/AppLogo";

import { cn } from "@/utils/cn";

export function InformationNavigation() {
  const user = useAppSelector((state) => state.auth.user);
  const homeRoute = user ? APP_ROUTES.HOME : APP_ROUTES.LANDING;
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <AppLogo
            to={homeRoute}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Link
            to={user ? APP_ROUTES.HOME : APP_ROUTES.LOGIN}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border px-4 text-sm font-bold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {user ? "До стрічки" : "Увійти"}
          </Link>
        </div>
      </header>

      <div className="border-b border-border bg-muted/35">
        <nav
          aria-label="Інформація про сервіс"
          className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 py-3 sm:px-6 lg:px-8"
        >
          {FOOTER_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
