import { skipToken } from "@reduxjs/toolkit/query/react";
import { useParams } from "react-router";

import { useGetProfileQuery, useGetFollowingQuery } from "@/store/sharedApi";

import { Spinner } from "@/ui";

import { FollowNavigation } from "@/components/profile";
import { UserListItem } from "@/components/user";

export default function FollowingPage() {
  const { username } = useParams<{
    username: string;
  }>();

  const profile = useGetProfileQuery(username ?? skipToken);
  const user =
    profile.currentData?.username === username ? profile.currentData : null;
  const isLoading = Boolean(username) && !user && !profile.error;
  const { data: users = [] } = useGetFollowingQuery(user?.id ?? skipToken);

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
