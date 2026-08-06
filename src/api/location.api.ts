/** @format */

import type { Location } from "@/types/location";

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockLocationApi } from "@/mock/handlers/mockLocationApi";

const realLocationApi = {
  search(query: string) {
    return apiClient.get<Location[]>(
      `${ENDPOINTS.location.search}?q=${encodeURIComponent(query)}`,
    );
  },
};

export const locationApi = MOCK_ENABLED ? mockLocationApi : realLocationApi;
