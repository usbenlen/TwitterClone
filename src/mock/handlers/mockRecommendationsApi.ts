import { MOCK_DELAYS } from "@/mock/constants";

import { currentUser, mockTrends, sampleAuthors, tweets } from "@/mock/data";
import { mockFollowing } from "@/mock/data/follow";

import { delay } from "@/mock/utils/delay";
import { toUserShort } from "@/utils/user";

import type {
  PaginatedRecommendations,
  PaginatedRecommendedPosts,
  TrendRecommendationsResponse,
  User,
} from "@/types";

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
    return { items: mockTrends.slice(0, limit) };
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
