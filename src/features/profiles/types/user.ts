import type { Location } from "@/features/content/types";

export type BirthDateVisibility = "public" | "followers" | "following" | "mutual" | "only_me";

export interface User {
  role?: "User" | "Admin";
  isBlocked?: boolean;
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
  role?: User["role"];
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  location?: Location | null;
  avatarUrl?: string | null;
  isVerified: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string | null;
  bio?: string | null;

  location?: Location | null;
  removeLocation?: boolean;

  birthDate?: string | null;
  birthDateVisibility?: BirthDateVisibility;
  birthYearVisibility?: BirthDateVisibility;
  removeBirthDate?: boolean;

  avatar?: File | null;
  removeAvatar?: boolean;

  banner?: File | null;
  removeBanner?: boolean;
}
