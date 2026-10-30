import {
  getCommentAncestors,
  withAncestors,
} from "@/features/content/lib/posts/ancestors";
import { toPostAuthor } from "@/features/profiles/lib/postAuthor";
import { commentsByPostId, nextCommentId } from "@/mock/data/comments";
import { posts, setPosts } from "@/mock/data/posts";
import { currentUser } from "@/mock/data/users";
import { MOCK_DELAYS } from "@/mock/mockConfig";
import { editHistoryStore } from "@/mock/stores/editHistoryStore";
import { delay } from "@/mock/utils/delay";
import { createMockPoll, updateMockPoll } from "@/mock/utils/mockPoll";
import {
  incrementViewsInList,
  toggleBookmarkInList,
  toggleLikeInList,
  toggleRepostInList,
} from "@/mock/utils/mockPostActions";
import { markQuotedTargetEdited } from "@/mock/utils/mockQuotes";
import { removeMockContent } from "@/mock/utils/removeMockContent";
import {
  resolveMockMedia,
  validateMockPost,
} from "@/mock/utils/validateMockPost";

import type {
  CreateCommentRequest,
  Post,
  ThreadResponse,
  UpdateCommentRequest,
} from "@/features/content/types";

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

function updateCommentCount(postId: string, delta: number) {
  setPosts(
    posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            repliesCount: Math.max(0, post.repliesCount + delta),
          }
        : post,
    ),
  );
}

