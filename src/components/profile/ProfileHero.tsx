/** @format */

import { useState } from "react";

import { Avatar, Button } from "@/ui";

import { useFollow } from "@/hooks/useFollow";

import { EditProfileModal } from "@/components/modal";

import type { User } from "@/types/user";
import type { UpdateProfileRequest } from "@/api/user.api";

interface ProfileHeroProps {
  user: User;
  isOwnProfile: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

export default function ProfileHero({
  user,
  isOwnProfile,
  onUpdateProfile,
}: ProfileHeroProps) {
  const { follow, unfollow, isFollowing } = useFollow();
  const following = isFollowing(user.id);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(true)}
              >
                Редагувати профіль
              </Button>
            ) : (
              <Button
                size="sm"
                variant={following ? "outline" : "primary"}
                onClick={() => (following ? unfollow(user.id) : follow(user))}
              >
                {following ? "Читаю" : "Читати"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal
        open={isEditProfileOpen}
        user={user}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={onUpdateProfile}
      />
    </>
  );
}
