/** @format */

import type { User } from "@/types/user";

import { locations } from "@/mock/data/locations";

export const currentUser: User = {
  id: "u1",
  username: "dev_user",
  displayName: "Розробник",
  email: "dev@example.com",
  bio: "Пишу клон Twitter на React + ASP.NET.",
  location: locations[0],
  avatarUrl: undefined,
  bannerUrl: undefined,

  followersCount: 128,
  followingCount: 87,
  postsCount: 3,

  isFollowedByCurrentUser: false,
  isVerified: false,

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
    postsCount: 1,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2023-01-01T00:00:00Z",
  },

  {
    id: "u3",
    username: "linus",
    displayName: "Linus",
    email: "linus@example.com",

    followersCount: 4200,
    followingCount: 3,
    postsCount: 1,

    isFollowedByCurrentUser: false,
    isVerified: false,

    createdAt: "2023-05-01T00:00:00Z",
  },

  {
    id: "u4",
    username: "margaret",
    displayName: "Margaret Hamilton",
    email: "margaret@example.com",

    followersCount: 3100,
    followingCount: 18,
    postsCount: 2,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2023-08-15T00:00:00Z",
  },

  {
    id: "u5",
    username: "josino",
    displayName: "Jonny Sino",
    email: "jonny@example.com",

    followersCount: 5600,
    followingCount: 27,
    postsCount: 4,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2023-11-20T00:00:00Z",
  },
];
