import { EXPLORE_TABS } from "@/constants/explore";

import type { ExploreTab } from "@/types/recommendations";

export function parseExploreTab(value: string | null): ExploreTab {
  return EXPLORE_TABS.find((tab) => tab.value === value)?.value ?? "overview";
}
