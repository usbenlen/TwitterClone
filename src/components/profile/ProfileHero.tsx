import { useState } from "react";
import ActionsMenu from "@/components/tweet/ActionsMenu";
import ReportModal from "@/components/modal/ReportModal";

import { Avatar, Button } from "@/ui";

import { useImageCache, useFollow } from "@/hooks";

import { EditProfileModal } from "@/components/modal/index";

import type { UpdateProfileRequest } from "@/api/user.api";
import type { User } from "@/types/user";

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
  const { src: cachedBannerUrl } = useImageCache(user.bannerUrl);
  const { follow, unfollow, isFollowing } = useFollow();
  const following = isFollowing(user.id);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <>
      <div className="h-40 w-full bg-muted">
        {cachedBannerUrl && (
          <img
            src={cachedBannerUrl}
            alt=""
            className="size-full object-cover"
          />
        )}
      </div>

      <div className="px-4">
        <div className="flex items-end justify-between">
          <div className="-mt-12">
            <Avatar
              userId={user.id}
              name={user.displayName}
              fallbackName={user.username}
              src={user.avatarUrl}
              className="size-24 border-4 border-background"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            {!isOwnProfile && (
              <ActionsMenu onReport={() => setIsReportOpen(true)} />
            )}
            {isOwnProfile ? (
              <Button
                className={"cursor-pointer"}
                variant="outline"
                onClick={() => setIsEditProfileOpen(true)}
              >
                Редагувати профіль
              </Button>
            ) : (
              <Button
                className={"cursor-pointer"}
                size="sm"
                variant={following ? "outline" : "primary"}
                onClick={() => void (following ? unfollow(user) : follow(user))}
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
      {isReportOpen && (
        <ReportModal
          targetType="users"
          targetId={user.id}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </>
  );
}
