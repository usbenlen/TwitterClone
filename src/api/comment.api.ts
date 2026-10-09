import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  mapEditHistoryResponse,
  mapPostToTweet,
  type BackendPost,
  type BackendEditHistoryResponse,
} from "@/api/mappers/post.mapper";
import {
  mapCreatePostRequest,
  mapUpdateRequest,
} from "@/api/mappers/request.mapper";
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

import type { ApiError } from "@/api/client";
import type { CursorPage } from "@/types";

interface BackendThreadResponse {
  post: BackendPost;
  ancestors: BackendPost[];
  target: BackendPost;
  replies: CursorPage<BackendPost>;
}

function normalizeComment(comment: BackendPost): Tweet {
  const mapped = mapPostToTweet(comment);
  return {
    ...mapped,
    isComment: true,
  };
}

function normalizeCommentThread(thread: BackendThreadResponse): ThreadResponse {
  const post = mapPostToTweet(thread.post);
  const ancestors = [post, ...thread.ancestors.map(normalizeComment)];
  const target = normalizeComment(thread.target);

  return {
    ancestors,
    target,
    replies: thread.replies.items.map((reply) => ({
      ...normalizeComment(reply),
      ancestors: [...ancestors, target],
    })),
  };
}

const realCommentApi = {
  getByPostId: async (postId: string) => {
    const page = await apiClient.get<CursorPage<BackendPost>>(
      ENDPOINTS.comments.byPost(postId),
    );

    return page.items.map(normalizeComment);
  },

  getThread: async (id: string) => {
    try {
      const post = await apiClient.get<BackendPost>(ENDPOINTS.posts.byId(id));
      const replies = await apiClient.get<CursorPage<BackendPost>>(
        ENDPOINTS.comments.byPost(id),
      );
      const target = mapPostToTweet(post);

      return {
        ancestors: [],
        target,
        replies: replies.items.map((reply) => ({
          ...normalizeComment(reply),
          ancestors: [target],
        })),
      };
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("status" in error) ||
        (error as ApiError).status !== 404
      )
        throw error;
    }

    const thread = await apiClient.get<BackendThreadResponse>(
      ENDPOINTS.comments.thread(id),
    );

    return normalizeCommentThread(thread);
  },

  getEditHistory: async (id: string) => {
    const history = await apiClient.get<BackendEditHistoryResponse>(
      ENDPOINTS.comments.editHistory(id),
    );

    return mapEditHistoryResponse(history);
  },

  getBookmarked: async () => {
    const page = await apiClient.get<{
      posts: BackendPost[];
      comments: BackendPost[];
    }>(ENDPOINTS.posts.bookmarked);

    return page.comments.map(normalizeComment);
  },

  create: async (data: CreateCommentRequest) => {
    const comment = await apiClient.post<BackendPost>(
      ENDPOINTS.comments.create,
      mapCreatePostRequest(data),
    );

    return normalizeComment(comment);
  },

  update: async (id: string, data: UpdateCommentRequest) => {
    const comment = await apiClient.put<BackendPost>(
      ENDPOINTS.comments.update(id),
      mapUpdateRequest(data),
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
