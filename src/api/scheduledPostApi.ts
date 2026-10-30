import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";
import { mapScheduledLinkPreview } from "@/api/mappers/postRequestMapper";

import { MOCK_ENABLED } from "@/config/mockConfig";

import { mockScheduledPostApi } from "@/mock/handlers/mockScheduledPostApi";

import type {
  CreateScheduledPostRequest,
  ScheduledPost,
  UpdateScheduledPostRequest,
  Post,
} from "@/types";

const realScheduledPostApi = {
  list: () => apiClient.get<ScheduledPost[]>(ENDPOINTS.posts.scheduled),

  create: (request: CreateScheduledPostRequest) => {
    const { mockMedia: _mockMedia, ...payload } = request;
    void _mockMedia;
    return apiClient.post<ScheduledPost>(ENDPOINTS.posts.scheduled, {
      ...payload,
      linkPreview: mapScheduledLinkPreview(payload.linkPreview),
    });
  },

  update: (id: string, request: UpdateScheduledPostRequest) => {
    const { mockMedia: _mockMedia, ...payload } = request;
    void _mockMedia;
    return apiClient.patch<ScheduledPost>(
      ENDPOINTS.posts.scheduledById(id),
      {
        ...payload,
        linkPreview: mapScheduledLinkPreview(payload.linkPreview),
      },
    );
  },

  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.posts.scheduledById(id)),

  publishDue: async (): Promise<Post[]> => [],
};

export const scheduledPostApi = MOCK_ENABLED
  ? mockScheduledPostApi
  : realScheduledPostApi;
