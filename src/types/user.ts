import type { Location } from "@/types/location";

export interface User {
  id: string;
  username: string;
  displayName?: string | null;
  email?: string | null;

  role?: "USER" | "ADMIN";

  bio?: string | null;
  location?: Location | null;

  avatarUrl?: string | null;
  bannerUrl?: string | null;

  followersCount: number;
  followingCount: number;
  postsCount: number;

  isFollowedByCurrentUser: boolean;
  isVerified: boolean;

  createdAt: string;
  isBlocked?: boolean;
}

export interface UserShort {
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  location?: Location | null;
  avatarUrl?: string | null;
  isVerified: boolean;
}
