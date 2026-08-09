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

interface ProfileProps {
  user: User;
  tweets: Tweet[];
  isOwnProfile: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

export default function Profile({
  user,
  tweets,
  isOwnProfile,
  onUpdateProfile,
}: ProfileProps) {
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

        <ProfileTabs />

        <FeedList
          tweets={tweets}
          emptyMessage="Користувач ще нічого не публікував."
        />
      </section>
    </FollowProvider>
  );
}
