import { useMemo } from "react";
import { errorMessage } from "@/store/postsApi";
import {
  useGetTrendsQuery,
  useGetRecommendedUsersInfiniteQuery,
} from "@/store/sharedApi";
import type {
  RecommendationCategory,
  TrendRecommendation,
  UserShort,
} from "@/types";

const EMPTY_TRENDS: TrendRecommendation[] = [];
const EMPTY_USERS: UserShort[] = [];

export function useTrends(limit = 4) {
  const query = useGetTrendsQuery(limit);
  return {
    trends: query.data?.items ?? EMPTY_TRENDS,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
  };
}

export function useRecommendedUsers(
  category: RecommendationCategory,
  limit: number,
) {
  const query = useGetRecommendedUsersInfiniteQuery({ category, limit });
  const users = useMemo(() => {
    if (!query.data) return EMPTY_USERS;

    const known = new Set<string>();

    return query.data.pages
      .flatMap((page) => page.items ?? [])
      .filter((user) => {
        if (known.has(user.id)) return false;
        known.add(user.id);
        return true;
      });
  }, [query.data]);
  return {
    users,
    nextCursor: query.data?.pages.at(-1)?.nextCursor ?? null,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
    loadMore: query.fetchNextPage,
  };
}
