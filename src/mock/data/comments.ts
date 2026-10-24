import type { Tweet } from "@/types";

import { currentUser, sampleAuthors } from "@/mock/data/users";
import { tweets } from "@/mock/data/tweets";
import { discoveryCommentSeeds } from "@/mock/data/discoveryComments";

import { MILLISECONDS_PER_MINUTE } from "@/constants/date";

import { toTweetAuthor } from "@/utils/user";

const author = toTweetAuthor;

const discoveryCommentsByPostId: Record<string, Tweet[]> = Object.fromEntries(
  Object.entries(discoveryCommentSeeds).map(([postId, seeds]) => {
    const post = tweets.find((tweet) => tweet.id === postId)!;
    return [
      postId,
      seeds.map(({ minutesAfterPost, ...seed }): Tweet => {
        const parent = seeds.find(
          (comment) => comment.id === seed.parentCommentId,
        );
        return {
          attachments: [],
          likesCount: 0,
          ...seed,
          author: author(seed.author),
          versionId: `${seed.id}-v1`,
          postId,
          parentCommentId: seed.parentCommentId ?? null,
          isComment: true,
          replyToUsername: parent?.author.username ?? post.author.username,
          repliesCount: seeds.filter(
            (comment) => comment.parentCommentId === seed.id,
          ).length,
          retweetsCount: 0,
          viewsCount: 0,
          likedByMe: false,
          repostedByMe: false,
          bookmarkedByMe: false,
          createdAt: new Date(
            Date.parse(post.createdAt) +
              minutesAfterPost * MILLISECONDS_PER_MINUTE,
          ).toISOString(),
          updatedAt: null,
        };
      }),
    ];
  }),
);

export const commentsByPostId: Record<string, Tweet[]> = {
  t1: [
    {
      id: "c1",
      versionId: "c1-v1",
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
      versionId: "c2-v1",
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
      versionId: "c3-v1",
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
      versionId: "c4-v1",
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
      versionId: "c5-v1",
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
      versionId: "c6-v1",
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
  ...discoveryCommentsByPostId,
};

let commentIdCounter = 100;

export const nextCommentId = () => `c${commentIdCounter++}`;
