import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import type { Gif } from "@/types/gif";

const realGifApi = {
  search(query?: string) {
    const normalizedQuery = query?.trim();

    if (!normalizedQuery) return apiClient.get<Gif[]>(ENDPOINTS.search.gifs);

    return apiClient.get<Gif[]>(
      `${ENDPOINTS.search.gifs}?q=${encodeURIComponent(normalizedQuery)}`,
    );
  },
};

export const gifApi = realGifApi;
