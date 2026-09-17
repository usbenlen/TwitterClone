import { useParams, useSearchParams } from "react-router";

import { userApi, type UpdateProfileRequest } from "@/api";

import { useAuth, useProfile } from "@/hooks";
import type { ProfileTab } from "@/hooks/useProfile";

import { Spinner } from "@/ui";

import { Profile } from "@/components/profile";
import { PageHeader } from "@/components/layout/pageHeader";
import { APP_ROUTES } from "@/constants/routes";

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
      <section className="max-w-3xl border-r border-border">
        <PageHeader title={`@${username ?? ""}`} backTo={APP_ROUTES.HOME} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </section>
    );
  }

  if (notFound || !user) {
    return (
      <section className="max-w-3xl border-r border-border">
        <PageHeader title="Профіль" backTo={APP_ROUTES.HOME} />
        <div className="px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-foreground">
            Профіль не знайдено
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Користувача @{username} не існує.
          </p>
        </div>
      </section>
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
