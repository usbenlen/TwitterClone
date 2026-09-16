import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockScheduledPostApi } from "@/mock/handlers/mockScheduledPostApi";

import type {
  CreateScheduledPostRequest,
  ScheduledPost,
  Tweet,
  UpdateScheduledPostRequest,
} from "@/types";

const realScheduledPostApi = {
  list: () => apiClient.get<ScheduledPost[]>(ENDPOINTS.posts.scheduled),

  create: (request: CreateScheduledPostRequest) => {
    const { mockMedia: _mockMedia, ...payload } = request;
    void _mockMedia;
    return apiClient.post<ScheduledPost>(ENDPOINTS.posts.scheduled, payload);
  },

  update: (id: string, request: UpdateScheduledPostRequest) => {
    const { mockMedia: _mockMedia, ...payload } = request;
    void _mockMedia;
    return apiClient.patch<ScheduledPost>(
      ENDPOINTS.posts.scheduledById(id),
      payload,
    );
  },

  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.posts.scheduledById(id)),

  publishDue: async (): Promise<Tweet[]> => [],
};

export const scheduledPostApi = MOCK_ENABLED
  ? mockScheduledPostApi
  : realScheduledPostApi;
