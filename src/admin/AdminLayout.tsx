import { Link, NavLink, Outlet } from "react-router";
import { ArrowLeft, LogOut } from "lucide-react";
import { ADMIN_NAVIGATION } from "@/admin/constants";
import { APP_ROUTES } from "@/constants/routes";
import { AppLogo, Avatar, Button } from "@/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
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
                    "flex items-center gap-3 rounded-full px-4 py-2.5 font-semibold hover:bg-muted",
                    isActive && "bg-primary/10 text-primary",
                  )
                }
              >
                <Icon className="size-5" />
                {label}
              </NavLink>
            ))}
          </nav>
          <Link
            to={APP_ROUTES.HOME}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm hover:bg-muted lg:mt-auto"
          >
            <ArrowLeft className="size-4" />
            До застосунку
          </Link>
          {user && (
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <Avatar
                userId={user.id}
                src={user.avatarUrl}
                name={user.displayName}
                fallbackName={user.username}
              />
              <Link
                to={APP_ROUTES.profile(user.username)}
                className="min-w-0 flex-1 truncate text-sm font-semibold"
              >
                @{user.username}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Вийти"
                onClick={() => void logout()}
              >
                <LogOut className="size-5" />
              </Button>
            </div>
          )}
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
