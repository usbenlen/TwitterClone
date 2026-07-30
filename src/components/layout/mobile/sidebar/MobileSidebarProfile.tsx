/** @format */

import { NavLink } from "react-router";
import { LogOut } from "lucide-react";

import { Avatar } from "@/ui";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROUTES } from "@/constants/routes";

interface MobileSidebarProfileProps {
  onClose?: () => void;
}

export default function MobileSidebarProfile({
  onClose,
}: MobileSidebarProfileProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <div className="flex items-center gap-4 border-b border-border p-5">
      <NavLink
        to={APP_ROUTES.profile(user.username)}
        onClick={onClose}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <Avatar
          name={user.displayName}
          src={user.avatarUrl}
          className="size-14"
        />

        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-foreground">
            {user.displayName}
          </h2>

          <p className="truncate text-sm text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </NavLink>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
      >
        <LogOut size={16} />
        <span>Вийти</span>
      </button>
    </div>
  );
}
