/** @format */

import type { User } from "@/types/user";

export const currentUser: User = {
  id: "u1",
  username: "dev_user",
  displayName: "Розробник",
  email: "dev@example.com",
  bio: "Пишу клон Twitter на React + ASP.NET.",
  avatarUrl: undefined,
  followersCount: 128,
  followingCount: 87,
  createdAt: "2024-03-01T00:00:00Z",
};

export const sampleAuthors: User[] = [
  currentUser,
  {
    id: "u2",
    username: "ada",
    displayName: "Ada Lovelace",
    email: "ada@example.com",
    followersCount: 9001,
    followingCount: 12,
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "u3",
    username: "linus",
    displayName: "Linus",
    email: "linus@example.com",
    followersCount: 4200,
    followingCount: 3,
    createdAt: "2023-05-01T00:00:00Z",
  },
];
