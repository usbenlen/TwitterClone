/** @format */

import { NavLink } from "react-router";

import { LogOut } from "lucide-react";

import { Avatar } from "@/ui";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROUTES } from "@/constants/routes";

export default function LeftSidebarProfile() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted">
      <NavLink
        to={APP_ROUTES.profile(user.username)}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.displayName}
          className="size-10"
        />

        <div className="min-w-0">
          <p className="truncate font-semibold">{user.displayName}</p>

          <p className="truncate text-sm text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </NavLink>

      <button
        onClick={logout}
        className="flex items-center rounded-sm bg-destructive/10 px-3 py-2 text-destructive transition-colors hover:bg-destructive/20"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
