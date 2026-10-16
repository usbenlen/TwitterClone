import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { mapUserRole, type BackendUser } from "@/api/mappers/user.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockRecommendationsApi } from "@/mock/handlers";

import type {
  CursorPage,
  PaginatedRecommendations,
  TrendRecommendationsResponse,
} from "@/types";

interface RecommendationsApi {
  trends(limit: number): Promise<TrendRecommendationsResponse>;
  users(
    limit: number,
    cursor?: string | null,
  ): Promise<PaginatedRecommendations>;
}

const realRecommendationsApi: RecommendationsApi = {
  trends: (limit) =>
    apiClient.get<TrendRecommendationsResponse>(
      `${ENDPOINTS.recommendations.trends}?${new URLSearchParams({ limit: String(limit) })}`,
    ),

  users: async (limit, cursor) => {
    const params = new URLSearchParams({
      limit: String(limit),
    });
    if (cursor) params.set("cursor", cursor);

    const page = await apiClient.get<
      CursorPage<BackendUser<PaginatedRecommendations["items"][number]>>
    >(`${ENDPOINTS.recommendations.users}?${params}`);
    return { ...page, items: page.items.map(mapUserRole) };
  },
};

export const recommendationsApi: RecommendationsApi = MOCK_ENABLED
  ? mockRecommendationsApi
  : realRecommendationsApi;
