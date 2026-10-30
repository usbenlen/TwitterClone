import { EXPLORE_TABS } from "@/features/discovery/constants/explore";

import type { ExploreTab } from "@/features/discovery/types";

export function parseExploreTab(value: string | null): ExploreTab {
  return EXPLORE_TABS.find((tab) => tab.value === value)?.value ?? "overview";
}
