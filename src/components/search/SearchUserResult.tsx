/** @format */

import { BadgeCheck } from "lucide-react";
import { Link } from "react-router";

import { Avatar, Button } from "@/ui";
import { useAuth, useFollow } from "@/hooks";
import { APP_ROUTES } from "@/constants/routes";

import type { User } from "@/types/user";

interface SearchUserResultProps {
  user: User;
}

export default function SearchUserResult({ user }: SearchUserResultProps) {
  const { user: currentUser } = useAuth();

  const { follow, unfollow, isFollowing } = useFollow();
  const following = isFollowing(user.id);
  const isCurrentUser = currentUser?.id === user.id;

  return (
      <Link
          to={APP_ROUTES.profile(user.username)}
          className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
              name={user.displayName}
              src={user.avatarUrl}
              className="size-12 shrink-0"
          />

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1">
              <p className="truncate font-semibold text-foreground">
                {user.displayName}
              </p>

              {user.isVerified && (
                  <BadgeCheck
                      size={18}
                      className="shrink-0 text-background"
                      fill="#1d9bf0"
                  />
              )}
            </div>

            <p className="truncate text-sm text-muted-foreground">
              @{user.username}
            </p>

            {user.bio && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {user.bio}
                </p>
            )}

            {user.location && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {user.location.name}, {user.location.country}
                </p>
            )}
          </div>
        </div>

        {!isCurrentUser && (
            <Button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (following) {
                    unfollow(user.id);
                  } else {
                    follow(user);
                  }
                }}
                size="sm"
                variant={following ? "outline" : "primary"}
                className="shrink-0"
            >
              {following ? "Читаю" : "Читати"}
            </Button>
        )}
      </Link>
  );
}