import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockCommentApi } from "@/mock/handlers";
import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";

import type {
  CreateCommentRequest,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  ToggleRepostResponse,
  UpdateCommentRequest,
} from "@/types/tweet";

const realCommentApi = {
  getById: async (id: string) => {
    const comment = await apiClient.get<BackendPost>(
      ENDPOINTS.comments.byId(id),
    );

    return mapPostToTweet(comment);
  },

  getByPostId: async (postId: string) => {
    const comments = await apiClient.get<BackendPost[]>(
      ENDPOINTS.comments.byPost(postId),
    );

    return comments.map(mapPostToTweet);
  },

  create: async (data: CreateCommentRequest) => {
    const comment = await apiClient.post<BackendPost>(
      ENDPOINTS.comments.create,
      data,
    );

    return mapPostToTweet(comment);
  },

  update: async (id: string, data: UpdateCommentRequest) => {
    const comment = await apiClient.put<BackendPost>(
      ENDPOINTS.comments.update(id),
      data,
    );

    return mapPostToTweet(comment);
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
