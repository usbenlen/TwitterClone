import type { Tweet } from "@/types";

import { currentUser, sampleAuthors } from "@/mock/data/users";

const author = (user: (typeof sampleAuthors)[number]) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl ?? null,
  isVerified: user.isVerified,
});

export const commentsByPostId: Record<string, Tweet[]> = {
  t1: [
    {
      id: "c1",
      postId: "t1",
      parentCommentId: null,
      isComment: true,
      replyToUsername: null,

      content: "Класний старт, вітаю з деплоєм.",
      author: author(sampleAuthors[1]),
      attachments: [],

      likesCount: 4,
      repliesCount: 2,
      retweetsCount: 33,
      viewsCount: 0,

      likedByMe: true,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updatedAt: null,
    },

    {
      id: "c2",
      postId: "t1",
      parentCommentId: null,
      isComment: true,
      replyToUsername: null,

      content: "Чекаємо наступні фічі.",
      author: author(sampleAuthors[2]),
      attachments: [],

      likesCount: 2,
      repliesCount: 0,
      retweetsCount: 0,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      updatedAt: null,
    },

    {
      id: "c3",
      postId: "t1",
      parentCommentId: "c1",
      isComment: true,
      replyToUsername: sampleAuthors[1].username,

      content: "Дякую! Наступне вже майже готове.",
      author: author(currentUser),
      attachments: [],

      likesCount: 1,
      repliesCount: 1,
      retweetsCount: 2,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      updatedAt: null,
    },

    {
      id: "c4",
      postId: "t1",
      parentCommentId: "c1",
      isComment: true,
      replyToUsername: sampleAuthors[1].username,

      content: "О, це цікаво. Чекаю 👀",
      author: author(sampleAuthors[3]),
      attachments: [],

      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
      updatedAt: null,
    },

    {
      id: "c5",
      postId: "t1",
      parentCommentId: "c3",
      isComment: true,
      replyToUsername: currentUser.username,

      content: "Тоді обов'язково покажи результат.",
      author: author(sampleAuthors[1]),
      attachments: [],

      likesCount: 3,
      repliesCount: 0,
      retweetsCount: 0,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      updatedAt: null,
    },

    {
      id: "c6",
      postId: "t1",
      parentCommentId: null,
      isComment: true,
      replyToUsername: null,

      content: "Виглядає дуже непогано 🔥",
      author: author(sampleAuthors[4]),
      attachments: [],

      likesCount: 54384565,
      repliesCount: 525200,
      retweetsCount: 77700000,
      viewsCount: 142000000,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      updatedAt: null,
    },
  ],
};

let commentIdCounter = 100;

export const nextCommentId = () => `c${commentIdCounter++}`;
