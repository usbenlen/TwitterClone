import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { SEARCH_DEBOUNCE_MS } from "@/constants/app";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { hasActiveSearchCriteria } from "@/utils/search";
import {
  useGetPostsQuery,
  useGetSearchUsersQuery,
  errorMessage,
} from "@/store/postsApi";
import type { SearchCriteria, Tweet, UserShort } from "@/types";
const EMPTY_POSTS: Tweet[] = [];
const EMPTY_USERS: UserShort[] = [];

export function useSearch(criteria: SearchCriteria) {
  const { user } = useAuth();
  const { following } = useFollow();
  const [debounced, setDebounced] = useState<SearchCriteria | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebounced(criteria),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [criteria]);

  const hasCriteria = hasActiveSearchCriteria(criteria);
  const enabled = hasCriteria && debounced === criteria;

  const args = useMemo(() => {
    if (!enabled || !debounced) return null;

    return {
      criteria: debounced,
      viewer: {
        followingIds: following.map((item) => item.id),
        location: user?.location,
      },
    };
  }, [debounced, enabled, following, user?.location]);

  const posts = useGetPostsQuery(
    args ? { kind: "search", ...args } : skipToken,
  );
  const users = useGetSearchUsersQuery(args ?? skipToken);
  const error = posts.error ?? users.error;

  return {
    users: enabled ? (users.currentData ?? EMPTY_USERS) : EMPTY_USERS,
    posts: enabled ? (posts.currentData ?? EMPTY_POSTS) : EMPTY_POSTS,
    isLoading:
      hasCriteria && (!enabled || posts.isFetching || users.isFetching),
    error: enabled && error ? errorMessage(error) : null,
  };
}
