import { mapScheduledLinkPreview } from "@/features/content/api/mappers/postRequestMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockScheduledPostApi } from "@/mock/handlers/mockScheduledPostApi";

import type { Post } from "@/features/content/types";
import type {
  CreateScheduledPostRequest,
  ScheduledPost,
  UpdateScheduledPostRequest,
} from "@/features/scheduling/types";

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
