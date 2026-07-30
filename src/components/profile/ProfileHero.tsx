/** @format */

import { Avatar, Button } from "@/ui";

import type { User } from "@/types/user";

interface ProfileHeroProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileHero({ user, isOwnProfile }: ProfileHeroProps) {
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
              <Button size="sm">Читати</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
