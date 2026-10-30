import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockLocationApi } from "@/mock/handlers/mockLocationApi";

import type { Location } from "@/features/content/types";

const realLocationApi = {
  search: (query: string, signal?: AbortSignal) =>
    apiClient.get<Location[]>(
      `${ENDPOINTS.search.locations}?q=${encodeURIComponent(query)}`,
      { signal },
    ),
};

export const locationApi = MOCK_ENABLED ? mockLocationApi : realLocationApi;
