import { NavLink, Outlet } from "react-router";
import { ADMIN_NAVIGATION } from "@/admin/constants";
import { APP_ROUTES } from "@/constants/routes";
import { AppLogo } from "@/ui";
import { LeftSidebarProfile } from "@/components/layout/desktop/leftSidebar";
import { BackButton } from "@/components/layout/pageHeader";
import { cn } from "@/utils/cn";

export default function AdminLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="border-b border-border lg:border-b-0 lg:border-r">
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
                    "flex min-h-13 items-center gap-3 rounded-xl px-4 py-3 text-lg font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
      <main className="min-w-0">
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
