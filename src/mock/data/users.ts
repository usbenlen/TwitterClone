import type { User } from "@/types/user";

import { locations } from "@/mock/data/locations";

export const currentUser: User = {
  id: "u1",
  username: "dev_user",
  displayName: "Розробник",
  email: "dev@example.com",
  role: "ADMIN",
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

  {
    id: "u6",
    username: "grace",
    displayName: "Grace Hopper",
    email: "grace@example.com",

    followersCount: 7400,
    followingCount: 31,
    postsCount: 6,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2023-12-05T00:00:00Z",
  },

  {
    id: "u7",
    username: "dennis",
    displayName: "Dennis Ritchie",
    email: "dennis@example.com",

    followersCount: 5300,
    followingCount: 9,
    postsCount: 3,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2024-01-18T00:00:00Z",
  },

  {
    id: "u8",
    username: "brendan",
    displayName: "Brendan Eich",
    email: "brendan@example.com",

    followersCount: 6800,
    followingCount: 42,
    postsCount: 8,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2024-02-10T00:00:00Z",
  },

  {
    id: "u9",
    username: "guido",
    displayName: "Guido van Rossum",
    email: "guido@example.com",

    followersCount: 8200,
    followingCount: 24,
    postsCount: 5,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2024-03-22T00:00:00Z",
  },

  {
    id: "u10",
    username: "ken",
    displayName: "Ken Thompson",
    email: "ken@example.com",

    followersCount: 3900,
    followingCount: 7,
    postsCount: 2,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2024-04-14T00:00:00Z",
  },

  {
    id: "u11",
    username: "james",
    displayName: "James Gosling",
    email: "james@example.com",

    followersCount: 6100,
    followingCount: 19,
    postsCount: 7,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2024-05-30T00:00:00Z",
  },

  {
    id: "u12",
    username: "donald",
    displayName: "Donald Knuth",
    email: "donald@example.com",

    followersCount: 4700,
    followingCount: 11,
    postsCount: 4,

    isFollowedByCurrentUser: false,
    isVerified: true,

    createdAt: "2024-07-08T00:00:00Z",
  },
];
