import type { RecommendationCategory } from "@/types";

export const RECOMMENDATIONS_PAGE_LIMIT = 4;
export const RECOMMENDATION_TABS = [
  { value: "people", label: "Кого читати" },
  { value: "creators", label: "Автори для вас" },
] as const satisfies ReadonlyArray<{
  value: RecommendationCategory;
  label: string;
}>;
