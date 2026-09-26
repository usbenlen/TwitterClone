import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockCommentApi } from "@/mock/handlers";

import type {
  Comment,
  CreateCommentRequest,
  ToggleCommentBookmarkResponse,
  ToggleCommentLikeResponse,
  ToggleCommentRepostResponse,
  UpdateCommentRequest,
} from "@/types/comment";

const realCommentApi = {
  getByPostId: (postId: string) =>
    apiClient.get<Comment[]>(ENDPOINTS.comments.byPost(postId)),

  create: (data: CreateCommentRequest) =>
    apiClient.post<Comment>(ENDPOINTS.comments.create, data),

  update: (id: string, data: UpdateCommentRequest) =>
    apiClient.put<Comment>(ENDPOINTS.comments.update(id), data),

  delete: (id: string) => apiClient.delete<void>(ENDPOINTS.comments.delete(id)),

  like: (id: string) =>
    apiClient.post<ToggleCommentLikeResponse>(ENDPOINTS.comments.like(id)),

  unlike: (id: string) =>
    apiClient.delete<ToggleCommentLikeResponse>(ENDPOINTS.comments.unlike(id)),

  toggleLike: (id: string, likedByMe: boolean): Promise<ToggleCommentLikeResponse> =>
    likedByMe ? realCommentApi.unlike(id) : realCommentApi.like(id),

  repost: (id: string) =>
    apiClient.post<ToggleCommentRepostResponse>(ENDPOINTS.comments.repost(id)),

  unrepost: (id: string) =>
    apiClient.delete<ToggleCommentRepostResponse>(
      ENDPOINTS.comments.unrepost(id),
    ),

  toggleRepost: (id: string, repostedByMe: boolean): Promise<ToggleCommentRepostResponse> =>
    repostedByMe ? realCommentApi.unrepost(id) : realCommentApi.repost(id),

  bookmark: (id: string) =>
    apiClient.post<ToggleCommentBookmarkResponse>(
      ENDPOINTS.comments.bookmark(id),
    ),

  unbookmark: (id: string) =>
    apiClient.delete<ToggleCommentBookmarkResponse>(
      ENDPOINTS.comments.unbookmark(id),
    ),

  toggleBookmark: (id: string, bookmarkedByMe: boolean): Promise<ToggleCommentBookmarkResponse> =>
    bookmarkedByMe
      ? realCommentApi.unbookmark(id)
      : realCommentApi.bookmark(id),

  report: (id: string) =>
      apiClient.post(ENDPOINTS.comments.report(id)),

  view: (id: string) => apiClient.post<void>(ENDPOINTS.comments.view(id)),
};

export const commentApi = MOCK_ENABLED ? mockCommentApi : realCommentApi;
