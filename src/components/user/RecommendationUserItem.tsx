import { useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Link } from "react-router";

import { useFollow } from "@/hooks";
import { Avatar, Button } from "@/ui";

import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

import type { UserShort } from "@/types";

interface RecommendationUserItemProps {
  user: UserShort;
  compact?: boolean;
}

export default function RecommendationUserItem({
  user,
  compact = false,
}: RecommendationUserItemProps) {
  const { follow, unfollow, isFollowing } = useFollow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const following = isFollowing(user.id);

  const toggleFollow = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (following) await unfollow(user.id);
      else await follow(user);
    } catch {
      setError("Не вдалося оновити підписку.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "transition-colors hover:bg-muted/40",
        compact ? "-mx-4 px-4 py-2.5" : "px-4 py-3",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          to={APP_ROUTES.profile(user.username)}
          className="flex min-w-0 flex-1 gap-3"
        >
          <Avatar
            name={user.displayName ?? user.username}
            src={user.avatarUrl}
            className={compact ? "size-10" : "size-11"}
          />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1">
              <span className="truncate font-bold text-foreground">
                {user.displayName ?? user.username}
              </span>
              {user.isVerified && (
                <BadgeCheck
                  size={17}
                  className="shrink-0 text-background"
                  fill="#1d9bf0"
                  aria-label="Верифікований профіль"
                />
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              @{user.username}
            </p>
            {!compact && user.bio && (
              <p className="mt-1 text-sm leading-5 text-foreground">
                {user.bio}
              </p>
            )}
          </div>
        </Link>

        <Button
          type="button"
          size="sm"
          variant={following ? "outline" : "primary"}
          disabled={isSubmitting}
          onClick={() => void toggleFollow()}
          className="mt-0.5 shrink-0"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {following ? "Читаю" : "Читати"}
        </Button>
      </div>

      {error && (
        <p className="mt-1 text-right text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
