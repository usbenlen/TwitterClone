import type { ExploreCategory, ExploreTab } from "@/types/recommendations";

export const EXPLORE_TABS: ReadonlyArray<{ value: ExploreTab; label: string }> =
  [
    { value: "overview", label: "Огляд" },
    { value: "trending", label: "Популярне" },
    { value: "news", label: "Новини" },
    { value: "sports", label: "Спорт" },
    { value: "entertainment", label: "Розваги" },
  ];

export const EXPLORE_LIMITS = { NEWS: 3, POSTS: 10 } as const;

export const EXPLORE_CATEGORY_KEYWORDS: Record<
  ExploreCategory,
  readonly string[]
> = {
  news: [
    "новин",
    "політик",
    "економ",
    "суспіль",
    "news",
    "politic",
    "econom",
    "world",
  ],
  sports: [
    "спорт",
    "футбол",
    "баскетбол",
    "теніс",
    "олімп",
    "sport",
    "football",
    "soccer",
    "basketball",
    "tennis",
    "olympic",
  ],
  entertainment: [
    "розваг",
    "кіно",
    "фільм",
    "музик",
    "серіал",
    "ігров",
    "entertainment",
    "cinema",
    "movie",
    "music",
    "gaming",
    "games",
  ],
};
