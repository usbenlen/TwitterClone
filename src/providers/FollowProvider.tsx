import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { followApi } from "@/api/follow.api";
import { useAuth } from "@/hooks/useAuth";

import type { UserShort } from "@/types";

interface FollowContextValue {
  following: UserShort[];
  followers: UserShort[];

  followingCount: number;
  followersCount: number;

  follow: (user: UserShort) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  removeFollower: (userId: string, followerId: string) => Promise<void>;

  loadFollowing: (userId: string) => Promise<UserShort[]>;
  loadFollowers: (userId: string) => Promise<UserShort[]>;

  isFollowing: (userId: string) => boolean;
}

export const FollowContext = createContext<FollowContextValue | null>(null);

interface FollowProviderProps {
  children: ReactNode;
}

export function FollowProvider({ children }: FollowProviderProps) {
  const { user: currentUser } = useAuth();

  const [following, setFollowing] = useState<UserShort[]>([]);
  const [followers, setFollowers] = useState<UserShort[]>([]);

  const followingCount = following.length;
  const followersCount = followers.length;

  const loadFollowing = useCallback(
    async (userId: string): Promise<UserShort[]> => {
      try {
        const data = await followApi.following(userId);
        const result = data ?? [];

        if (currentUser?.id === userId) setFollowing(result);

        return result;
      } catch (error) {
        console.error("Не вдалося завантажити підписки:", error);
        if (currentUser?.id === userId) setFollowing([]);
        return [];
      }
    },
    [currentUser],
  );

  const loadFollowers = useCallback(
    async (userId: string): Promise<UserShort[]> => {
      try {
        const data = await followApi.followers(userId);
        const result = data ?? [];

        if (currentUser?.id === userId) setFollowers(result);

        return result;
      } catch (error) {
        console.error("Не вдалося завантажити читачів:", error);

        if (currentUser?.id === userId) setFollowers([]);

        return [];
      }
    },
    [currentUser],
  );

  useEffect(() => {
    if (!currentUser) return;

    loadFollowing(currentUser.id);
    loadFollowers(currentUser.id);
  }, [currentUser, loadFollowing, loadFollowers]);

  const follow = useCallback(
    async (user: UserShort): Promise<void> => {
      if (!currentUser) return;
      if (currentUser.id === user.id) return;

      await followApi.follow({
        targetUserId: user.id,
      });

      setFollowing((previous) => {
        if (previous.some((item) => item.id === user.id)) return previous;

          return [...previous, user];
        });
      },
      [currentUser],
  );

  const unfollow = useCallback(
    async (userId: string) => {
      if (!currentUser) return;
      if (currentUser.id === userId) return;

      await followApi.unfollow({
        targetUserId: userId,
      });

      setFollowing((previous) => previous.filter((user) => user.id !== userId));
    },
    [currentUser],
  );

  const removeFollower = useCallback(
    async (userId: string, followerId: string) => {
      if (!currentUser) return;
      if (currentUser.id !== userId) return;

      await followApi.removeFollower({
        userId,
        followId: followerId,
      });

      setFollowers((previous) =>
        previous.filter((user) => user.id !== followerId),
      );
    },
    [currentUser],
  );

  const isFollowing = useCallback(
    (userId: string) => following.some((user) => user.id === userId),
    [following],
  );

  return (
    <FollowContext.Provider
      value={{
        following,
        followers,

        followingCount,
        followersCount,

        follow,
        unfollow,
        removeFollower,

        loadFollowing,
        loadFollowers,

        isFollowing,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}
