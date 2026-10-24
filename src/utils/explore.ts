import { EXPLORE_CATEGORY_KEYWORDS, EXPLORE_TABS } from "@/constants/explore";

import type {
  ExploreCategory,
  ExploreTab,
  TrendRecommendation,
} from "@/types/recommendations";

export function parseExploreTab(value: string | null): ExploreTab {
  return EXPLORE_TABS.find((tab) => tab.value === value)?.value ?? "overview";
}

export function filterExploreTrends(
  trends: TrendRecommendation[],
  category: ExploreCategory,
): TrendRecommendation[] {
  return trends.filter((trend) => {
    const text = `${trend.title} ${trend.context}`
      .normalize("NFKC")
      .toLowerCase();

    return EXPLORE_CATEGORY_KEYWORDS[category].some((keyword) => text.includes(keyword),
    );
  });
}
