import { Link } from "react-router";

import { Avatar, Button } from "@/ui";
import { useFollow } from "@/hooks";
import { APP_ROUTES } from "@/constants/routes";

import type { FollowUser } from "@/types/follow";

interface FollowUserItemProps {
  user: FollowUser;
  showRemove?: boolean;
  onRemove?: (user: FollowUser) => void;
}

export default function FollowUserItem({
  user,
  showRemove = false,
  onRemove,
}: FollowUserItemProps) {
  const { follow, unfollow, isFollowing } = useFollow();
  const following = isFollowing(user.id);

  return (
    <Link
      to={APP_ROUTES.profile(user.username)}
      className="flex items-center justify-between gap-3 p-4 hover:bg-muted/40"
    >
      <div className="flex gap-3">
        <Avatar
          name={user.displayName}
          src={user.avatarUrl}
          className="size-11"
        />

        <div>
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (following) unfollow(user.id);
            else follow(user);
          }}
          size="sm"
          variant={following ? "outline" : "primary"}
        >
          {following ? "Читаю" : "Читати"}
        </Button>

        {showRemove && onRemove && (
          <Button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove(user);
            }}
            size="sm"
            variant="outline"
          >
            Видалити
          </Button>
        )}
      </div>
    </Link>
  );
}
