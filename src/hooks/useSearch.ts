import { useMemo } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
  const debounced = useDebouncedValue<SearchCriteria | null>(
    criteria,
    SEARCH_DEBOUNCE_MS,
    null,
  );

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
    args && criteria.type === "posts" ? { kind: "search", ...args } : skipToken,
  );
  const users = useGetSearchUsersQuery(
    args && criteria.type === "users" ? args : skipToken,
  );
  const active = criteria.type === "posts" ? posts : users;
  const error = active.error;

  return {
    users:
      enabled && criteria.type === "users"
        ? (users.currentData ?? EMPTY_USERS)
        : EMPTY_USERS,
    posts:
      enabled && criteria.type === "posts"
        ? (posts.currentData ?? EMPTY_POSTS)
        : EMPTY_POSTS,
    isLoading: hasCriteria && (!enabled || active.isFetching),
    error: enabled && error ? errorMessage(error) : null,
  };
}
