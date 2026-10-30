import type { ExploreTab } from "@/features/discovery/types";

export const EXPLORE_TABS: ReadonlyArray<{ value: ExploreTab; label: string }> =
  [
    { value: "overview", label: "Огляд" },
    { value: "trending", label: "Популярне" },
    { value: "news", label: "Новини" },
    { value: "sports", label: "Спорт" },
    { value: "entertainment", label: "Розваги" },
  ];

export const EXPLORE_LIMITS = { NEWS: 3, POSTS: 10 } as const;
