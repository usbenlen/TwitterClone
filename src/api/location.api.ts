import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockLocationApi } from "@/mock/handlers";

import type { Location } from "@/types/location";

const realLocationApi = {
  search: (query: string) =>
    apiClient.get<Location[]>(
      `${ENDPOINTS.search.locations}?q=${encodeURIComponent(query)}`,
    ),
};

export const locationApi = MOCK_ENABLED ? mockLocationApi : realLocationApi;
