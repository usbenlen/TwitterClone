import type { Post } from "@/features/content/types";
import type { UserShort } from "@/features/profiles/types";
import type { CursorPage } from "@/shared/types";

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
export type PaginatedRecommendedPosts = CursorPage<Post>;

export type ExploreCategory = "news" | "sports" | "entertainment";
export type ExploreTab = "overview" | "trending" | ExploreCategory;

export type TrendFeedbackReason =
  | "irrelevant_content"
  | "spam"
  | "abusive"
  | "not_interested"
  | "duplicate"
  | "harmful_or_spam";

export interface TrendFeedbackRequest {
  trendId: string;
  reason: TrendFeedbackReason;
}

export type TrendFeedbackSource = "explore" | "sidebar";
