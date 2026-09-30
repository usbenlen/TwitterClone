import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useParams } from "react-router";

import { useAuth, useFollow } from "@/hooks";
import { useGetProfileQuery, useGetFollowersQuery } from "@/store/sharedApi";

import { Spinner } from "@/ui";

import { FollowNavigation } from "@/components/profile";
import { UserListItem } from "@/components/user";
import { ConfirmModal } from "@/components/modal";

import type { UserShort } from "@/types";

export default function FollowersPage() {
  const { username } = useParams<{
    username: string;
  }>();

  const profile = useGetProfileQuery(username ?? skipToken);
  const user =
    profile.currentData?.username === username ? profile.currentData : null;
  const isLoading = Boolean(username) && !user && !profile.error;
  const { user: currentUser } = useAuth();
  const { removeFollower } = useFollow();
  const { data: users = [] } = useGetFollowersQuery(user?.id ?? skipToken);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState<UserShort | null>(
    null,
  );

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

  const handleRemoveFollower = async () => {
    if (!selectedFollower || !isOwnProfile) return;

    await removeFollower(selectedFollower);

    setIsModalOpen(false);
    setSelectedFollower(null);
  };

  return (
    <section className="max-w-3xl border-r bg-background">
      <FollowNavigation user={user} />

      <div className="divide-y divide-border">
        {users.length === 0 ? (
          <p className="p-4 text-center text-2xl font-bold text-foreground">
            Немає читачів
          </p>
        ) : (
          users.map((follower) => (
            <UserListItem
              key={follower.id}
              user={follower}
              showRemoveButton={isOwnProfile}
              onRemove={() => {
                setSelectedFollower(follower);
                setIsModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      <ConfirmModal
        open={isModalOpen}
        title="Видалити читача?"
        description="Цей користувач більше не буде вашим читачем."
        cancelText="Скасувати"
        confirmText="Видалити"
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedFollower(null);
        }}
        onConfirm={() => {
          void handleRemoveFollower();
        }}
      />
    </section>
  );
}
