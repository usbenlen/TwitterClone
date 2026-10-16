import type { CursorPage } from "@/types/api";
import type { UserShort } from "@/types/user";

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

export type PaginatedRecommendations = CursorPage<UserShort>;
