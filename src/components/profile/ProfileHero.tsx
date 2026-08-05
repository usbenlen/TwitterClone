/** @format */

import { Avatar, Button } from "@/ui";
import type { User } from "@/types/user";
import { useFollow } from "@/hooks/useFollow";

interface ProfileHeroProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileHero({ user, isOwnProfile }: ProfileHeroProps) {
  const {
    follow,
    unfollow,
    isFollowing
  } = useFollow();

  const following = isFollowing(user.id);

  return (
    <>
      <div className="h-40 w-full bg-muted">
        {user.bannerUrl && (
          <img src={user.bannerUrl} alt="" className="size-full object-cover" />
        )}
      </div>

      <div className="px-4">
        <div className="flex items-end justify-between">
          <div className="-mt-12">
            <Avatar
              name={user.displayName}
              src={user.avatarUrl}
              className="size-24 border-4 border-background"
            />
          </div>

          <div className="pt-3">
            {isOwnProfile ? (
              <Button variant="outline" size="sm">
                Редагувати профіль
              </Button>
            ) : (
              <Button
                size="sm"
                variant={following ? "outline" : "primary"}
                onClick={() =>
                  following
                    ? unfollow(user.id)
                    : follow(user)
                }
              >
                {following
                  ? "Читаю"
                  : "Читати"}
              </Button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
