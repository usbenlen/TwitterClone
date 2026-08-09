/** @format */

import type { Gif } from "@/types/gif";

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

export const gifApi = {
  search(query: string) {
    return apiClient.get<Gif[]>(
      `${ENDPOINTS.gifs.search}?q=${encodeURIComponent(query)}`,
    );
  },
};
