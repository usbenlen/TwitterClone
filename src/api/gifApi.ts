import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";
import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockGifApi } from "@/mock/handlers/mockGifApi";

import type { Gif } from "@/types/gif";

function isGif(value: unknown): value is Gif {
  if (!value || typeof value !== "object") return false;
  const gif = value as Partial<Gif>;

  return (
    typeof gif.id === "string" &&
    typeof gif.title === "string" &&
    typeof gif.originalUrl === "string" &&
    typeof gif.previewUrl === "string" &&
    typeof gif.width === "number" && Number.isFinite(gif.width) && gif.width > 0 &&
    typeof gif.height === "number" && Number.isFinite(gif.height) && gif.height > 0
  );
}

const realGifApi = {
  available: true,
  async search(query?: string, signal?: AbortSignal): Promise<Gif[]> {
    const normalizedQuery = query?.trim();
    const result = await apiClient.get<unknown>(
      normalizedQuery
        ? `${ENDPOINTS.search.gifs}?q=${encodeURIComponent(normalizedQuery)}`
        : ENDPOINTS.search.gifs,
      { signal },
    );

    if (!Array.isArray(result) || !result.every(isGif))
      throw new Error("Некоректна відповідь сервісу GIF");

    return result;
  },
};

export const gifApi = MOCK_ENABLED ? mockGifApi : realGifApi;
