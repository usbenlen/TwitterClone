import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockCommentApi } from "@/mock/handlers";

import type {
  CreateCommentRequest,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  ToggleRepostResponse,
  UpdateCommentRequest,
  Tweet,
  ThreadResponse,
} from "@/types/tweet";

function normalizeComment(comment: Tweet): Tweet {
  return {
    ...comment,
    isComment: true,
  };
}

function normalizeThread(thread: ThreadResponse): ThreadResponse {
  return {
    ...thread,
    ancestors: thread.ancestors.map((ancestor) =>
      ancestor.postId ? normalizeComment(ancestor) : ancestor,
    ),
    target: thread.target.isComment || thread.target.postId
      ? normalizeComment(thread.target)
      : thread.target,
    replies: thread.replies.map(normalizeComment),
  };
}

const realCommentApi = {
  getByPostId: async (postId: string) => {
    const comments = await apiClient.get<Tweet[]>(
      ENDPOINTS.comments.byPost(postId),
    );

    return comments.map(normalizeComment);
  },

  getThread: async (id: string) => {
    const thread = await apiClient.get<ThreadResponse>(
      ENDPOINTS.comments.thread(id),
    );

    return normalizeThread(thread);
  },

  getBookmarked: async () => {
    const comments = await apiClient.get<Tweet[]>(
      ENDPOINTS.comments.bookmarked,
    );

    return comments.map(normalizeComment);
  },

  create: async (data: CreateCommentRequest) => {
    const comment = await apiClient.post<Tweet>(
      ENDPOINTS.comments.create,
      data,
    );

    return normalizeComment(comment);
  },

  update: async (id: string, data: UpdateCommentRequest) => {
    const comment = await apiClient.put<Tweet>(
      ENDPOINTS.comments.update(id),
      data,
    );

    return normalizeComment(comment);
  },

  delete: (id: string) => apiClient.delete<void>(ENDPOINTS.comments.delete(id)),

  like: (id: string) =>
    apiClient.post<ToggleLikeResponse>(ENDPOINTS.comments.like(id)),

  unlike: (id: string) =>
    apiClient.delete<ToggleLikeResponse>(ENDPOINTS.comments.unlike(id)),

  toggleLike: (id: string, likedByMe: boolean): Promise<ToggleLikeResponse> =>
    likedByMe ? realCommentApi.unlike(id) : realCommentApi.like(id),

  repost: (id: string) =>
    apiClient.post<ToggleRepostResponse>(ENDPOINTS.comments.repost(id)),

  unrepost: (id: string) =>
    apiClient.delete<ToggleRepostResponse>(ENDPOINTS.comments.unrepost(id)),

  toggleRepost: (
    id: string,
    repostedByMe: boolean,
  ): Promise<ToggleRepostResponse> =>
    repostedByMe ? realCommentApi.unrepost(id) : realCommentApi.repost(id),

  bookmark: (id: string) =>
    apiClient.post<ToggleBookmarkResponse>(ENDPOINTS.comments.bookmark(id)),

  unbookmark: (id: string) =>
    apiClient.delete<ToggleBookmarkResponse>(ENDPOINTS.comments.unbookmark(id)),

  toggleBookmark: (
    id: string,
    bookmarkedByMe: boolean,
  ): Promise<ToggleBookmarkResponse> =>
    bookmarkedByMe ? realCommentApi.unbookmark(id) : realCommentApi.bookmark(id),

  view: (id: string) => apiClient.post<void>(ENDPOINTS.comments.view(id)),
};

export const commentApi = MOCK_ENABLED ? mockCommentApi : realCommentApi;
