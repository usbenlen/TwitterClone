import type { Location } from "@/types/location";

export type BirthDateVisibility =
  | "public"
  | "followers"
  | "following"
  | "mutual"
  | "only_me";

export interface User {
  id: string;
  username: string;
  displayName?: string | null;
  email?: string | null;

  bio?: string | null;
  location?: Location | null;
  birthDate?: string | null;
  birthDateVisibility?: BirthDateVisibility | null;
  birthYearVisibility?: BirthDateVisibility | null;

  avatarUrl?: string | null;
  bannerUrl?: string | null;

  followersCount: number;
  followingCount: number;
  postsCount: number;

  isFollowedByCurrentUser: boolean;
  isVerified: boolean;

  createdAt: string;
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
