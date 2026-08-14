/** @format */

import type { Comment } from "@/types";

import {
  currentUser,
  sampleAuthors,
} from "@/mock/data/users";

const author = (user: (typeof sampleAuthors)[number]) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  location: user.location,
  avatarUrl: user.avatarUrl ?? null,
  isVerified: user.isVerified,
});

export const commentsByPostId: Record<string, Comment[]> = {
  t1: [
    {
      id: "c1",
      postId: "t1",
      parentCommentId: null,
      content: "Класний старт, вітаю з деплоєм.",
      author: author(sampleAuthors[1]),
      likesCount: 4,
      isLikedByCurrentUser: true,
      createdAt: new Date(
          Date.now() - 1000 * 60 * 18,
      ).toISOString(),
      updatedAt: null,
    },

    {
      id: "c2",
      postId: "t1",
      parentCommentId: null,
      content: "Чекаємо наступні фічі.",
      author: author(sampleAuthors[2]),
      likesCount: 2,
      isLikedByCurrentUser: false,
      createdAt: new Date(
          Date.now() - 1000 * 60 * 14,
      ).toISOString(),
      updatedAt: null,
    },

    {
      id: "c3",
      postId: "t1",
      parentCommentId: "c1",
      content: "Дякую! Наступне вже майже готове.",
      author: author(currentUser),
      likesCount: 1,
      isLikedByCurrentUser: false,
      createdAt: new Date(
          Date.now() - 1000 * 60 * 10,
      ).toISOString(),
      updatedAt: null,
    },

    {
      id: "c4",
      postId: "t1",
      parentCommentId: "c1",
      content: "О, це цікаво. Чекаю 👀",
      author: author(sampleAuthors[3]),
      likesCount: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date(
          Date.now() - 1000 * 60 * 7,
      ).toISOString(),
      updatedAt: null,
    },

    {
      id: "c5",
      postId: "t1",
      parentCommentId: "c3",
      content: "Тоді обов'язково покажи результат.",
      author: author(sampleAuthors[2]),
      likesCount: 3,
      isLikedByCurrentUser: false,
      createdAt: new Date(
          Date.now() - 1000 * 60 * 5,
      ).toISOString(),
      updatedAt: null,
    },

    {
      id: "c6",
      postId: "t1",
      parentCommentId: null,
      content: "Виглядає дуже непогано 🔥",
      author: author(sampleAuthors[4]),
      likesCount: 7,
      isLikedByCurrentUser: false,
      createdAt: new Date(
          Date.now() - 1000 * 60 * 2,
      ).toISOString(),
      updatedAt: null,
    },
  ],
};

let commentIdCounter = 100;

export const nextCommentId = () => `c${commentIdCounter++}`;