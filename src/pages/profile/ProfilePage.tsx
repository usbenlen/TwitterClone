import { useParams, useSearchParams } from "react-router";

import { userApi } from "@/api/profileApi";

import type { UpdateProfileRequest, ProfileTab } from "@/types";

import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/profiles/useProfile";

import { Spinner } from "@/components/ui/Spinner";

import Profile from "@/components/profiles/Profile";
import PageHeader from "@/components/navigation/PageHeader";

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

  const { user, posts, isLoading, isTabLoading, notFound, tabError } =
    useProfile(username, activeTab);

  const handleUpdateProfile = async (data: UpdateProfileRequest) => {
    const updatedUser = await userApi.updateProfile(data);

    updateAuthUser(updatedUser);
  };

  if (isLoading) {
    return (
      <section className="max-w-3xl border-r border-border">
        <PageHeader title={`@${username ?? ""}`} backTo={APP_ROUTES.HOME} />
        <div className="flex justify-center py-16">
          <Spinner variant="inline" />
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
      posts={posts}
      activeTab={activeTab}
      isTabLoading={isTabLoading}
      tabError={tabError}
      isOwnProfile={currentUser?.id === user.id}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}
