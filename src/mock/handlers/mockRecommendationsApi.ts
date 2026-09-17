import { currentUser, mockTrends, sampleAuthors } from "@/mock/data";
import { delay } from "@/mock/utils/delay";

import type {
  PaginatedRecommendations,
  RecommendationCategory,
  TrendRecommendationsResponse,
  User,
  UserShort,
} from "@/types";

const recommendedUsernames: Record<RecommendationCategory, string[]> = {
  people: ["margaret", "josino", "grace", "alan", "katherine", "guido"],
  creators: ["ada", "grace", "katherine", "guido", "margaret", "josino"],
};

function toUserShort(user: User): UserShort {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    location: user.location,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
  };
}

export const mockRecommendationsApi = {
  async trends(limit: number): Promise<TrendRecommendationsResponse> {
    await delay(300);
    return { items: mockTrends.slice(0, limit) };
  },

  async users(
    category: RecommendationCategory,
    limit: number,
    cursor?: string | null,
  ): Promise<PaginatedRecommendations> {
    await delay(350);

    const start = Math.max(0, Number.parseInt(cursor ?? "0", 10) || 0);
    const usernames = recommendedUsernames[category];
    const users = usernames
      .map((username) =>
        sampleAuthors.find((user) => user.username === username),
      )
      .filter((user): user is User =>
        Boolean(user && user.id !== currentUser.id),
      );
    const page = users.slice(start, start + limit);
    const nextOffset = start + page.length;

    return {
      items: page.map(toUserShort),
      nextCursor: nextOffset < users.length ? String(nextOffset) : null,
    };
  },
};
