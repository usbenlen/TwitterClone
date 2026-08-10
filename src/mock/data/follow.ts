/** @format */

import type { FollowUser } from "@/types/follow";

export const mockFollowing: Record<string, FollowUser[]> = {
  u1: [
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
    },
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
    },
  ],

  u2: [
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
    },
  ],

  u3: [
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
    },
  ],
};

export const mockFollowers: Record<string, FollowUser[]> = {
  u1: [
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
    },
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
    },
  ],

  u2: [
    {
      id: "u1",
      username: "dev_user",
      displayName: "Розробник",
    },
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
    },
  ],

  u3: [
    {
      id: "u1",
      username: "dev_user",
      displayName: "Розробник",
    },
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
    },
  ],
};
