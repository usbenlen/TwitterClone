import {
  getQuoteReplyingToUsernames,
  withAncestors,
} from "@/features/content/lib/posts/ancestors";
import { commentsByPostId } from "@/mock/data/comments";
import { nextPostId, posts, setPosts } from "@/mock/data/posts";
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
import { selectMockComments } from "@/mock/utils/selectMockComments";
import {
  resolveMockMedia,
  validateMockPost,
} from "@/mock/utils/validateMockPost";

import type {
  CreatePostRequest,
  Post,
  PostQuote,
  UpdatePostRequest,
} from "@/features/content/types";

function resolveQuote(payload: CreatePostRequest): PostQuote | null {
  if (payload.quotedPostId && payload.quotedCommentId)
    throw new Error("Quote може посилатися лише на один матеріал.");

  const targetType = payload.quotedCommentId ? "comment" : "post";
  const targetId = payload.quotedCommentId ?? payload.quotedPostId;
  if (!targetId) return null;

  let target: Post | undefined;

  if (targetType === "comment") {
    for (const [postId, comments] of Object.entries(commentsByPostId)) {
      const comment = comments.find((item) => item.id === targetId);
      if (!comment) continue;

      const rootPost = posts.find((item) => item.id === postId);
      target = withAncestors(comment, rootPost, comments);
      break;
    }
  } else {
    target = posts.find((item) => item.id === targetId);
  }

  if (!target) throw new Error("Матеріал для Quote не знайдено.");

  const snapshot = editHistoryStore.getVersion(
    targetType,
    target,
    payload.quotedTargetVersionId,
  );

  if (!snapshot) throw new Error("Версію матеріалу для Quote не знайдено.");

  return {
    targetType,
    targetId,
    targetVersionId: snapshot.versionId,
    hasNewVersion: snapshot.versionId !== target.versionId,
    replyingToUsernames:
      targetType === "comment" ? getQuoteReplyingToUsernames(target) : [],
    target: {
      ...snapshot,
      quote: snapshot.quote ? { ...snapshot.quote, target: null } : null,
    },
  };
}

export const mockPostApi = {
  async getFeed(): Promise<Post[]> {
    await delay();

    return [...posts];
  },

  async getBookmarked(): Promise<Post[]> {
    await delay();

    return [
      ...posts.filter((post) => post.bookmarkedByMe),
      ...selectMockComments((comment) => comment.bookmarkedByMe),
    ];
  },

  async getById(id: string): Promise<Post> {
    await delay();

    const post = posts.find((post) => post.id === id);

    if (!post) throw new Error("Пост не знайдено.");

    return post;
  },

  async getByUsername(username: string): Promise<Post[]> {
    await delay();

    return posts.filter((post) => post.author.username === username);
  },

  async create(payload: CreatePostRequest): Promise<Post> {
    await delay(MOCK_DELAYS.WRITE);

    const attachments = resolveMockMedia(payload.mediaIds);
    validateMockPost(payload.content, attachments, payload.poll);
    const quote = resolveQuote(payload);

    const poll = payload.poll ? createMockPoll(payload.poll) : undefined;

    const post: Post = {
      id: nextPostId(),
      versionId: crypto.randomUUID(),
      content: payload.content,

      attachments,
      poll,
      quote,

      author: currentUser,

      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date().toISOString(),
      updatedAt: null,

      location: payload.location ?? null,
      linkPreview: payload.linkPreview ?? null,
    };

    setPosts([post, ...posts]);
    editHistoryStore.recordCreation("post", post);

    return post;
  },

  async update(id: string, data: UpdatePostRequest): Promise<Post> {
    await delay(MOCK_DELAYS.READ);

    const postIndex = posts.findIndex((post) => post.id === id);

    if (postIndex === -1) throw new Error("Пост не знайдено.");

    const existing = posts[postIndex];

    if (existing.author.id !== currentUser.id)
      throw new Error("Ви не можете редагувати цей пост.");

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
      content: data.content !== undefined ? data.content : existing.content,
      attachments,
      poll,
      location: data.location !== undefined ? data.location : existing.location,
      linkPreview:
        data.linkPreview !== undefined
          ? data.linkPreview
          : existing.linkPreview,
      updatedAt: new Date().toISOString(),
    };

    let nextPosts = [...posts];
    nextPosts[postIndex] = updated;
    nextPosts = markQuotedTargetEdited(nextPosts, "post", updated.id);

    setPosts(nextPosts);
    editHistoryStore.recordEdit("post", existing, updated);

    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay(MOCK_DELAYS.COMMENT_READ);

    const post = posts.find((item) => item.id === id);

    if (!post) throw new Error("Пост не знайдено.");

    if (post.author.id !== currentUser.id)
      throw new Error("Ви не можете видалити цей пост.");

    removeMockContent("post", id);
  },

  async getEditHistory(id: string) {
    await delay(MOCK_DELAYS.HISTORY);

    const post = posts.find((item) => item.id === id);
    if (!post) throw new Error("Пост не знайдено.");

    return editHistoryStore.getHistory("post", post);
  },

  async toggleLike(id: string, likedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const result = toggleLikeInList(posts, id, likedByMe);

    setPosts(result.items);

    return result.response;
  },

  async toggleRepost(id: string, repostedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const result = toggleRepostInList(posts, id, repostedByMe);

    setPosts(result.items);

    return result.response;
  },

  async toggleBookmark(id: string, bookmarkedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const result = toggleBookmarkInList(posts, id, bookmarkedByMe);

    setPosts(result.items);

    return result.response;
  },

  async view(id: string): Promise<void> {
    await delay(MOCK_DELAYS.VIEW);

    const updated = incrementViewsInList(posts, id);

    setPosts(updated);
  },
};
