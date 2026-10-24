import { useEffect, useMemo, useRef } from "react";

import { EXPLORE_LIMITS } from "@/constants/explore";

import {
  errorMessage,
  useGetRecommendedPostsInfiniteQuery,
  targetKey,
  targetOf,
} from "@/store/postsApi";

export function useRecommendedPosts() {
  const query = useGetRecommendedPostsInfiniteQuery(EXPLORE_LIMITS.POSTS);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const nextPagePending = useRef(false);

  const canLoadMore =
    Boolean(query.hasNextPage) &&
    !query.isLoading &&
    !query.isFetching &&
    !query.error;
  const fetchNextPage = query.fetchNextPage;
  const pageCount = query.data?.pages.length ?? 0;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!canLoadMore || !target || typeof IntersectionObserver === "undefined")
      return;

    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !active ||
          nextPagePending.current ||
          !entries.some((entry) => entry.isIntersecting)
        )
          return;

        nextPagePending.current = true;
        const release = () => {
          nextPagePending.current = false;
        };
        // Request errors are rendered from RTK Query state, including failed next pages.
        void fetchNextPage().then(release, release);
      },
      { rootMargin: "0px 0px 400px 0px" },
    );

    observer.observe(target);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [canLoadMore, fetchNextPage, pageCount]);

  const tweets = useMemo(() => {
    const known = new Set<string>();

    return (query.data?.pages.flatMap((page) => page.items) ?? []).filter(
      (tweet) => {
        const key = targetKey(targetOf(tweet));
        if (known.has(key)) return false;

        known.add(key);

        return true;
      },
    );
  }, [query.data]);

  return {
    tweets,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
    loadMore: query.fetchNextPage,
    loadMoreRef,
    retry:
      query.direction === "forward" && pageCount > 0
        ? query.fetchNextPage
        : query.refetch,
  };
}
