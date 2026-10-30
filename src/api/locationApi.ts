import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";

import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockLocationApi } from "@/mock/handlers/mockLocationApi";

import type { Location } from "@/types/location";

const realLocationApi = {
  search: (query: string, signal?: AbortSignal) =>
    apiClient.get<Location[]>(
      `${ENDPOINTS.search.locations}?q=${encodeURIComponent(query)}`,
      { signal },
    ),
};

export const locationApi = MOCK_ENABLED ? mockLocationApi : realLocationApi;
