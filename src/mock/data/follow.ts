import type { UserShort } from "@/types";

export const mockFollowing: Record<string, UserShort[]> = {
  u1: [
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
      isVerified: true,
    },
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
      isVerified: false,
    },
  ],

  u2: [
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
      isVerified: false,
    },
  ],

  u3: [
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
      isVerified: true,
    },
  ],
};

export const mockFollowers: Record<string, UserShort[]> = {
  u1: [
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
      isVerified: true,
    },
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
      isVerified: false,
    },
  ],

  u2: [
    {
      id: "u1",
      username: "dev_user",
      displayName: "Розробник",
      isVerified: false,
    },
    {
      id: "u3",
      username: "linus",
      displayName: "Linus",
      isVerified: false,
    },
  ],

  u3: [
    {
      id: "u1",
      username: "dev_user",
      displayName: "Розробник",
      isVerified: false,
    },
    {
      id: "u2",
      username: "ada",
      displayName: "Ada Lovelace",
      isVerified: false,
    },
  ],
};
