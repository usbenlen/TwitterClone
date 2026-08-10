/** @format */

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockMediaApi } from "@/mock/handlers/mockMediaApi";

import type { MediaAttachment } from "@/types/media";

interface UploadMediaOptions {
  onProgress?: (progress: number) => void;
}

const realMediaApi = {
  async upload(
    file: File,
    _options?: UploadMediaOptions,
  ): Promise<MediaAttachment> {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<MediaAttachment>(ENDPOINTS.media.upload, formData);
  },

  getById: (id: string) =>
    apiClient.get<MediaAttachment>(ENDPOINTS.media.byId(id)),
};

export const mediaApi = MOCK_ENABLED ? mockMediaApi : realMediaApi;
