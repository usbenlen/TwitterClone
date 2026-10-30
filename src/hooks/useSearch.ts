import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";

import { SEARCH_DEBOUNCE_MS } from "@/constants/interaction";

import { useAuth } from "@/hooks/auth/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFollow } from "@/hooks/profiles/useFollow";

import { hasActiveSearchCriteria } from "@/utils/searchCriteria";

import { useGetPostsQuery, useGetSearchUsersQuery } from "@/store/posts/postQueries";
import { errorMessage } from "@/store/appApi";

import type { SearchCriteria, Post, UserShort } from "@/types";

const EMPTY_POSTS: Post[] = [];
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
