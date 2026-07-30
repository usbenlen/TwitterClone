/** @format */

import { useParams } from "react-router";

import { Spinner } from "@/ui";
import { useAuth, useProfile } from "@/hooks";

import { Profile } from "@/components/profile";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { user, tweets, isLoading, notFound } = useProfile(username);

  if (isLoading) {
    return (
      <div className="max-w-3xl flex justify-center border-r border-border py-16">
        <Spinner />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="max-w-3xl border-r border-border px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">
          Профіль не знайдено
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Користувача @{username} не існує.
        </p>
      </div>
    );
  }

  return (
    <Profile
      user={user}
      tweets={tweets}
      isOwnProfile={currentUser?.id === user.id}
    />
  );
}
