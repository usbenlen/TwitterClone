/** @format */

import { FeedList } from "@/components/feed";
import { SubscribeProvider } from "@/providers/SubscribeProvider";

import {
  ProfileHero,
  ProfileInfo,
  ProfileStats,
  ProfileTabs,
} from "@/components/profile";

import type { Tweet } from "@/types/tweet";
import type { User } from "@/types/user";

interface ProfileProps {
  user: User;
  tweets: Tweet[];
  isOwnProfile: boolean;
}

export default function Profile({ user, tweets, isOwnProfile }: ProfileProps) {
  
  return (
    <SubscribeProvider isOwnProfile={isOwnProfile}>
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
    </SubscribeProvider>

  );
}
