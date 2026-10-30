import { useEffect, useMemo, useRef } from "react";

import { useNotificationPollingOptions } from "@/hooks/notifications/useNotificationPollingOptions";

import { errorMessage } from "@/store/appApi";
import { useGetNotificationsInfiniteQuery } from "@/store/notificationQueries";

import type { NotificationTab } from "@/types/notification";

export function useNotifications(tab: NotificationTab) {
  const pollingOptions = useNotificationPollingOptions();
  const query = useGetNotificationsInfiniteQuery(tab, pollingOptions);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const fetchNextPage = query.fetchNextPage;
  const canLoadMore = query.hasNextPage && !query.isFetching && !query.error;
  const pageCount = query.currentData?.pages.length ?? 0;

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !canLoadMore || typeof IntersectionObserver === "undefined")
      return;

    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !active ||
          pending.current ||
          !entries.some((entry) => entry.isIntersecting)
        )
          return;
        pending.current = true;
        const release = () => {
          pending.current = false;
        };
        void fetchNextPage().then(release, release);
      },
      { rootMargin: "0px 0px 400px 0px" },
    );
    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [canLoadMore, fetchNextPage, pageCount, tab]);

  const items = useMemo(() => {
    const known = new Set<string>();
    return (
      query.currentData?.pages.flatMap((page) =>
        page.items.map((item) => ({ item, readThrough: page.readThrough })),
      ) ?? []
    ).filter(({ item }) => {
      if (known.has(item.id)) return false;
      known.add(item.id);
      return true;
    });
  }, [query.currentData]);

  return {
    items,
    readThrough: query.currentData?.pages[0]?.readThrough,
    isLoading: query.isFetching && !query.currentData,
    isFetching: query.isFetching,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    error: query.error ? errorMessage(query.error) : null,
    loadMoreRef,
    loadMore: query.fetchNextPage,
    retry:
      query.direction === "forward" && pageCount > 0
        ? query.fetchNextPage
        : query.refetch,
  };
}
