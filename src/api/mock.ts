/** @format */
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import type { User } from "@/types/user";
import type { Tweet } from "@/types/tweet";

/*
 * Мок-режим для розробки без бекенду.
 * Вмикається через VITE_USE_MOCK=true у .env
 * Дані живуть у пам'яті сторінки (скидаються при перезавантаженні)
 */

export const MOCK_ENABLED = import.meta.env.VITE_USE_MOCK === "true";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const currentUser: User = {
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

const sampleAuthors: User[] = [
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

let tweets: Tweet[] = [
  {
    id: "t1",
    content: "Щойно задеплоїв першу версію свого клону Twitter. Летимо!",
    author: sampleAuthors[0],
    likesCount: 12,
    repliesCount: 3,
    retweetsCount: 1,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "t2",
    content: "Математика — це мова, якою написаний Всесвіт.",
    author: sampleAuthors[1],
    likesCount: 340,
    repliesCount: 21,
    retweetsCount: 58,
    likedByMe: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "t3",
    content: "Talk is cheap. Show me the code.",
    author: sampleAuthors[2],
    likesCount: 1200,
    repliesCount: 96,
    retweetsCount: 210,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

let idCounter = 100;

export const mockAuthApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    await delay();
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: { ...currentUser, email: data.email },
    };
  },
  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay();
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        ...currentUser,
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        followersCount: 0,
        followingCount: 0,
      },
    };
  },
  async logout(): Promise<void> {
    await delay(150);
  },
  async me(): Promise<User> {
    await delay(200);
    return currentUser;
  },
};

export const mockUserApi = {
  async getByUsername(username: string): Promise<User> {
    await delay();
    const found = sampleAuthors.find((u) => u.username === username);
    if (!found) throw new Error("Користувача не знайдено");
    return found;
  },
};

export const mockTweetApi = {
  async getFeed(): Promise<Tweet[]> {
    await delay();
    return [...tweets];
  },
  async getByUsername(username: string): Promise<Tweet[]> {
    await delay();
    return tweets.filter((t) => t.author.username === username);
  },
  async create(content: string): Promise<Tweet> {
    await delay(300);
    const tweet: Tweet = {
      id: `t${idCounter++}`,
      content,
      author: currentUser,
      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      likedByMe: false,
      createdAt: new Date().toISOString(),
    };
    tweets = [tweet, ...tweets];
    return tweet;
  },
  async toggleLike(id: string) {
    await delay(150);
    tweets = tweets.map((t) =>
      t.id === id
        ? {
            ...t,
            likedByMe: !t.likedByMe,
            likesCount: t.likedByMe ? t.likesCount - 1 : t.likesCount + 1,
          }
        : t,
    );
    const tweet = tweets.find((t) => t.id === id)!;
    return { likedByMe: tweet.likedByMe, likesCount: tweet.likesCount };
  },
};
