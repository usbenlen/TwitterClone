import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types/comment";

import { tweets, setTweets } from "@/mock/data/tweets";
import { commentsByPostId, nextCommentId } from "@/mock/data/comments";
import { currentUser } from "@/mock/data/users";

import { delay } from "@/mock/utils/delay";

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

function findComment(id: string) {
  for (const [postId, comments] of Object.entries(commentsByPostId)) {
    const index = comments.findIndex((comment) => comment.id === id);

    if (index !== -1) {
      return {
        postId,
        comments,
        index,
        comment: comments[index],
      };
    }
  }

  return null;
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

    return [...(commentsByPostId[postId] ?? [])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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

      retweetsCount: 0,
      isRepostedByCurrentUser: false,

      repliesCount: 0,

      viewsCount: 0,

      isBookmarkedByCurrentUser: false,

      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    commentsByPostId[data.postId] = [
      ...(commentsByPostId[data.postId] ?? []),
      comment,
    ];
    updateReplyCount(data.postId, 1);

    return comment;
  },

  async update(id: string, data: UpdateCommentRequest): Promise<Comment> {
    await delay(180);

    for (const [postId, comments] of Object.entries(commentsByPostId)) {
      const commentIndex = comments.findIndex((item) => item.id === id);

      if (commentIndex === -1) continue;

      const existing = comments[commentIndex];

      if (existing.author.id !== currentUser.id)
        throw new Error("Ви не можете редагувати цей коментар.");

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

      if (existing.author.id !== currentUser.id)
        throw new Error("Ви не можете видалити цей коментар.");

      commentsByPostId[postId] = comments.filter((item) => item.id !== id);
      updateReplyCount(postId, -1);
      return;
    }

    throw new Error("Коментар не знайдено.");
  },

  async like(id: string) {
    await delay(120);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const next = {
      ...found.comment,
      likesCount: found.comment.likesCount + 1,
      isLikedByCurrentUser: true,
    };

    found.comments[found.index] = next;

    return {
      likesCount: next.likesCount,
      isLikedByCurrentUser: next.isLikedByCurrentUser,
    };
  },

  async unlike(id: string) {
    await delay(120);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const next = {
      ...found.comment,
      likesCount: Math.max(0, found.comment.likesCount - 1),
      isLikedByCurrentUser: false,
    };

    found.comments[found.index] = next;

    return {
      likesCount: next.likesCount,
      isLikedByCurrentUser: next.isLikedByCurrentUser,
    };
  },

  async toggleLike(id: string, likedByMe: boolean) {
    return likedByMe ? this.unlike(id) : this.like(id);
  },

  async repost(id: string) {
    await delay(120);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const next = {
      ...found.comment,
      retweetsCount: (found.comment.retweetsCount ?? 0) + 1,
      isRepostedByCurrentUser: true,
    };

    found.comments[found.index] = next;

    return {
      retweetsCount: next.retweetsCount ?? 0,
      isRepostedByCurrentUser: Boolean(next.isRepostedByCurrentUser),
    };
  },

  async unrepost(id: string) {
    await delay(120);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const next = {
      ...found.comment,
      retweetsCount: Math.max(0, (found.comment.retweetsCount ?? 0) - 1),
      isRepostedByCurrentUser: false,
    };

    found.comments[found.index] = next;

    return {
      retweetsCount: next.retweetsCount ?? 0,
      isRepostedByCurrentUser: false,
    };
  },

  async toggleRepost(id: string, repostedByMe: boolean) {
    return repostedByMe ? this.unrepost(id) : this.repost(id);
  },

  async bookmark(id: string) {
    await delay(120);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const next = {
      ...found.comment,
      isBookmarkedByCurrentUser: true,
    };

    found.comments[found.index] = next;

    return {
      isBookmarkedByCurrentUser: true,
    };
  },

  async unbookmark(id: string) {
    await delay(120);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const next = {
      ...found.comment,
      isBookmarkedByCurrentUser: false,
    };

    found.comments[found.index] = next;

    return {
      isBookmarkedByCurrentUser: false,
    };
  },

  async toggleBookmark(id: string, bookmarkedByMe: boolean) {
    return bookmarkedByMe ? this.unbookmark(id) : this.bookmark(id);
  },

  async view(id: string) {
    await delay(80);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    found.comments[found.index] = {
      ...found.comment,
      viewsCount: (found.comment.viewsCount ?? 0) + 1,
    };
  },
};
