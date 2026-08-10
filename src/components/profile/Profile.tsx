/** @format */

import { FeedList } from "@/components/feed";

import {
  ProfileHero,
  ProfileInfo,
  ProfileStats,
  ProfileTabs,
} from "@/components/profile";

import { FollowProvider } from "@/providers/FollowProvider";

import type { Tweet, User } from "@/types";
import type { UpdateProfileRequest } from "@/api/user.api";
import type { ProfileTab } from "@/hooks/useProfile";

interface ProfileProps {
  user: User;
  tweets: Tweet[];
  activeTab: ProfileTab;
  isTabLoading: boolean;
  tabError?: string | null;
  isOwnProfile: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

export default function Profile({
  user,
  tweets,
  activeTab,
  isTabLoading,
  tabError,
  isOwnProfile,
  onUpdateProfile,
}: ProfileProps) {
  const emptyMessage =
    activeTab === "likes"
      ? "У цій вкладці ще немає лайкнутих постів."
      : activeTab === "reposts"
        ? "У цій вкладці ще немає репостів."
        : "Користувач ще нічого не публікував.";

  return (
    <FollowProvider>
      <section className="max-w-3xl border-r border-border bg-background">
        <ProfileHero
          user={user}
          isOwnProfile={isOwnProfile}
          onUpdateProfile={onUpdateProfile}
        />

        <ProfileInfo user={user} />

        <ProfileStats user={user} isOwnProfile={isOwnProfile} />

        <ProfileTabs activeTab={activeTab} />

        <FeedList
          tweets={tweets}
          isLoading={isTabLoading}
          error={tabError}
          emptyMessage={emptyMessage}
        />
      </section>
    </FollowProvider>
  );
}
