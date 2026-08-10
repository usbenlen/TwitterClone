/** @format */

import type { Comment } from "@/types/comment";

import { currentUser, sampleAuthors } from "@/mock/data/users";

export const commentsByPostId: Record<string, Comment[]> = {
  t1: [
    {
      id: "c1",
      postId: "t1",
      parentCommentId: null,
      content: "Класний старт, вітаю з деплоєм.",
      author: {
        id: sampleAuthors[1].id,
        username: sampleAuthors[1].username,
        displayName: sampleAuthors[1].displayName,
        location: sampleAuthors[1].location,
        avatarUrl: sampleAuthors[1].avatarUrl ?? null,
        isVerified: sampleAuthors[1].isVerified,
      },
      likesCount: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updatedAt: null,
    },
    {
      id: "c2",
      postId: "t1",
      parentCommentId: null,
      content: "Чекаємо наступні фічі.",
      author: {
        id: sampleAuthors[2].id,
        username: sampleAuthors[2].username,
        displayName: sampleAuthors[2].displayName,
        location: sampleAuthors[2].location,
        avatarUrl: sampleAuthors[2].avatarUrl ?? null,
        isVerified: sampleAuthors[2].isVerified,
      },
      likesCount: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
      updatedAt: null,
    },
    {
      id: "c3",
      postId: "t1",
      parentCommentId: null,
      content: "Дякую, вже працюю далі.",
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        location: currentUser.location,
        avatarUrl: currentUser.avatarUrl ?? null,
        isVerified: currentUser.isVerified,
      },
      likesCount: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      updatedAt: null,
    },
  ],
};

let commentIdCounter = 100;

export const nextCommentId = () => `c${commentIdCounter++}`;
