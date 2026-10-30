import { useMemo } from "react";

import {
  useGetExploreTrendsQuery,
  useGetRecommendedUsersInfiniteQuery,
  useGetTrendsQuery,
} from "@/features/discovery/api/recommendationQueries";
import { SIDEBAR } from "@/shared/constants/layout";
import { errorMessage } from "@/shared/store/appApi";
import { useAppSelector } from "@/shared/store/hooks";

import type {
  ExploreCategory,
  TrendRecommendation,
  TrendRecommendationsResponse,
} from "@/features/discovery/types";
import type { UserShort } from "@/features/profiles/types";

const EMPTY_TRENDS: TrendRecommendation[] = [];
const EMPTY_USERS: UserShort[] = [];

export function useTrends(limit: number = SIDEBAR.TRENDS_LIMIT, skip = false) {
  const query = useGetTrendsQuery(limit, { skip });
  return useVisibleTrends(query);
}

export function useExploreTrends(
  category: ExploreCategory,
  limit: number,
  skip = false,
) {
  const query = useGetExploreTrendsQuery({ category, limit }, { skip });
  return useVisibleTrends(query);
}

function useVisibleTrends(query: {
  currentData?: TrendRecommendationsResponse;
  isLoading: boolean;
  isFetching: boolean;
  error?: unknown;
  refetch: () => unknown;
}) {
  const hidden = useAppSelector((state) => state.trendFeedback.hidden);
  const trends = useMemo(
    () => (query.currentData?.items ?? EMPTY_TRENDS).filter((trend) => !Object.hasOwn(hidden, trend.id)), [query.currentData, hidden],
  );
  return {
    trends,
    isLoading: query.isLoading || (query.isFetching && !query.currentData),
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
  };
}

export function useRecommendedUsers(limit: number) {
  const query = useGetRecommendedUsersInfiniteQuery(limit);
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
    nextCursor: query.hasNextPage ? query.data?.pages.at(-1)?.nextCursor ?? null : null,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
    loadMore: query.fetchNextPage,
  };
}
