import { Flag } from "lucide-react";
import { useState } from "react";

import ReportModal from "@/features/moderation/components/ReportModal";
import EditProfileModal from "@/features/profiles/components/EditProfileModal";
import { useFollow } from "@/features/profiles/hooks/useFollow";
import { useImageCache } from "@/shared/hooks/useImageCache";
import { ActionsMenu, Avatar, Button } from "@/shared/ui";

import type { UpdateProfileRequest, User } from "@/features/profiles/types";

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
        <div className="flex min-w-0 items-end justify-between gap-2">
          <div className="-mt-12 shrink-0">
            <Avatar
              userId={user.id}
              name={user.displayName}
              fallbackName={user.username}
              src={user.avatarUrl}
              className="size-24 border-4 border-background"
            />
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 pt-3">
            {!isOwnProfile && (
              <ActionsMenu
                ariaLabel="Додаткові дії"
                menuLabel="Дії з профілем"
                items={[
                  {
                    id: "report",
                    label: "Поскаржитися",
                    icon: Flag,
                    onSelect: () => setIsReportOpen(true),
                  },
                ]}
              />
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
