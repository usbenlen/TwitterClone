import type { User, UserShort, Post } from "@/types";

export function toPostAuthor(user: User): Post["author"] {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? null,
    isVerified: user.isVerified,
    role: user.role,
  };
}

export function toUserShort(user: User): UserShort {
  return { ...toPostAuthor(user), bio: user.bio, location: user.location };
}
