import { mapBackendPost } from "@/features/content/api/mappers/postMapper";
import { mapUserRole } from "@/features/profiles/api/mappers/profileMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockRecommendationsApi } from "@/mock/handlers/mockRecommendationsApi";

import type { BackendPost } from "@/features/content/types";
import type {
  ExploreCategory,
  PaginatedRecommendations,
  PaginatedRecommendedPosts,
  TrendFeedbackRequest,
  TrendRecommendationsResponse,
} from "@/features/discovery/types";
import type { BackendUser } from "@/features/profiles/types";
import type { CursorPage } from "@/shared/types";

interface RecommendationsApi {
  posts(limit: number, cursor?: string | null): Promise<PaginatedRecommendedPosts>;
  trends(limit: number): Promise<TrendRecommendationsResponse>;
  explore(category: ExploreCategory, limit: number): Promise<TrendRecommendationsResponse>;
  feedback(payload: TrendFeedbackRequest): Promise<void>;
  users(
    limit: number,
    cursor?: string | null,
  ): Promise<PaginatedRecommendations>;
}

const realRecommendationsApi: RecommendationsApi = {
  posts: async (limit, cursor) => {
    const params = new URLSearchParams({ limit: String(limit) });

    if (cursor) params.set("cursor", cursor);

    const page = await apiClient.get<CursorPage<BackendPost>>(
      `${ENDPOINTS.recommendations.posts}?${params}`,
    );

    return { ...page, items: page.items.map(mapBackendPost) };
  },

  trends: (limit) =>
    apiClient.get<TrendRecommendationsResponse>(
      `${ENDPOINTS.recommendations.trends}?${new URLSearchParams({ limit: String(limit) })}`,
    ),

  explore: (category, limit) =>
    apiClient.get<TrendRecommendationsResponse>(
      `${ENDPOINTS.recommendations.explore}?${new URLSearchParams({ category, limit: String(limit) })}`,
    ),

  feedback: (payload) => apiClient.post<void>(ENDPOINTS.recommendations.trendFeedback, payload),

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
