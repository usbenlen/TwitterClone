import { MOCK_DELAYS } from "@/mock/constants";

import { ApiError } from "@/api/client";

import { TREND_FEEDBACK_OPTIONS } from "@/constants/trendFeedback";

import { currentUser, mockTrends, sampleAuthors, tweets } from "@/mock/data";
import { mockFollowing } from "@/mock/data/follow";
import { mockTrendCategories } from "@/mock/data/recommendations";

import { delay } from "@/mock/utils/delay";
import { toUserShort } from "@/utils/user";

import type {
  PaginatedRecommendations,
  ExploreCategory,
  TrendFeedbackRequest,
  PaginatedRecommendedPosts,
  TrendRecommendationsResponse,
  User,
} from "@/types";

const feedbackByUser = new Map<
  string,
  Map<string, TrendFeedbackRequest["reason"]>
>();

function validateLimit(limit: number) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new ApiError(400, "Кількість тем має бути від 1 до 50");
}

function selectTrends(limit: number, category?: ExploreCategory) {
  validateLimit(limit);
  const hidden = feedbackByUser.get(currentUser.id);
  return mockTrends
    .filter((trend) =>
      !hidden?.has(trend.id) &&
      (!category || mockTrendCategories[category].includes(trend.id)),
    )
    .slice(0, limit);
}

const recommendedUsernames = [
  "margaret",
  "josino",
  "grace",
  "alan",
  "katherine",
  "guido",
];

export const mockRecommendationsApi = {
  async posts(
    limit: number,
    cursor?: string | null,
  ): Promise<PaginatedRecommendedPosts> {
    await delay(MOCK_DELAYS.RECOMMENDATIONS);

    const start = Math.max(0, Number.parseInt(cursor ?? "0", 10) || 0);
    const sorted = [...tweets].sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
        a.id.localeCompare(b.id),
    );
    const items = sorted.slice(start, start + limit);

    const next = start + items.length;

    return {
      items,
      nextCursor: next < sorted.length ? String(next) : null,
      hasMore: next < sorted.length,
    };
  },

  async trends(limit: number): Promise<TrendRecommendationsResponse> {
    await delay(MOCK_DELAYS.WRITE);
    return { items: selectTrends(limit) };
  },

  async explore(category: ExploreCategory, limit: number): Promise<TrendRecommendationsResponse> {
    await delay(MOCK_DELAYS.WRITE);
    if (!Object.hasOwn(mockTrendCategories, category)) throw new ApiError(400, "Невідома категорія тем.");

    return { items: selectTrends(limit, category) };
  },

  async feedback({ trendId, reason }: TrendFeedbackRequest): Promise<void> {
    const userId = currentUser.id;
    await delay(MOCK_DELAYS.WRITE);

    if (typeof trendId !== "string" || !trendId.trim()) throw new ApiError(400, "Вкажіть тему для відгуку");
    if (!TREND_FEEDBACK_OPTIONS.some((option) => option.reason === reason)) throw new ApiError(400, "Некоректна причина відгуку");
    if (!mockTrends.some((trend) => trend.id === trendId)) throw new ApiError(404, "Тему не знайдено");

    const feedback = feedbackByUser.get(userId) ?? new Map();
    feedback.set(trendId, reason);
    feedbackByUser.set(userId, feedback);
  },

  async users(
    limit: number,
    cursor?: string | null,
  ): Promise<PaginatedRecommendations> {
    await delay(MOCK_DELAYS.RECOMMENDATIONS);

    const start = Math.max(0, Number.parseInt(cursor ?? "0", 10) || 0);
    const following = new Set(
      (mockFollowing[currentUser.id] ?? []).map((user) => user.id),
    );

    const users = recommendedUsernames
      .map((username) =>
        sampleAuthors.find((user) => user.username === username),
      )
      .filter((user): user is User =>
        Boolean(user && user.id !== currentUser.id && !following.has(user.id)),
      );

    const page = users.slice(start, start + limit);
    const nextOffset = start + page.length;

    return {
      items: page.map(toUserShort),
      nextCursor: nextOffset < users.length ? String(nextOffset) : null,
      hasMore: nextOffset < users.length,
    };
  },
};
