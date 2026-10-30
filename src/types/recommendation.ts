import type { CursorPage } from "@/types/api";
import type { UserShort } from "@/types/user";
import type { Post } from "@/types/post";

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
