/** @format */

import { NavLink, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import type { User } from "@/types/user";

interface FollowNavigationProps {
  user: User;
}

export default function FollowNavigation({ user }: FollowNavigationProps) {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  if (!username) return null;

  const tabs = [
    {
      to: `/${username}/following`,
      label: "Підписки",
    },
    {
      to: `/${username}/followers`,
      label: "Підписники",
    },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          aria-label="Назад до профілю"
          onClick={() => navigate(`/${username}`)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-foreground">
            {user.displayName}
          </h1>

          <p className="truncate text-sm text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </div>

      <nav className="flex" aria-label="Навігація профілю">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              [
                "flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors",
                "hover:bg-muted/50",
                isActive
                  ? "border-foreground bg-muted/50 font-semibold text-foreground"
                  : "border-transparent text-muted-foreground",
              ].join(" ")
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
