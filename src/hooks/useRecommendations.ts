import { useCallback, useEffect, useState } from "react";

import { recommendationsApi } from "@/api";

import type {
  RecommendationCategory,
  TrendRecommendation,
  UserShort,
} from "@/types";

export function useTrends(limit = 4) {
  const [trends, setTrends] = useState<TrendRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recommendationsApi.trends(limit);
      setTrends(response.items ?? []);
    } catch (requestError) {
      setTrends([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося завантажити популярні теми.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return { trends, isLoading, error, reload };
}

export function useRecommendedUsers(
  category: RecommendationCategory,
  limit: number,
) {
  const [users, setUsers] = useState<UserShort[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recommendationsApi.users(category, limit);
      setUsers(response.items ?? []);
      setNextCursor(response.nextCursor ?? null);
    } catch (requestError) {
      setUsers([]);
      setNextCursor(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося завантажити рекомендації.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await recommendationsApi.users(
        category,
        limit,
        nextCursor,
      );

      setUsers((current) => {
        const knownIds = new Set(current.map((user) => user.id));
        return [
          ...current,
          ...response.items.filter((user) => !knownIds.has(user.id)),
        ];
      });
      setNextCursor(response.nextCursor ?? null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося завантажити більше рекомендацій.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [category, isLoadingMore, limit, nextCursor]);

  return {
    users,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    reload,
    loadMore,
  };
}
