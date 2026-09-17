import type { User } from "@/types/user";

import { locations } from "@/mock/data/locations";

export const currentUser: User = {
  id: "u1",
  username: "dev_user",
  displayName: "Розробник",
  email: "dev@example.com",
  bio: "Пишу клон Twitter на React + ASP.NET.",
  location: locations[0],
  birthDate: "1995-09-15",
  birthDateVisibility: "only_me",
  birthYearVisibility: "only_me",
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
    location: locations[3],
    birthDate: "1815-12-10",
    birthDateVisibility: "public",
    birthYearVisibility: "public",

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
    location: locations[0],
    birthDate: "1969-12-28",
    birthDateVisibility: "followers",
    birthYearVisibility: "only_me",

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
    bio: "Software engineering, space exploration, and resilient systems.",
    location: locations[2],

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
    bio: "I'm jonny",
    location: locations[1],

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
    bio: "Computer scientist, teacher, and lifelong builder of useful tools.",
    location: locations[3],
    followersCount: 12800,
    followingCount: 64,
    postsCount: 128,
    isFollowedByCurrentUser: false,
    isVerified: true,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "u7",
    username: "alan",
    displayName: "Alan Turing",
    email: "alan@example.com",
    bio: "Mathematics, computing, and questions worth thinking about.",
    location: locations[2],
    followersCount: 9600,
    followingCount: 42,
    postsCount: 86,
    isFollowedByCurrentUser: false,
    isVerified: true,
    createdAt: "2024-02-10T00:00:00Z",
  },
  {
    id: "u8",
    username: "katherine",
    displayName: "Katherine Johnson",
    email: "katherine@example.com",
    bio: "Spaceflight, mathematics, and making every calculation count.",
    location: locations[1],
    followersCount: 7400,
    followingCount: 35,
    postsCount: 73,
    isFollowedByCurrentUser: false,
    isVerified: true,
    createdAt: "2024-03-05T00:00:00Z",
  },
  {
    id: "u9",
    username: "guido",
    displayName: "Guido van Rossum",
    email: "guido@example.com",
    bio: "Code, language design, and the occasional programming observation.",
    location: locations[0],
    followersCount: 6800,
    followingCount: 51,
    postsCount: 92,
    isFollowedByCurrentUser: false,
    isVerified: false,
    createdAt: "2024-04-18T00:00:00Z",
  },
];