export const mockCommentApi = {
  async getByPostId(postId: string): Promise<Post[]> {
    await delay(MOCK_DELAYS.COMMENT_READ);

    const comments = commentsByPostId[postId] ?? [];

    const rootPost = posts.find((post) => post.id === postId);

    return [...comments]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((comment) => withAncestors(comment, rootPost, comments));
  },

  async getThread(id: string, targetType?: "post" | "comment"): Promise<ThreadResponse> {
    await delay(MOCK_DELAYS.COMMENT_READ);

    const post = targetType === "comment" ? undefined : posts.find((item) => item.id === id);

    // Original post
    if (post) {
      const comments = commentsByPostId[post.id] ?? [];

      const replies = comments
        .filter((comment) => !comment.parentCommentId)
        .map((comment) => ({
          ...withAncestors(comment, post, comments),
          replyToUsername: post.author.username,
        }));

      return {
        ancestors: [],
        target: post,
        replies,
      };
    }

    // Comment
    const found = targetType === "post" ? null : findComment(id);

    if (!found) throw new Error("Пост або коментар не знайдено.");

    const targetComment = found.comment;

    const rootPost = posts.find((post) => post.id === targetComment.postId);

    const ancestors = getCommentAncestors(
      targetComment,
      rootPost,
      found.comments,
    );

    const target: Post = {
      ...targetComment,
      ancestors,
      replyToUsername:
        ancestors.at(-1)?.author.username ?? rootPost?.author.username ?? null,
    };

    const replies = found.comments
      .filter((comment) => comment.parentCommentId === targetComment.id)
      .map((comment) => ({
        ...withAncestors(comment, rootPost, found.comments),
        replyToUsername: targetComment.author.username,
      }));

    return {
      ancestors,
      target,
      replies,
    };
  },

  async getBookmarked(): Promise<Post[]> {
    await delay(MOCK_DELAYS.REACTION);

    return Object.values(commentsByPostId)
      .flat()
      .filter((comment) => comment.bookmarkedByMe)
      .map((comment) => {
        const comments = commentsByPostId[comment.postId ?? ""] ?? [];

        const rootPost = posts.find((post) => post.id === comment.postId);

        return withAncestors(comment, rootPost, comments);
      });
  },

  async create(data: CreateCommentRequest): Promise<Post> {
    await delay(MOCK_DELAYS.COMMENT_CREATE);

    const attachments = data.mediaIds ? resolveMockMedia(data.mediaIds) : [];
    validateMockPost(data.content, attachments, data.poll);

    const poll = data.poll ? createMockPoll(data.poll) : undefined;

    const parent = data.parentCommentId
      ? findComment(data.parentCommentId)?.comment
      : undefined;

    const post = posts.find((post) => post.id === data.postId);

    const comment: Post = {
      id: nextCommentId(),
      versionId: crypto.randomUUID(),
      content: data.content.trim(),

      author: toPostAuthor(currentUser),

      attachments,
      poll,
      location: data.location ?? null,
      linkPreview: data.linkPreview ?? null,

      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date().toISOString(),
      updatedAt: null,

      isComment: true,
      postId: data.postId,
      parentCommentId: data.parentCommentId ?? null,

      replyToUsername: parent?.author.username ?? post?.author.username ?? null,
    };

    commentsByPostId[data.postId] = [
      ...(commentsByPostId[data.postId] ?? []),
      comment,
    ];
    editHistoryStore.recordCreation("comment", comment);

    updateCommentCount(data.postId, 1);

    const comments = commentsByPostId[data.postId] ?? [];
    const rootPost = posts.find((post) => post.id === data.postId);

    return withAncestors(comment, rootPost, comments);
  },

  async update(id: string, data: UpdateCommentRequest): Promise<Post> {
    await delay(MOCK_DELAYS.COMMENT_READ);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const existing = found.comment;

    if (existing.author.id !== currentUser.id)
      throw new Error("Ви не можете редагувати цей коментар.");

    const attachments = data.mediaIds
      ? resolveMockMedia(data.mediaIds)
      : existing.attachments;

    validateMockPost(
      data.content ?? existing.content,
      attachments,
      data.poll === undefined ? existing.poll : data.poll,
    );
    const poll = updateMockPoll(data.poll, existing.poll);

    const updated: Post = {
      ...existing,
      versionId: crypto.randomUUID(),

      content:
        data.content !== undefined ? data.content.trim() : existing.content,

      attachments,
      poll,

      location: data.location !== undefined ? data.location : existing.location,

      linkPreview:
        data.linkPreview !== undefined
          ? data.linkPreview
          : existing.linkPreview,

      updatedAt: new Date().toISOString(),
    };

    found.comments[found.index] = updated;
    setPosts(markQuotedTargetEdited(posts, "comment", updated.id));
    editHistoryStore.recordEdit("comment", existing, updated);

    const rootPost = posts.find((post) => post.id === updated.postId);

    return withAncestors(updated, rootPost, found.comments);
  },

  async delete(id: string): Promise<void> {
    await delay(MOCK_DELAYS.COMMENT_READ);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    if (found.comment.author.id !== currentUser.id)
      throw new Error("Ви не можете видалити цей коментар.");

    removeMockContent("comment", id);
  },

  async getEditHistory(id: string) {
    await delay(MOCK_DELAYS.HISTORY);

    const found = findComment(id);
    if (!found) throw new Error("Коментар не знайдено");

    return editHistoryStore.getHistory("comment", found.comment);
  },

  async toggleLike(id: string, likedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const result = toggleLikeInList(found.comments, id, likedByMe);

    found.comments.splice(0, found.comments.length, ...result.items);

    return result.response;
  },

  async toggleRepost(id: string, repostedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const result = toggleRepostInList(found.comments, id, repostedByMe);

    found.comments.splice(0, found.comments.length, ...result.items);

    return result.response;
  },

  async toggleBookmark(id: string, bookmarkedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const result = toggleBookmarkInList(found.comments, id, bookmarkedByMe);

    found.comments.splice(0, found.comments.length, ...result.items);

    return result.response;
  },

  async view(id: string): Promise<void> {
    await delay(MOCK_DELAYS.VIEW);

    const found = findComment(id);

    if (!found) throw new Error("Коментар не знайдено.");

    const updated = incrementViewsInList(found.comments, id);

    found.comments.splice(0, found.comments.length, ...updated);
  },
};
