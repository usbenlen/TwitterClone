import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";

import { LeftSidebarProfile } from "@/widgets/navigation/desktop/leftSidebar";
import { BackButton } from "@/widgets/navigation/pageHeader";
import { ADMIN_NAVIGATION } from "@/features/moderation/constants/admin";
import { APP_ROUTES } from "@/shared/config/routes";
import { useBodyScrollLock } from "@/shared/hooks";
import { cn } from "@/shared/lib/cn";
import { AppLogo } from "@/shared/ui";

export function AdminNavigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useBodyScrollLock(drawerOpen);
  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <AppLogo to={APP_ROUTES.ADMIN} className="text-3xl" />
        <button
          type="button"
          aria-label="Відкрити меню адміністратора"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="flex size-11 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-modal lg:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Закрити меню адміністратора"
          aria-hidden={!drawerOpen}
          tabIndex={drawerOpen ? 0 : -1}
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          role="dialog"
          aria-modal={drawerOpen}
          aria-hidden={!drawerOpen}
          aria-label="Адміністративна навігація"
          inert={!drawerOpen}
          className={cn(
            "absolute inset-y-0 left-0 flex h-dvh w-[85vw] max-w-sm flex-col border-r border-border bg-background shadow-xl transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <AppLogo to={APP_ROUTES.ADMIN} />
            <button
              type="button"
              aria-label="Закрити меню адміністратора"
              onClick={() => setDrawerOpen(false)}
              className="flex size-11 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav
            aria-label="Адміністративна навігація"
            className="flex flex-col gap-2 p-4"
          >
            {ADMIN_NAVIGATION.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === APP_ROUTES.ADMIN}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-13 items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "bg-primary/10 text-primary",
                  )
                }
              >
                <Icon className="size-6 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div
            className="mt-auto space-y-3 border-t border-border p-4"
            onClick={() => setDrawerOpen(false)}
          >
            <BackButton
              fallbackTo={APP_ROUTES.HOME}
              mode="destination"
              label="До застосунку"
              className="justify-start rounded-sm font-medium text-muted-foreground hover:text-foreground"
            />
            <div className="border-t border-border pt-3">
              <LeftSidebarProfile />
            </div>
          </div>
        </aside>
      </div>

      <aside className="hidden border-b border-border lg:block lg:border-b-0 lg:border-r">
        <div className="flex flex-col gap-5 p-4 lg:sticky lg:top-0 lg:h-dvh lg:p-6">
          <AppLogo to={APP_ROUTES.ADMIN} />
          <span className="text-sm font-semibold text-muted-foreground">
            Адмін-панель
          </span>
          <nav
            aria-label="Адміністративна навігація"
            className="flex flex-wrap gap-2 lg:flex-col"
          >
            {ADMIN_NAVIGATION.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === APP_ROUTES.ADMIN}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-13 min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3 sm:px-4 sm:py-3 sm:text-base lg:text-lg",
                    isActive && "bg-primary/10 text-primary",
                  )
                }
              >
                <Icon className="size-6 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="space-y-3 lg:mt-auto">
            <BackButton
              fallbackTo={APP_ROUTES.HOME}
              mode="destination"
              label="До застосунку"
              className="justify-start rounded-sm font-medium text-muted-foreground hover:text-foreground"
            />
            <div className="border-t border-border pt-3">
              <LeftSidebarProfile />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
