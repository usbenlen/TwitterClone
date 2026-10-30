import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockLinkPreviewApi } from "@/mock/handlers/mockLinkPreviewApi";

import type { LinkPreview } from "@/features/content/types";

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
