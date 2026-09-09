import { useParams, useSearchParams } from "react-router";

import { userApi, type UpdateProfileRequest } from "@/api";

import { useAuth, useProfile } from "@/hooks";
import type { ProfileTab } from "@/hooks/useProfile";

import { Spinner } from "@/ui";

import { Profile } from "@/components/profile";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const { user: currentUser, updateUser: updateAuthUser } = useAuth();
  const tabParam = searchParams.get("tab");

  const activeTab: ProfileTab =
    tabParam === "replies" || tabParam === "likes" || tabParam === "reposts"
      ? tabParam
      : "posts";

  const {
    user,
    tweets,
    isLoading,
    isTabLoading,
    notFound,
    tabError,
    updateUser,
  } = useProfile(username, activeTab);

  const handleUpdateProfile = async (data: UpdateProfileRequest) => {
    const updatedUser = await userApi.updateProfile(data);

    updateUser(updatedUser);
    updateAuthUser(updatedUser);
  };

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
      activeTab={activeTab}
      isTabLoading={isTabLoading}
      tabError={tabError}
      isOwnProfile={currentUser?.id === user.id}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}
