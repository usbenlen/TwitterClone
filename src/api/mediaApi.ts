import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";

import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockMediaApi } from "@/mock/handlers/mockMediaApi";

import type { MediaAttachment } from "@/types/media";

const realMediaApi = {
  async upload(file: File): Promise<MediaAttachment> {
    const formData = new FormData();
    formData.append("File", file);

    return apiClient.post<MediaAttachment>(ENDPOINTS.media.upload, formData);
  },

  getById: (id: string) => apiClient.get<MediaAttachment>(ENDPOINTS.media.byId(id)),
};

export const mediaApi = MOCK_ENABLED ? mockMediaApi : realMediaApi;
