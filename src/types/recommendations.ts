import type { UserShort } from "@/types/user";

export type RecommendationCategory = "people" | "creators";

export interface TrendRecommendation {
  id: string;
  title: string;
  context: string;
  query: string;
  postsCount?: number;
}

export interface TrendRecommendationsResponse {
  items: TrendRecommendation[];
}

export interface PaginatedRecommendations {
  items: UserShort[];
  nextCursor: string | null;
}
