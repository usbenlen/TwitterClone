import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useAuth, useFollow, useProfile } from "@/hooks";

import { Spinner } from "@/ui";

import { FollowNavigation } from "@/components/profile";
import { UserListItem } from "@/components/user";

import type { UserShort } from "@/types";

export default function FollowingPage() {
  const { username } = useParams<{
    username: string;
  }>();

  const { user, isLoading } = useProfile(username, "posts");
  const { user: currentUser } = useAuth();

  const { following, loadFollowing } = useFollow();

  const [profileFollowing, setProfileFollowing] = useState<UserShort[]>([]);

  useEffect(() => {
    if (user) loadFollowing(user.id).then(setProfileFollowing);
  }, [user, loadFollowing]);

  if (isLoading) {
    return (
      <section className="max-w-3xl border-r bg-background">
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </section>
    );
  }

  if (!user) return null;

  const isOwnProfile = currentUser?.id === user.id;
  const users = isOwnProfile ? following : profileFollowing;

  return (
    <section>
      <FollowNavigation user={user} />

      <div className="divide-y divide-border">
        {users.length === 0 ? (
          <p className="p-4 text-center text-2xl font-bold text-foreground">
            Немає підписок
          </p>
        ) : (
          users.map((followedUser) => (
            <UserListItem key={followedUser.id} user={followedUser} />
          ))
        )}
      </div>
    </section>
  );
}
