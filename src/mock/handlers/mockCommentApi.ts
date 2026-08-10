/** @format */

import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types/comment";

import { commentsByPostId, nextCommentId } from "@/mock/data/comments";
import { currentUser } from "@/mock/data/users";
import { delay } from "@/mock/utils/delay";
import { tweets, setTweets } from "@/mock/data/tweets";

function currentUserShort() {
  return {
    id: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName,
    location: currentUser.location,
    avatarUrl: currentUser.avatarUrl ?? null,
    isVerified: currentUser.isVerified,
  };
}

function updateReplyCount(postId: string, delta: number) {
  setTweets(
    tweets.map((tweet) =>
      tweet.id === postId
        ? {
            ...tweet,
            repliesCount: Math.max(0, tweet.repliesCount + delta),
          }
        : tweet,
    ),
  );
}

export const mockCommentApi = {
  async getByPostId(postId: string): Promise<Comment[]> {
    await delay(180);

    return [...(commentsByPostId[postId] ?? [])].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  },

  async create(data: CreateCommentRequest): Promise<Comment> {
    await delay(220);

    const comment: Comment = {
      id: nextCommentId(),
      postId: data.postId,
      parentCommentId: data.parentCommentId ?? null,
      content: data.content.trim(),
      author: currentUserShort(),
      likesCount: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    commentsByPostId[data.postId] = [...(commentsByPostId[data.postId] ?? []), comment];
    updateReplyCount(data.postId, 1);

    return comment;
  },

  async update(id: string, data: UpdateCommentRequest): Promise<Comment> {
    await delay(180);

    for (const [postId, comments] of Object.entries(commentsByPostId)) {
      const commentIndex = comments.findIndex((item) => item.id === id);

      if (commentIndex === -1) continue;

      const existing = comments[commentIndex];

      if (existing.author.id !== currentUser.id) {
        throw new Error("Ви не можете редагувати цей коментар.");
      }

      const updated: Comment = {
        ...existing,
        content: data.content.trim(),
        updatedAt: new Date().toISOString(),
      };

      commentsByPostId[postId] = comments.map((item) =>
        item.id === id ? updated : item,
      );

      return updated;
    }

    throw new Error("Коментар не знайдено.");
  },

  async delete(id: string): Promise<void> {
    await delay(180);

    for (const [postId, comments] of Object.entries(commentsByPostId)) {
      const existing = comments.find((item) => item.id === id);

      if (!existing) continue;

      if (existing.author.id !== currentUser.id) {
        throw new Error("Ви не можете видалити цей коментар.");
      }

      commentsByPostId[postId] = comments.filter((item) => item.id !== id);
      updateReplyCount(postId, -1);
      return;
    }

    throw new Error("Коментар не знайдено.");
  },
};
