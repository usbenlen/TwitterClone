import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";

import { MOCK_ENABLED } from "@/config/mockConfig";
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
