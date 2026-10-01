import type { User, UserShort, Tweet } from "@/types";

export function toTweetAuthor(user: User): Tweet["author"] {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? null,
    isVerified: user.isVerified,
  };
}

export function toUserShort(user: User): UserShort {
  return { ...toTweetAuthor(user), bio: user.bio, location: user.location };
}
