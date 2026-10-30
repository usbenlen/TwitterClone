import { skipToken } from "@reduxjs/toolkit/query/react";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useGetPostsQuery,
  useGetSearchUsersQuery,
} from "@/features/content/api/postQueries";
import { hasActiveSearchCriteria } from "@/features/discovery/lib/searchCriteria";
import { useFollow } from "@/features/profiles/hooks/useFollow";
import { SEARCH_DEBOUNCE_MS } from "@/shared/constants/interaction";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { errorMessage } from "@/shared/store/appApi";

import type { Post } from "@/features/content/types";
import type { SearchCriteria } from "@/features/discovery/types";
import type { UserShort } from "@/features/profiles/types";

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
