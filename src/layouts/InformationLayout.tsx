import { Link, NavLink, Outlet, ScrollRestoration } from "react-router";

import RightSidebarFooterLinks from "@/components/layout/desktop/rightSidebar/RightSidebarFooterLinks";

import { APP_ROUTES, FOOTER_LINKS } from "@/constants";

import { useAppSelector } from "@/store/hooks";

import { AppLogo } from "@/ui/AppLogo";

import { cn } from "@/utils/cn";

export default function InformationLayout() {
  const user = useAppSelector((state) => state.auth.user);
  const homeRoute = user ? APP_ROUTES.HOME : APP_ROUTES.LANDING;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <AppLogo
            to={homeRoute}
            className="rounded-sm text-5xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <RightSidebarFooterLinks className="text-center [&>div]:justify-center sm:text-right sm:[&>div]:justify-end" />
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
