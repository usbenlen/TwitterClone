/** @format */

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockCommentApi } from "@/mock/handlers";

import type {
  Comment,
  CreateCommentRequest,
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
};

export const commentApi = MOCK_ENABLED ? mockCommentApi : realCommentApi;
