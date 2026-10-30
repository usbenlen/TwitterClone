import { Link } from "react-router";

import { useAuth } from "@/hooks/auth/useAuth";
import { useFollow } from "@/hooks/profiles/useFollow";

import { Avatar, Button } from "@/components/ui";

import { VerifiedBadge } from "@/components/profiles/VerifiedBadge";

import { APP_ROUTES } from "@/constants/routes";
import {
  normalizeDisplayText,
  normalizeInlineDisplayText,
} from "@/utils/displayText";

import type { UserShort } from "@/types/user";

interface UserListItemProps {
  user: UserShort;
  showFollowButton?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

export default function UserListItem({
  user,
  showFollowButton = true,
  showRemoveButton = false,
  onRemove,
}: UserListItemProps) {
  const { user: currentUser } = useAuth();
  const { follow, unfollow, isFollowing } = useFollow();

  const following = isFollowing(user.id);
  const isCurrentUser = currentUser?.id === user.id;

  const shouldShowFollowButton = showFollowButton && !isCurrentUser;

  const shouldShowRemoveButton = showRemoveButton && !!onRemove;

  return (
    <Link
      to={APP_ROUTES.profile(user.username)}
      className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40 dark:hover:bg-row-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          userId={user.id}
          fallbackName={user.username}
          name={user.displayName ?? user.username}
          src={user.avatarUrl ?? undefined}
          className="size-12 shrink-0"
        />

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate font-semibold text-foreground">
              {normalizeInlineDisplayText(user.displayName ?? user.username)}
            </p>

            <VerifiedBadge user={user} size={18} />
          </div>

          <p className="truncate text-sm text-muted-foreground">
            @{normalizeInlineDisplayText(user.username)}
          </p>

          {user.bio && (
            <p className="mt-1 min-w-0 line-clamp-2 wrap-anywhere text-sm text-muted-foreground">
              {normalizeDisplayText(user.bio)}
            </p>
          )}

          {user.location && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {user.location.name}, {user.location.country}
            </p>
          )}
        </div>
      </div>

      {(shouldShowFollowButton || shouldShowRemoveButton) && (
        <div className="flex shrink-0 items-center gap-2">
          {shouldShowFollowButton && (
            <Button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (following) void unfollow(user);
                else follow(user);
              }}
              size="sm"
              variant={following ? "outline" : "primary"}
            >
              {following ? "Читаю" : "Читати"}
            </Button>
          )}

          {shouldShowRemoveButton && (
            <Button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                onRemove();
              }}
              size="sm"
              variant="outline"
            >
              Видалити
            </Button>
          )}
        </div>
      )}
    </Link>
  );
}
