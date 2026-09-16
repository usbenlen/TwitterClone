import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockLinkPreviewApi } from "@/mock/handlers/mockLinkPreviewApi";

import type { LinkPreview } from "@/types/linkPreview";

const realLinkPreviewApi = {
  resolve(url: string, signal?: AbortSignal): Promise<LinkPreview> {
    return apiClient.post<LinkPreview>(
      ENDPOINTS.linkPreviews.resolve,
      { url },
      { signal },
    );
  },
};

export const linkPreviewApi = MOCK_ENABLED
  ? mockLinkPreviewApi
  : realLinkPreviewApi;
