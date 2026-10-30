import FeedList from "@/widgets/feed/FeedList";
import ProfileHeader from "@/widgets/profile/ProfileHeader";
import ProfileHero from "@/widgets/profile/ProfileHero";
import ProfileInfo from "@/widgets/profile/ProfileInfo";
import ProfileStats from "@/widgets/profile/ProfileStats";
import ProfileTabs from "@/widgets/profile/ProfileTabs";

import type { Post, ProfileTab } from "@/features/content/types";
import type { UpdateProfileRequest, User } from "@/features/profiles/types";

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
