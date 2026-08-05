/** @format */

import {
  createContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { followApi } from "@/api/follow.api";
import type { User } from "@/types/user";

export interface FollowContextValue {
  following: User[];
  followingCount: number;

  follow(user: User): Promise<void>;
  unfollow(user: User["id"]): Promise<void>;
  isFollowing(user: User["id"]): boolean;
}

export const FollowContext =
  createContext<FollowContextValue | null>(null);

interface Props {
    children: ReactNode;
    isOwnProfile: boolean;
}

export function FollowProvider({ children, isOwnProfile }: Props) {
  const [following, setFollowing] = useState<User[]>(() => {
    const saved = localStorage.getItem("following");

    try {
      return saved
        ? JSON.parse(saved)
        : [];
    } catch(error) {
      console.error(error);
    }

  });

  const followingCount = following.length;

  useEffect(() => {
    localStorage.setItem(
      "following",
      JSON.stringify(following)
    );
  }, [following]);

  const follow = async (user: User) => {
    try {
      await followApi.follow({
        targetUserId: user.id,
      });

      if (!isOwnProfile) {
        setFollowing(prev => {
          const exists = prev.some(
            item => item.id === user.id
          );

          if (exists) {
            return prev;
          }

          return [
            ...prev, user
          ];
        });
      }

    } catch(error) {
      console.error(error);
    }
  };

  const unfollow = async (userId: User["id"]) => {
    try {
      await followApi.unfollow({
        targetUserId: userId,
      });

      if (!isOwnProfile) {
        setFollowing(prev => 
          prev.filter(user => user.id !== userId)
        );
      }
      
    } catch(error) {
      console.error(error);
    }
  };

  const isFollowing = useCallback(
    (userId: User["id"]) => {
      return following.some(user => user.id === userId);
    },
    [following]
  );

  return (
    <FollowContext.Provider
      value={{
        following,
        followingCount,
        follow,
        unfollow,
        isFollowing,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}
