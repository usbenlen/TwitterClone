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

interface ProfileProps {
  user: User;
  tweets: Tweet[];
  isOwnProfile: boolean;
}

export default function Profile({ user, tweets, isOwnProfile }: ProfileProps) {
  return (
    <FollowProvider>
      <section className="max-w-3xl border-r border-border bg-background">
        <ProfileHero user={user} isOwnProfile={isOwnProfile} />

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
