import { createContext } from "react";

import type { UserShort } from "@/types";

export interface FollowContextValue {
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
