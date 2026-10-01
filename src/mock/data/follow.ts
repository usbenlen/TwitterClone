import type { UserShort } from "@/types";
import { sampleAuthors } from "@/mock/data/users";

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

for (const relationships of [mockFollowing, mockFollowers]) {
  for (const users of Object.values(relationships)) {
    for (const user of users) {
      user.role = sampleAuthors.find((author) => author.id === user.id)?.role;
    }
  }
}
