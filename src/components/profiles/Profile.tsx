import FeedList from "@/components/posts/FeedList";
import {
  ProfileHeader,
  ProfileHero,
  ProfileInfo,
  ProfileStats,
  ProfileTabs,
} from "@/components/profiles";

import type { UpdateProfileRequest, ProfileTab, Post, User } from "@/types";

interface ProfileProps {
  user: User;
  posts: Post[];
  activeTab: ProfileTab;
  isTabLoading: boolean;
  tabError?: string | null;
  isOwnProfile: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

export default function Profile({
  user,
  posts,
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
        : activeTab === "replies"
          ? "У цій вкладці ще немає відповідей."
          : "Користувач ще нічого не публікував.";

  return (
    <section className="max-w-3xl border-r border-border bg-background">
      <ProfileHeader user={user} />

      <ProfileHero
        user={user}
        isOwnProfile={isOwnProfile}
        onUpdateProfile={onUpdateProfile}
      />

      <ProfileInfo user={user} />

      <ProfileStats user={user} isOwnProfile={isOwnProfile} />

      <ProfileTabs activeTab={activeTab} />

      <FeedList
        posts={posts}
        variant={activeTab === "replies" ? "replies" : "feed"}
        repostedBy={activeTab === "reposts" ? user : undefined}
        showReplyContext={activeTab === "likes" || activeTab === "reposts"}
        isLoading={isTabLoading}
        error={tabError}
        emptyMessage={emptyMessage}
      />
    </section>
  );
}
