import type { CursorPage } from "@/types/api";
import type { UserShort } from "@/types/user";
import type { Tweet } from "@/types/tweet";

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
export type PaginatedRecommendedPosts = CursorPage<Tweet>;

export type ExploreCategory = "news" | "sports" | "entertainment";
export type ExploreTab = "overview" | "trending" | ExploreCategory;

export type TrendFeedbackReason =
  | "irrelevant_content"
  | "spam"
  | "abusive"
  | "not_interested"
  | "duplicate"
  | "harmful_or_spam";
