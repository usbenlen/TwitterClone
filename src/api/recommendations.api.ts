import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockRecommendationsApi } from "@/mock/handlers";

import type {
  PaginatedRecommendations,
  RecommendationCategory,
  TrendRecommendationsResponse,
} from "@/types";

interface RecommendationsApi {
  trends(limit: number): Promise<TrendRecommendationsResponse>;
  users(
    category: RecommendationCategory,
    limit: number,
    cursor?: string | null,
  ): Promise<PaginatedRecommendations>;
}

const realRecommendationsApi: RecommendationsApi = {
  trends: (limit) => {
    const params = new URLSearchParams({ limit: String(limit) });
    return apiClient.get<TrendRecommendationsResponse>(
      `${ENDPOINTS.recommendations.trends}?${params}`,
    );
  },

  users: (category, limit, cursor) => {
    const params = new URLSearchParams({
      category,
      limit: String(limit),
    });
    if (cursor) params.set("cursor", cursor);

    return apiClient.get<PaginatedRecommendations>(
      `${ENDPOINTS.recommendations.users}?${params}`,
    );
  },
};

export const recommendationsApi: RecommendationsApi = MOCK_ENABLED
  ? mockRecommendationsApi
  : realRecommendationsApi;
